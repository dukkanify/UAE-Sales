/**
 * Mock Exam Booking System (CR007) — independent module.
 * Sourced from the Mock Exam document.
 */

export type MockExamSessionStatus =
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled"
  | "unable_to_schedule";

export type MockExamPricingMode = "fixed" | "dynamic";

export interface MockExamExtraFee {
  id: string;
  code: string;
  label: string;
  /** Amount in minor units (fils) */
  amount: number;
  active: boolean;
  /** Apply automatically when selected or always */
  autoApply: boolean;
}

export interface MockExamType {
  id: string;
  code: string;
  name: string;
  description: string;
  durationMinutes: number;
  /** Base price in minor units */
  basePrice: number;
  active: boolean;
  /** Peak multiplier for dynamic pricing (e.g. 1.25) */
  peakMultiplier: number;
  /** Off-peak multiplier (e.g. 0.9) */
  offPeakMultiplier: number;
}

export interface MockExamWorkingHours {
  /** 0=Sun … 6=Sat */
  weekday: number;
  startHour: number;
  endHour: number;
  active: boolean;
}

export interface MockExamSettings {
  enabled: boolean;
  currency: string;
  timezone: string;
  pricingMode: MockExamPricingMode;
  /** Peak hours (UTC) when dynamic pricing applies peak multiplier */
  peakStartHour: number;
  peakEndHour: number;
  slotStepMinutes: number;
  bufferMinutes: number;
  maxAdvanceDays: number;
  minNoticeMinutes: number;
  autoCreateZoom: boolean;
  zoomWaitingRoom: boolean;
  zoomPasscode: boolean;
  autoIssueCertificate: boolean;
  /** Empty = all active instructors */
  examinerIds: string[];
  workingHours: MockExamWorkingHours[];
  blackoutDates: string[];
  taxRatePercent: number;
  updatedAt: string;
}

export interface MockExamZoomSession {
  meetingNumber: string;
  joinUrl: string;
  startUrl: string;
  password: string;
  waitingRoom: boolean;
  providerMode: "mock" | "zoom";
  provisionedAt: string;
}

export interface MockExamFeeLine {
  code: string;
  label: string;
  amount: number;
}

export interface MockExamPriceQuote {
  examTypeId: string;
  startsAt: string;
  currency: string;
  baseAmount: number;
  pricingMode: MockExamPricingMode;
  multiplier: number;
  adjustedBase: number;
  extraFees: MockExamFeeLine[];
  extrasTotal: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface MockExamCertificate {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  examTypeName: string;
  scorePercent: number | null;
  passed: boolean;
  verificationCode: string;
  issuedAt: string;
  htmlSnapshot: string;
}

export interface MockExamSession {
  id: string;
  examTypeId: string;
  examTypeName: string;
  studentId: string;
  examinerId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: MockExamSessionStatus;
  timezone: string;
  currency: string;
  quote: MockExamPriceQuote;
  selectedExtraFeeIds: string[];
  zoom: MockExamZoomSession | null;
  certificateId: string | null;
  scorePercent: number | null;
  passed: boolean | null;
  completionNotes: string | null;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockExamSessionWithNames extends MockExamSession {
  studentName: string | null;
  studentEmail: string | null;
  examinerName: string | null;
}

export interface MockExamSlot {
  startsAt: string;
  endsAt: string;
  available: boolean;
  reason?: string;
  quote?: MockExamPriceQuote;
}
