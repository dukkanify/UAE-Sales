export async function requestLoginOtp(identifier: string) {
  return {
    identifier,
    otpRequested: true,
  };
}

export async function registerUserDraft(user: {
  accountType: string;
  city: string;
  email: string;
  fullName: string;
  phone: string;
}) {
  return {
    ...user,
    verificationRequired: true,
  };
}
