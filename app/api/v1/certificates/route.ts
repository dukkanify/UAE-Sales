import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { listCertificates } from "@/services/certificates/certificate-service";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  return ok(listCertificates({ studentId: ctx.user.id }));
});
