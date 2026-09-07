/**
 * Auth regression tests — register/login password round-trip must never break.
 * Run: npm test
 */
import assert from "node:assert/strict";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import test from "node:test";

const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER ?? "sooqna-password-pepper";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(`${PASSWORD_PEPPER}:${password}`, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(`${PASSWORD_PEPPER}:${password}`, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** Minimal in-memory stand-in for auth_users register→login. */
class FakeAuthStore {
  constructor() {
    this.users = new Map();
  }

  register(emailRaw, passwordRaw) {
    const email = emailRaw.trim().toLowerCase();
    const password = passwordRaw.trim();
    assert.ok(!this.users.has(email), "email already registered");
    this.users.set(email, {
      email,
      passwordHash: hashPassword(password),
      accountStatus: "pending",
    });
    return email;
  }

  verifyEmail(email) {
    const user = this.users.get(email.trim().toLowerCase());
    assert.ok(user);
    user.emailVerifiedAt = new Date().toISOString();
    user.accountStatus = "active";
  }

  login(emailRaw, passwordRaw) {
    const email = emailRaw.trim().toLowerCase();
    const password = passwordRaw.trim();
    const user = this.users.get(email);
    if (!user) return { ok: false, error: "INVALID_CREDENTIALS" };
    if (!user.passwordHash) return { ok: false, error: "PASSWORD_NOT_SET" };
    if (!verifyPassword(password, user.passwordHash)) {
      return { ok: false, error: "INVALID_CREDENTIALS" };
    }
    if (user.accountStatus === "pending" && !user.emailVerifiedAt) {
      return { ok: false, error: "ACCOUNT_UNVERIFIED" };
    }
    if (user.accountStatus === "suspended") {
      return { ok: false, error: "ACCOUNT_SUSPENDED" };
    }
    return { ok: true, email: user.email };
  }

  resetPassword(emailRaw, newPasswordRaw) {
    const email = emailRaw.trim().toLowerCase();
    const password = newPasswordRaw.trim();
    const user = this.users.get(email);
    assert.ok(user);
    user.passwordHash = hashPassword(password);
  }
}

test("register → verify → logout → login with SAME password succeeds", () => {
  const store = new FakeAuthStore();
  const email = "qa.auth.roundtrip@example.com";
  const password = "SecurePass1";
  store.register(email, password);
  assert.equal(store.login(email, password).error, "ACCOUNT_UNVERIFIED");
  store.verifyEmail(email);
  assert.equal(store.login(email, password).ok, true);
  assert.equal(store.login(` ${email.toUpperCase()} `, ` ${password} `).ok, true);
});

test("wrong password returns INVALID_CREDENTIALS after successful register", () => {
  const store = new FakeAuthStore();
  const email = "qa.auth.wrongpass@example.com";
  store.register(email, "SecurePass1");
  store.verifyEmail(email);
  assert.equal(store.login(email, "WrongPass1").error, "INVALID_CREDENTIALS");
  assert.equal(store.login(email, "SecurePass1").ok, true);
});

test("password reset → old fails → new succeeds → logout → new succeeds", () => {
  const store = new FakeAuthStore();
  const email = "qa.auth.reset@example.com";
  store.register(email, "OldSecure1");
  store.verifyEmail(email);
  assert.equal(store.login(email, "OldSecure1").ok, true);
  store.resetPassword(email, "NewSecure2");
  assert.equal(store.login(email, "OldSecure1").error, "INVALID_CREDENTIALS");
  assert.equal(store.login(email, "NewSecure2").ok, true);
  assert.equal(store.login(email, "NewSecure2").ok, true);
});

test("hash/verify are trim-consistent (complete-account bug regression)", () => {
  const password = "  SecurePass1  ";
  const trimmed = password.trim();
  const buggyHash = hashPassword(password);
  assert.equal(verifyPassword(trimmed, buggyHash), false);
  const goodHash = hashPassword(trimmed);
  assert.equal(verifyPassword(trimmed, goodHash), true);
});

test("user without passwordHash gets PASSWORD_NOT_SET not wrong-password", () => {
  const store = new FakeAuthStore();
  const email = "qa.auth.otp-only@example.com";
  store.register(email, "SecurePass1");
  const user = store.users.get(email);
  user.passwordHash = null;
  user.emailVerifiedAt = new Date().toISOString();
  user.accountStatus = "active";
  assert.equal(store.login(email, "SecurePass1").error, "PASSWORD_NOT_SET");
});

test("email normalization is case-insensitive and trimmed", () => {
  const store = new FakeAuthStore();
  store.register("  QA.Case@Example.COM ", "SecurePass1");
  store.verifyEmail("qa.case@example.com");
  assert.equal(store.login("QA.Case@Example.COM", "SecurePass1").ok, true);
});

assert.equal(createHash("sha256").update("sooqna-auth-regression").digest("hex").length, 64);
