/**
 * Acceptance smoke harness — run against a live `npm run dev` server.
 * Usage: node scripts/acceptance-smoke.mjs [baseUrl]
 */

const BASE = process.argv[2] || "http://localhost:3000";

async function main() {
  const results = [];
  const check = async (name, fn) => {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`PASS  ${name}`);
    } catch (error) {
      results.push({ name, ok: false, error: String(error.message || error) });
      console.error(`FAIL  ${name}: ${error.message || error}`);
    }
  };

  await check("health", async () => {
    const res = await fetch(`${BASE}/api/health`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = await res.json();
    if (!json.status) throw new Error("missing status");
    if (json.authStore) throw new Error("health leaked authStore");
  });

  await check("health ready", async () => {
    const res = await fetch(`${BASE}/api/health?ready=1`);
    const json = await res.json();
    if (typeof json.ready !== "boolean") throw new Error("missing ready");
  });

  await check("login page", async () => {
    const res = await fetch(`${BASE}/login`);
    if (!res.ok) throw new Error(`status ${res.status}`);
  });

  await check("student auth + modules", async () => {
    const jar = new Map();
    const storeCookies = (res) => {
      const raw = res.headers.getSetCookie?.() || [];
      for (const c of raw) {
        const [pair] = c.split(";");
        const [k, v] = pair.split("=");
        jar.set(k, v);
      }
    };
    const cookieHeader = () =>
      [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

    let res = await fetch(`${BASE}/login`);
    storeCookies(res);
    const csrf = jar.get("aep_csrf");
    res = await fetch(`${BASE}/api/auth/otp/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader(),
        ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify({
        email: "student.one@eagerpilots.com",
        purpose: "login",
        rememberMe: true,
      }),
    });
    storeCookies(res);
    const csrf2 = jar.get("aep_csrf");
    res = await fetch(`${BASE}/api/auth/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader(),
        ...(csrf2 ? { "x-csrf-token": decodeURIComponent(csrf2) } : {}),
      },
      body: JSON.stringify({
        email: "student.one@eagerpilots.com",
        token: "123456",
        purpose: "login",
      }),
    });
    storeCookies(res);
    const login = await res.json();
    if (!login.success) throw new Error(login.error || "login failed");

    for (const path of [
      "/api/learning/dashboard",
      "/api/ai/chat?view=bootstrap",
      "/api/analytics/overview?scope=student",
    ]) {
      const r = await fetch(`${BASE}${path}`, { headers: { Cookie: cookieHeader() } });
      const j = await r.json();
      if (!j.success) throw new Error(`${path}: ${j.error}`);
    }
  });

  await check("superadmin ops", async () => {
    const jar = new Map();
    const storeCookies = (res) => {
      const raw = res.headers.getSetCookie?.() || [];
      for (const c of raw) {
        const [pair] = c.split(";");
        const [k, v] = pair.split("=");
        jar.set(k, v);
      }
    };
    const cookieHeader = () =>
      [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

    let res = await fetch(`${BASE}/login`);
    storeCookies(res);
    let csrf = jar.get("aep_csrf");
    res = await fetch(`${BASE}/api/auth/otp/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader(),
        ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify({
        email: "superadmin@eagerpilots.com",
        purpose: "login",
        rememberMe: true,
      }),
    });
    storeCookies(res);
    csrf = jar.get("aep_csrf");
    res = await fetch(`${BASE}/api/auth/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader(),
        ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify({
        email: "superadmin@eagerpilots.com",
        token: "123456",
        purpose: "login",
      }),
    });
    storeCookies(res);
    const login = await res.json();
    if (!login.success) throw new Error(login.error || "sa login failed");

    res = await fetch(`${BASE}/api/ops?view=checklist`, {
      headers: { Cookie: cookieHeader() },
    });
    const checklist = await res.json();
    if (!checklist.success) throw new Error(checklist.error);

    res = await fetch(`${BASE}/api/ops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader(),
        ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify({ action: "backup", retention: "daily", notes: "acceptance" }),
    });
    storeCookies(res);
    const backup = await res.json();
    if (!backup.success) throw new Error(backup.error || "backup failed");
  });

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
