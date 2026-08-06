import { describe, expect, it } from "vitest";

import { isStudentProfileComplete } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";

describe("isStudentProfileComplete", () => {
  it("requires only names for instructors", () => {
    expect(
      isStudentProfileComplete({
        role: ROLES.INSTRUCTOR,
        firstName: "Sara",
        lastName: "Ali",
        phone: null,
        countryCode: null,
        nationality: null,
      }),
    ).toBe(true);
  });

  it("requires phone, country, and nationality for students", () => {
    expect(
      isStudentProfileComplete({
        role: ROLES.STUDENT,
        firstName: "Omar",
        lastName: "Khalil",
        phone: null,
        countryCode: "EG",
        nationality: "Egyptian",
      }),
    ).toBe(false);

    expect(
      isStudentProfileComplete({
        role: ROLES.STUDENT,
        firstName: "Omar",
        lastName: "Khalil",
        phone: "+201001112233",
        countryCode: "EG",
        nationality: "Egyptian",
      }),
    ).toBe(true);
  });
});
