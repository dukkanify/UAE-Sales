import { describe, expect, it, beforeEach } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import {
  confirmBookingPayment,
  getPublicBookingCatalog,
  listBookableInstructorsForSession,
} from "@/services/bookings/booking-service";
import { writeBookingsDb } from "@/services/bookings/store";

describe("private session booking services", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    writeBookingsDb((db) => {
      db.settings.sessionTypes = db.settings.sessionTypes.map((t) =>
        t.id === "st_coaching"
          ? {
              ...t,
              instructorIds: [],
              paymentRequired: true,
              priceAmountMinor: 25000,
            }
          : t,
      );
    });
  });

  it("exposes dynamic services with per-service instructors in public catalog", () => {
    const catalog = getPublicBookingCatalog();
    expect(catalog.sessionTypes.length).toBeGreaterThanOrEqual(6);
    const coaching = catalog.sessionTypes.find((t) => t.id === "st_coaching");
    expect(coaching?.name).toBe("Private Coaching");
    expect(coaching?.instructors.length).toBeGreaterThan(0);
    expect(coaching?.paymentRequired).toBe(true);
  });

  it("filters instructors assigned to a session type", () => {
    const instructors = listBookableInstructorsForSession("st_coaching");
    expect(instructors.length).toBeGreaterThan(0);
  });

  it("confirms pending_payment bookings after payment", async () => {
    ensureDemoUsersSeeded();
    const student = ensureDemoUsersSeeded();
    void student;

    const bookingId = "bk_test_pay";
    writeBookingsDb((db) => {
      db.bookings.unshift({
        id: bookingId,
        studentId: "user_student_one",
        instructorId: "user_instructor_one",
        sessionTypeId: "st_coaching",
        sessionTypeName: "Private Coaching",
        title: "Private Coaching",
        notes: "",
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        status: "pending_payment",
        zoom: null,
        guestEmail: null,
        guestFirstName: null,
        guestLastName: null,
        guestVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cancelledAt: null,
        cancelledBy: null,
        cancelReason: null,
        priceAmountMinor: 25000,
        currency: "KWD",
        paymentRequired: true,
        paymentOrderId: null,
        paidAt: null,
      });
    });

    const confirmed = await confirmBookingPayment({
      bookingId,
      userId: "user_student_one",
      paymentOrderId: "ord_test",
    });
    expect(confirmed.status).toBe("confirmed");
    expect(confirmed.paidAt).toBeTruthy();
  });
});
