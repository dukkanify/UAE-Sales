#!/usr/bin/env node
/**
 * Enterprise Git status report — run after sync/push to verify repository health.
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function trySh(cmd) {
  try {
    return sh(cmd);
  } catch {
    return null;
  }
}

const branch = trySh("git rev-parse --abbrev-ref HEAD") ?? "unknown";
const detached = branch === "HEAD";
const lastCommit = trySh("git log -1 --format=%h %s") ?? "n/a";
const remoteUrl = trySh("git remote get-url origin") ?? "none";
const upstream =
  trySh("git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null") ?? "(none)";
const status = trySh("git status -sb") ?? "";
const mergeConflict =
  status.includes("UU ") ||
  status.includes("AA ") ||
  trySh("git diff --name-only --diff-filter=U")?.length > 0;

let ciStatus = "unknown";
const prJson = trySh(
  `gh pr list --head ${branch} --json number,state,statusCheckRollup,url --limit 1 2>/dev/null`,
);
if (prJson) {
  try {
    const prs = JSON.parse(prJson);
    if (prs[0]) {
      const checks = prs[0].statusCheckRollup ?? [];
      const failed = checks.filter((c) => c.conclusion === "FAILURE" || c.state === "FAILURE");
      const pending = checks.filter((c) => !c.conclusion && c.status === "IN_PROGRESS");
      ciStatus = failed.length
        ? `FAILED (${failed.length} check(s))`
        : pending.length
          ? "IN_PROGRESS"
          : "PASSING";
    }
  } catch {
    /* ignore */
  }
}

const runs = trySh(
  `gh run list --branch ${branch} --limit 1 --json conclusion,status,url 2>/dev/null`,
);
let latestRun = "n/a";
if (runs) {
  try {
    const [run] = JSON.parse(runs);
    if (run) latestRun = `${run.status} / ${run.conclusion ?? "—"} — ${run.url}`;
  } catch {
    /* ignore */
  }
}

const report = `# Enterprise Git Status Report

Generated: ${new Date().toISOString()}

## Repository

| Field | Value |
|-------|-------|
| Remote origin | \`${remoteUrl.replace(/x-access-token:[^@]+@/, "x-access-token:***@")}\` |
| Current branch | \`${branch}\`${detached ? " ⚠️ DETACHED HEAD" : ""} |
| Upstream tracking | \`${upstream}\` |
| Last commit | ${lastCommit} |
| Merge conflicts (working tree) | ${mergeConflict ? "⚠️ YES" : "✅ None"} |

## Working tree

\`\`\`
${status}
\`\`\`

## CI / GitHub Actions

| Field | Value |
|-------|-------|
| PR checks (current branch) | ${ciStatus} |
| Latest workflow run | ${latestRun} |

## Branch model (AviatorPass)

| Branch | Role |
|--------|------|
| \`aviatorpass\` | Production (Vercel AviatorPass) |
| \`develop\` | Integration / staging |
| \`feature/*\` | Feature work |
| \`hotfix/*\` | Production hotfixes |
| \`main\` | Sooqna product line (separate deploy) |

## Deployment

- **AviatorPass production:** push to \`aviatorpass\` → \`.github/workflows/deploy-aviatorpass-production.yml\`
- **Sooqna production:** push to \`main\` → \`.github/workflows/deploy-main-production.yml\`

## Safe push

Pre-push hook runs \`scripts/git-safe-sync.sh\` (fetch + rebase) before tests and push.

`;

console.log(report);
writeFileSync("docs/ENTERPRISE_GIT_REPORT.md", report);
console.log("\nWrote docs/ENTERPRISE_GIT_REPORT.md");
