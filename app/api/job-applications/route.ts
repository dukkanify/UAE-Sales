import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createJobApplication,
  findJobApplication,
  getJobApplicationsForUser,
} from "@/services/job-applications/job-application-store";
import { createNotification } from "@/services/payments/notification-store";
import {
  assertNotOwnListing,
  resolveServerListing,
  validateCvFileName,
} from "@/services/listings/listing-action-resolver";

const schema = z.object({
  listingId: z.string().min(1),
  listingTitle: z.string().min(1),
  listingSlug: z.string().optional(),
  applicantId: z.string().min(1),
  applicantName: z.string().min(2),
  applicantEmail: z.string().email(),
  phone: z.string().min(8),
  currentCity: z.string().min(1),
  yearsOfExperience: z.number().min(0).max(50),
  availabilityDate: z.string().min(1),
  coverMessage: z.string().min(20),
  cvFileName: z.string().min(1),
  employerId: z.string().min(1),
  employerName: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  if (!validateCvFileName(parsed.data.cvFileName)) {
    return NextResponse.json({ error: "INVALID_CV_TYPE" }, { status: 400 });
  }

  const listing = resolveServerListing(parsed.data.listingId);
  if (listing && listing.categoryId !== "jobs") {
    return NextResponse.json({ error: "INVALID_LISTING_TYPE" }, { status: 400 });
  }

  const ownError = assertNotOwnListing(
    listing,
    parsed.data.applicantId,
    parsed.data.employerId,
  );
  if (ownError) {
    return NextResponse.json({ error: ownError }, { status: 403 });
  }

  const payload = { ...parsed.data };

  if (listing) {
    payload.employerId = listing.seller.id;
    payload.employerName = listing.seller.name;
    payload.listingTitle = listing.title;
    payload.listingSlug = listing.slug;
  }

  const existing = await findJobApplication(
    payload.applicantId,
    payload.listingId,
  );
  if (existing) {
    return NextResponse.json({ error: "DUPLICATE_APPLICATION" }, { status: 409 });
  }

  const application = await createJobApplication(payload);

  await Promise.all([
    createNotification({
      userId: payload.applicantId,
      type: "job_application",
      title: "تم إرسال طلب التوظيف",
      body: `تم إرسال طلبك على وظيفة «${payload.listingTitle}» بنجاح.`,
    }),
    createNotification({
      userId: payload.employerId,
      type: "job_application",
      title: "طلب توظيف جديد",
      body: `${payload.applicantName} قدّم على وظيفة «${payload.listingTitle}».`,
    }),
  ]);

  return NextResponse.json({ application });
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const applications = await getJobApplicationsForUser(userId);
  return NextResponse.json({ applications });
}
