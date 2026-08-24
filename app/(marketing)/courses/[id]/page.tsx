import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";

type PageProps = { params: Promise<{ id: string }> };

/** Individual course pages are consolidated into the single ATPL Program. */
export default async function PublicCourseDetailRedirect({ params }: PageProps) {
  await params;
  redirect(routes.courses);
}
