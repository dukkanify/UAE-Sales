import { mockCurrentUser } from "./mockData";

export async function getCurrentUser() {
  return mockCurrentUser;
}

export async function updateUserProfileDraft(user: typeof mockCurrentUser) {
  return {
    ...user,
    saved: true,
  };
}
