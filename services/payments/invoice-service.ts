/**
 * Invoice generation and printable HTML (print-to-PDF).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { formatMinor } from "@/services/payments/money";
import { notifyPayment } from "@/services/payments/notify";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type { Invoice, Order, PaymentRecord } from "@/types/payments";
import { getPublicBrandConfig } from "@/services/settings/settings-service";

function nowIso() {
  return new Date().toISOString();
}

function nextInvoiceNumber(): string {
  const y = new Date().getFullYear();
  const n = readPaymentsDb().invoices.length + 1;
  return `INV-${y}-${String(n).padStart(5, "0")}`;
}

export function getInvoice(id: string): Invoice | null {
  return readPaymentsDb().invoices.find((i) => i.id === id) ?? null;
}

export function listInvoices(filters?: { studentId?: string }) {
  let rows = [...readPaymentsDb().invoices];
  if (filters?.studentId) rows = rows.filter((i) => i.studentId === filters.studentId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function issueInvoiceForOrder(
  order: Order,
  payment: PaymentRecord,
): Promise<Invoice> {
  const existing = readPaymentsDb().invoices.find((i) => i.orderId === order.id);
  if (existing) return existing;

  const stamp = nowIso();
  const invoice: Invoice = {
    id: generateId(),
    invoiceNumber: nextInvoiceNumber(),
    orderId: order.id,
    studentId: order.studentId,
    studentName: order.studentName,
    studentEmail: order.studentEmail,
    status: "paid",
    currency: order.currency,
    subtotalAmount: order.subtotalAmount,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    paymentMethodSummary: payment.paymentMethodSummary,
    items: order.items.map((item) => ({
      id: generateId(),
      description: item.productName,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      totalAmount: item.totalAmount,
    })),
    issuedAt: stamp,
    paidAt: stamp,
    pdfReady: true,
    emailedAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.invoices.unshift(invoice);
    const o = db.orders.find((x) => x.id === order.id);
    if (o) o.invoiceId = invoice.id;
    db.transactionLogs.unshift({
      id: generateId(),
      kind: "invoice",
      referenceId: invoice.id,
      actorId: null,
      studentId: order.studentId,
      instructorId: null,
      amount: invoice.totalAmount,
      currency: invoice.currency,
      description: `Invoice ${invoice.invoiceNumber} issued`,
      metadata: { orderId: order.id },
      createdAt: stamp,
    });
  });

  await notifyPayment(order.studentId, {
    title: "Invoice generated",
    body: `${invoice.invoiceNumber} for ${formatMinor(invoice.totalAmount, invoice.currency)} is ready.`,
    type: "invoice.generated",
    data: { invoiceId: invoice.id, orderId: order.id },
  });

  await logActivity({
    actorId: order.studentId,
    action: ACTIVITY_ACTIONS.INVOICE_ISSUED,
    entityType: "invoice",
    entityId: invoice.id,
  });

  return invoice;
}

export function renderInvoiceHtml(invoiceId: string): string {
  const invoice = getInvoice(invoiceId);
  if (!invoice) return "<p>Invoice not found</p>";
  const brand = getPublicBrandConfig();
  const rows = invoice.items
    .map(
      (i) =>
        `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${formatMinor(i.unitAmount, invoice.currency)}</td><td>${formatMinor(i.totalAmount, invoice.currency)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${invoice.invoiceNumber}</title>
<style>
  body{font-family:DM Sans,system-ui,sans-serif;color:#0B1F3A;margin:40px}
  h1{font-family:Plus Jakarta Sans,sans-serif}
  table{width:100%;border-collapse:collapse;margin-top:24px}
  th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
  .muted{color:#64748b;font-size:14px}
  .totals{margin-top:24px;max-width:320px;margin-left:auto}
  .totals div{display:flex;justify-content:space-between;margin:6px 0}
</style></head><body>
  <img src="${brand.logoUrl}" alt="logo" height="48"/>
  <h1>Invoice ${invoice.invoiceNumber}</h1>
  <p class="muted">${brand.platformName} · Issued ${invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString() : ""}</p>
  <p><strong>Bill to:</strong> ${invoice.studentName}<br/>${invoice.studentEmail}</p>
  <table><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatMinor(invoice.subtotalAmount, invoice.currency)}</span></div>
    <div><span>Discount</span><span>-${formatMinor(invoice.discountAmount, invoice.currency)}</span></div>
    <div><span>Tax</span><span>${formatMinor(invoice.taxAmount, invoice.currency)}</span></div>
    <div><strong>Total</strong><strong>${formatMinor(invoice.totalAmount, invoice.currency)}</strong></div>
    <div class="muted">Paid via ${invoice.paymentMethodSummary}</div>
  </div>
  <script>window.onload=()=>setTimeout(()=>window.print(),200)</script>
</body></html>`;
}
