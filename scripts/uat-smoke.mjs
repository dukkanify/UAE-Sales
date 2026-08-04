/**
 * Comprehensive UAT / QA smoke harness for ATPL PASS.
 * Usage: node scripts/uat-smoke.mjs [baseUrl]
 *
 * Covers role workflows across auth, learning, classes, quizzes, certificates,
 * communication, payments, analytics, AI, and ops (where permitted).
 */

const BASE = process.argv[2] || "http://localhost:3000";

const DEMO = {
  student: "student.one@eagerpilots.com",
  instructor: "instructor.one@eagerpilots.com",
  admin: "admin@eagerpilots.com",
  superadmin: "superadmin@eagerpilots.com",
  otp: "123456",
};

function cookieJar() {
  const jar = new Map();
  return {
    store(res) {
      const raw = res.headers.getSetCookie?.() || [];
      for (const c of raw) {
        const [pair] = c.split(";");
        const eq = pair.indexOf("=");
        if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
      }
    },
    header() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    csrf() {
      const v = jar.get("aep_csrf");
      return v ? decodeURIComponent(v) : null;
    },
  };
}

async function login(email) {
  const jar = cookieJar();
  let res = await fetch(`${BASE}/login`);
  jar.store(res);
  res = await fetch(`${BASE}/api/auth/otp/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: jar.header(),
      ...(jar.csrf() ? { "x-csrf-token": jar.csrf() } : {}),
    },
    body: JSON.stringify({ email, purpose: "login", rememberMe: true }),
  });
  jar.store(res);
  const reqBody = await res.json();
  if (!reqBody.success) throw new Error(`OTP request failed: ${reqBody.error}`);

  res = await fetch(`${BASE}/api/auth/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: jar.header(),
      ...(jar.csrf() ? { "x-csrf-token": jar.csrf() } : {}),
    },
    body: JSON.stringify({ email, token: DEMO.otp, purpose: "login" }),
  });
  jar.store(res);
  const body = await res.json();
  if (!body.success) throw new Error(`OTP verify failed: ${body.error}`);
  return { jar, user: body.data?.user };
}

async function api(jar, path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (jar.csrf()) headers.set("x-csrf-token", jar.csrf());
  headers.set("Cookie", jar.header());
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  jar.store(res);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html page */
  }
  return { res, json, text };
}

async function expectOk(jar, path, label) {
  const { res, json } = await api(jar, path);
  if (!res.ok || (json && json.success === false)) {
    throw new Error(`${label || path}: ${json?.error || res.status}`);
  }
  return json;
}

async function expectPage(jar, path, label) {
  const { res } = await api(jar, path);
  if (res.status >= 500) throw new Error(`${label || path}: HTTP ${res.status}`);
  // 200 or role redirect 307/308 ok
  if (![200, 307, 308, 302].includes(res.status)) {
    throw new Error(`${label || path}: unexpected ${res.status}`);
  }
}

const results = [];
async function check(name, fn) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - start });
    console.log(`PASS  ${name} (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({ name, ok: false, ms: Date.now() - start, error: String(error.message || error) });
    console.error(`FAIL  ${name}: ${error.message || error}`);
  }
}

async function main() {
  console.log(`UAT smoke against ${BASE}\n`);

  await check("public health", async () => {
    const res = await fetch(`${BASE}/api/health`);
    const json = await res.json();
    if (!res.ok) throw new Error(res.status);
    if (json.authStore) throw new Error("health leaked authStore");
  });

  await check("public readiness", async () => {
    const res = await fetch(`${BASE}/api/health?ready=1`);
    const json = await res.json();
    if (typeof json.ready !== "boolean") throw new Error("missing ready");
  });

  await check("public pages", async () => {
    for (const p of ["/", "/login", "/register", "/verify/certificate"]) {
      const res = await fetch(`${BASE}${p}`);
      if (res.status >= 500) throw new Error(`${p} ${res.status}`);
    }
  });

  // --- Student ---
  let student;
  await check("student login", async () => {
    student = await login(DEMO.student);
    if (student.user?.role !== "student") throw new Error(`role ${student.user?.role}`);
  });

  await check("student learning APIs", async () => {
    await expectOk(student.jar, "/api/learning/dashboard");
    await expectOk(student.jar, "/api/learning/courses");
    await expectOk(student.jar, "/api/learning/planner/goals");
    await expectOk(student.jar, "/api/learning/notes");
  });

  await check("student classes/calendar", async () => {
    await expectOk(student.jar, "/api/classes/calendar");
    await expectOk(student.jar, "/api/classes/stats");
  });

  await check("student quizzes/certificates", async () => {
    await expectOk(student.jar, "/api/quizzes");
    await expectOk(student.jar, "/api/certificates");
    await expectOk(student.jar, "/api/reports/progress");
  });

  await check("student communication", async () => {
    await expectOk(student.jar, "/api/communication/announcements");
    await expectOk(student.jar, "/api/communication/communities");
    await expectOk(student.jar, "/api/communication/conversations");
  });

  await check("student payments", async () => {
    await expectOk(student.jar, "/api/payments/catalog");
    await expectOk(student.jar, "/api/payments/orders");
  });

  await check("student analytics + AI", async () => {
    await expectOk(student.jar, "/api/analytics/overview?scope=student");
    await expectOk(student.jar, "/api/ai/chat?view=bootstrap");
    await expectOk(student.jar, "/api/ai/recommendations");
  });

  await check("student pages", async () => {
    for (const p of [
      "/student/dashboard",
      "/student/courses",
      "/student/planner",
      "/student/ai",
      "/student/analytics",
      "/student/billing",
    ]) {
      await expectPage(student.jar, p);
    }
  });

  await check("student cannot access finance analytics", async () => {
    const { json } = await api(student.jar, "/api/analytics/overview?scope=financial");
    if (json?.success) throw new Error("student accessed financial analytics");
  });

  await check("student cannot access ops", async () => {
    const { json } = await api(student.jar, "/api/ops?view=checklist");
    if (json?.success) throw new Error("student accessed ops");
  });

  // --- Instructor ---
  let instructor;
  await check("instructor login", async () => {
    instructor = await login(DEMO.instructor);
    if (instructor.user?.role !== "instructor") throw new Error(instructor.user?.role);
  });

  await check("instructor courses/classes/quizzes", async () => {
    await expectOk(instructor.jar, "/api/courses");
    await expectOk(instructor.jar, "/api/classes");
    await expectOk(instructor.jar, "/api/quizzes");
    await expectOk(instructor.jar, "/api/reports/overview?scope=instructor");
  });

  await check("instructor wallet + AI", async () => {
    await expectOk(instructor.jar, "/api/payments/wallet");
    await expectOk(instructor.jar, "/api/ai/chat?view=bootstrap");
    const write = await api(instructor.jar, "/api/ai/write", {
      method: "POST",
      body: JSON.stringify({ kind: "announcement", topic: "UAT live class reminder" }),
    });
    if (!write.json?.success) throw new Error(write.json?.error || "write failed");
  });

  await check("instructor pages", async () => {
    for (const p of [
      "/instructor/dashboard",
      "/instructor/courses",
      "/instructor/classes",
      "/instructor/wallet",
      "/instructor/ai",
      "/instructor/analytics",
    ]) {
      await expectPage(instructor.jar, p);
    }
  });

  // --- Admin ---
  let admin;
  await check("admin login", async () => {
    admin = await login(DEMO.admin);
    if (admin.user?.role !== "admin") throw new Error(admin.user?.role);
  });

  await check("admin management APIs", async () => {
    await expectOk(admin.jar, "/api/users");
    await expectOk(admin.jar, "/api/courses");
    await expectOk(admin.jar, "/api/courses/stats");
    await expectOk(admin.jar, "/api/communication/tickets");
    await expectOk(admin.jar, "/api/analytics/overview?scope=learning");
  });

  await check("admin pages", async () => {
    for (const p of ["/admin/dashboard", "/admin/courses", "/admin/analytics", "/admin/ai", "/admin/payments"]) {
      await expectPage(admin.jar, p);
    }
  });

  // --- Super Admin ---
  let sa;
  await check("superadmin login", async () => {
    sa = await login(DEMO.superadmin);
    if (sa.user?.role !== "super_admin") throw new Error(sa.user?.role);
  });

  await check("superadmin settings/monitoring", async () => {
    await expectOk(sa.jar, "/api/admin/settings");
    await expectOk(sa.jar, "/api/admin/monitoring");
    await expectOk(sa.jar, "/api/admin/activity-logs");
  });

  await check("superadmin analytics/finance/AI/ops", async () => {
    await expectOk(sa.jar, "/api/analytics/overview?scope=executive");
    await expectOk(sa.jar, "/api/analytics/overview?scope=financial");
    await expectOk(sa.jar, "/api/analytics/health");
    await expectOk(sa.jar, "/api/payments/reports");
    await expectOk(sa.jar, "/api/ai/insights");
    await expectOk(sa.jar, "/api/ops?view=checklist");
    await expectOk(sa.jar, "/api/ops?view=logs&limit=20");
  });

  await check("superadmin backup create + test", async () => {
    const create = await api(sa.jar, "/api/ops", {
      method: "POST",
      body: JSON.stringify({ action: "backup", retention: "daily", notes: "uat" }),
    });
    if (!create.json?.success) throw new Error(create.json?.error || "backup failed");
    const id = create.json.data.id;
    const test = await api(sa.jar, "/api/ops", {
      method: "POST",
      body: JSON.stringify({ action: "test_restore", backupId: id }),
    });
    if (!test.json?.success || !test.json.data?.ok) {
      throw new Error(test.json?.error || "restore test failed");
    }
  });

  await check("superadmin pages", async () => {
    for (const p of [
      "/super-admin/dashboard",
      "/super-admin/settings",
      "/super-admin/monitoring",
      "/super-admin/system-logs",
      "/super-admin/analytics",
      "/super-admin/ai",
      "/super-admin/payments",
    ]) {
      await expectPage(sa.jar, p);
    }
  });

  await check("CSRF rejects bare mutating call", async () => {
    const jar = cookieJar();
    await fetch(`${BASE}/login`).then((r) => jar.store(r));
    // login fully to get session then strip csrf header
    const authed = await login(DEMO.superadmin);
    const res = await fetch(`${BASE}/api/ops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authed.jar.header(),
        // intentionally omit x-csrf-token
      },
      body: JSON.stringify({ action: "backup", retention: "daily" }),
    });
    const json = await res.json();
    if (json.success) throw new Error("CSRF bypass allowed");
  });

  await check("permission escalation blocked", async () => {
    const { json } = await api(student.jar, "/api/admin/settings");
    if (json?.success) throw new Error("student reached settings");
  });

  // Performance sample
  await check("dashboard API latency budget", async () => {
    const start = Date.now();
    await expectOk(sa.jar, "/api/dashboard/metrics");
    const ms = Date.now() - start;
    if (ms > 5000) throw new Error(`too slow: ${ms}ms`);
  });

  const failed = results.filter((r) => !r.ok);
  const avg =
    results.reduce((s, r) => s + r.ms, 0) / Math.max(1, results.length);
  console.log(`\n${results.length - failed.length}/${results.length} passed · avg ${Math.round(avg)}ms`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(` - ${f.name}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
