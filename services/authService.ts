export async function requestLoginOtp(identifier: string) {
  return {
    identifier,
    otpRequested: true,
  };
}
