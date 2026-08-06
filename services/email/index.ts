export {
  sendEmail,
  isEmailDeliveryConfigured,
  type SendEmailInput,
  type SendEmailResult,
} from "@/services/email/mailer";
export {
  listOutboundEmails,
  getLatestOutboundTo,
  recordOutboundEmail,
  type OutboundEmailRecord,
} from "@/services/email/outbox";
