import { NextResponse } from "next/server";
import { isSessionUser } from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { hasAdminAction } from "@/services/auth/admin-permission-checks";
import { getAllUsers } from "@/services/auth/user-store";
import { getAllListings } from "@/services/listings/listing-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getAdminDisputes } from "@/services/admin/dispute-store";
import { logAdminAction } from "@/services/admin/admin-audit-store";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sheet(name: string, headers: string[], rows: string[][]): string {
  const headerRow = `<Row>${headers
    .map((h) => `<Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`)
    .join("")}</Row>`;
  const body = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => {
            const numeric = /^-?\d+(\.\d+)?$/.test(cell);
            return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${xmlEscape(cell)}</Data></Cell>`;
          })
          .join("")}</Row>`,
    )
    .join("");
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${headerRow}${body}</Table></Worksheet>`;
}

function rangeStartMs(range: string): number | null {
  const now = Date.now();
  if (range === "24h") return now - 24 * 60 * 60 * 1000;
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return null;
}

function inRange(iso: string | undefined, startMs: number | null): boolean {
  if (startMs == null) return true;
  if (!iso) return false;
  const ts = Date.parse(iso);
  return Number.isFinite(ts) && ts >= startMs;
}

/** Admin Excel export (SpreadsheetML .xls) for dashboard reports. */
export async function GET(request: Request) {
  const admin = await requireAdminPermission("reports");
  if (!isSessionUser(admin)) return admin;
  if (!hasAdminAction(admin, "reports", "export")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = new URL(request.url);
  const range = url.searchParams.get("range") ?? "30d";
  const generatedAt = new Date().toISOString();
  const startMs = rangeStartMs(range);

  const [users, listings, orders, disputes] = await Promise.all([
    getAllUsers(),
    getAllListings(),
    getAllOrders(),
    getAdminDisputes(),
  ]);

  const filteredUsers = users.filter((user) =>
    inRange(user.joinedAt ?? user.createdAt, startMs),
  );
  const filteredListings = listings.filter((listing) =>
    inRange(listing.postedAt, startMs),
  );
  const filteredOrders = orders.filter((order) => inRange(order.createdAt, startMs));
  const filteredDisputes = disputes.filter((dispute) =>
    inRange(dispute.createdAt, startMs),
  );

  const paid = filteredOrders.filter((order) => order.paymentStatus === "succeeded");
  const gmv = paid.reduce((sum, order) => sum + (order.fees?.total ?? 0), 0);
  const fees = paid.reduce((sum, order) => sum + (order.fees?.platformFee ?? 0), 0);

  const summaryRows = [
    ["range", range],
    ["generatedAt", generatedAt],
    ["currency", "AED"],
    ["totalUsers", String(filteredUsers.length)],
    ["totalListings", String(filteredListings.length)],
    ["totalOrders", String(filteredOrders.length)],
    ["gmv", String(gmv)],
    ["platformFees", String(fees)],
    ["paidOrders", String(paid.length)],
  ];

  const userRows = filteredUsers.slice(0, 5000).map((user) => [
    user.id,
    user.fullName,
    user.email,
    user.role ?? "user",
    user.accountStatus ?? "",
    user.joinedAt ?? user.createdAt ?? "",
  ]);

  const listingRows = filteredListings.slice(0, 5000).map((listing) => [
    listing.id,
    listing.title,
    listing.status,
    listing.categoryId,
    String(listing.price ?? 0),
    listing.seller?.id ?? "",
    listing.postedAt ?? "",
  ]);

  const orderRows = filteredOrders.slice(0, 5000).map((order) => [
    order.id,
    order.status,
    order.escrowStatus ?? "",
    String(order.fees?.total ?? 0),
    order.buyerId ?? "",
    order.sellerId ?? "",
    order.createdAt,
  ]);

  const paymentRows = filteredOrders.slice(0, 5000).map((order) => [
    order.id,
    order.stripePaymentIntentId ?? "",
    order.paymentStatus ?? order.status,
    String(order.fees?.total ?? 0),
    order.paidAt ?? "",
  ]);

  const escrowRows = filteredOrders
    .filter((order) => Boolean(order.escrowStatus))
    .slice(0, 5000)
    .map((order) => [
      order.id,
      order.escrowStatus ?? "",
      String(order.fees?.total ?? 0),
      order.sellerProofAt ?? "",
      order.buyerMatchConfirmedAt ?? "",
    ]);

  const disputeRows = filteredDisputes.slice(0, 5000).map((dispute) => [
    dispute.id,
    dispute.orderId,
    dispute.status,
    String(dispute.amount ?? 0),
    dispute.createdAt,
  ]);

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "export_excel",
    targetType: "reports",
    targetId: range,
    detail: `Excel export range=${range}`,
  });

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${sheet("Summary", ["key", "value"], summaryRows)}
${sheet("Users", ["id", "fullName", "email", "role", "status", "createdAt"], userRows)}
${sheet("Listings", ["id", "title", "status", "categoryId", "priceAED", "sellerId", "createdAt"], listingRows)}
${sheet("Orders", ["id", "status", "escrowStatus", "totalAED", "buyerId", "sellerId", "createdAt"], orderRows)}
${sheet("Payments", ["orderId", "transactionId", "status", "amountAED", "paidAt"], paymentRows)}
${sheet("Escrow", ["orderId", "escrowStatus", "amountAED", "sellerProofAt", "buyerConfirmAt"], escrowRows)}
${sheet("Disputes", ["id", "orderId", "status", "amountAED", "createdAt"], disputeRows)}
</Workbook>`;

  const filename = `sooqna-report-${range}-${generatedAt.slice(0, 10)}.xls`;
  return new NextResponse(workbook, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
