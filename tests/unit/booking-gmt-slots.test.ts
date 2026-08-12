import { describe, expect, it } from "vitest";

import {
  formatSlotDateTime,
  formatSlotTime,
  utcHourFromIso,
} from "@/features/bookings/lib/slot-utils";
import { getAvailableSlots, listBookableInstructors } from "@/services/bookings/booking-service";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";

describe("booking studio GMT slots", () => {
  it("formats slot labels in GMT", () => {
    expect(formatSlotTime("2026-08-12T14:00:00.000Z")).toBe("14:00");
    expect(formatSlotDateTime("2026-08-12T14:00:00.000Z")).toContain("14:00 GMT");
    expect(utcHourFromIso("2026-08-12T14:00:00.000Z")).toBe(14);
  });

  it("seeds bookable instructors and returns open GMT slots", () => {
    ensureDemoUsersSeeded();
    const instructors = listBookableInstructors();
    expect(instructors.length).toBeGreaterThan(0);

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const date = tomorrow.toISOString().slice(0, 10);

    const slots = getAvailableSlots({
      date,
      instructorId: instructors[0]!.id,
      sessionTypeId: "st_mentoring",
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((s) => s.available)).toBe(true);
    expect(slots[0]!.startsAt.endsWith("Z")).toBe(true);
  });
});
