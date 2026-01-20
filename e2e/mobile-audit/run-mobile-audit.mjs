/**
 * Mobile UX/UI E2E Screenshot Runner (Production)
 *
 * 실행:
 *   node e2e/mobile-audit/run-mobile-audit.mjs
 *   node e2e/mobile-audit/run-mobile-audit.mjs --baseUrl=https://iness-mlog.web.app --headless=true
 *
 * 산출:
 *   mobile-audit/<runId>/
 *     manifest.json
 *     console.json
 *     network.json
 *     metrics.json
 *     onboarding/*.png
 *     chat/*.png
 *     journal/*.png
 *     reports/*.png
 *     content/*.png
 *     profile/*.png
 *     safety/*.png
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs/promises";
import { MOBILE_AUDIT_MANIFEST_V1 } from "./manifest.mjs";

const DEFAULT_BASE_URL = "https://iness-mlog.web.app";

function nowRunId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes()
  )}${pad(d.getSeconds())}`;
}

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    headless: true,
    runId: nowRunId(),
    onlyTab: null,
    onlyGroup: null,
    maxScreens: null,
  };
  for (const raw of argv.slice(2)) {
    const [k, v] = raw.split("=", 2);
    if (k === "--baseUrl" && v) args.baseUrl = v;
    if (k === "--headless" && v) args.headless = v !== "false";
    if (k === "--runId" && v) args.runId = v;
    if (k === "--onlyTab" && v) args.onlyTab = v;
    if (k === "--onlyGroup" && v) args.onlyGroup = v;
    if (k === "--maxScreens" && v) args.maxScreens = Number(v);
  }
  return args;
}

function buildInitScript(storagePreset) {
  const CONSENT_STORAGE_KEY = "consent_conversation_storage";
  const preset = storagePreset ?? {};
  const payload = JSON.stringify(preset);

  // addInitScript는 문자열/함수 모두 지원하지만, Windows/ESM 환경에서 단순 문자열이 가장 안전합니다.
  return `
(() => {
  const preset = ${payload};
  const CONSENT_STORAGE_KEY = ${JSON.stringify(CONSENT_STORAGE_KEY)};
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}
  try { sessionStorage.removeItem('onboarding_redirect_count'); } catch {}

  // 온보딩 완료 플래그
  try {
    if (preset.onboardingCompleted) {
      localStorage.setItem('onboarding_completed', 'true');
    } else {
      localStorage.removeItem('onboarding_completed');
    }
  } catch {}

  // 모드 강제 (day/night)
  try {
    if (preset.modeOverride) localStorage.setItem('mode_override', preset.modeOverride);
  } catch {}

  // 동의 모달 스킵 (consentedAt 또는 revokedAt 중 하나만 있어도 모달이 뜨지 않음)
  try {
    const now = new Date().toISOString();
    if (preset.consentPreset === 'consented') {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        conversationStorage: true,
        consentedAt: now,
      }));
    } else if (preset.consentPreset === 'revoked') {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        conversationStorage: false,
        revokedAt: now,
      }));
    }
  } catch {}
})();
`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeUrl(baseUrl, routePath) {
  const b = baseUrl.replace(/\/+$/, "");
  const p = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return `${b}${p}`;
}

async function waitForCondition(page, cond) {
  if (!cond) return;
  if (cond.type === "selector") {
    await page.waitForSelector(cond.selector, { state: "visible", timeout: cond.timeoutMs ?? 15000 });
    return;
  }
  if (cond.type === "role") {
    const locator = page.getByRole(cond.role, { name: cond.name, exact: false });
    await locator.waitFor({ state: "visible", timeout: cond.timeoutMs ?? 15000 });
    return;
  }
  if (cond.type === "url") {
    await page.waitForURL(cond.pattern, { timeout: cond.timeoutMs ?? 15000 });
    return;
  }
  throw new Error(`Unsupported waitFor type: ${cond.type}`);
}

async function runStep(page, step) {
  if (!step) return;
  switch (step.type) {
    case "wait": {
      await page.waitForTimeout(step.ms ?? 300);
      return;
    }
    case "click": {
      if (step.by === "role") {
        const locator = page.getByRole(step.role, { name: step.name, exact: false });
        const target = Number.isInteger(step.index) ? locator.nth(step.index) : locator.first();
        await target.click();
        return;
      }
      if (step.by === "aria") {
        await page.locator(`[aria-label="${step.name}"]`).click();
        return;
      }
      if (step.by === "selector") {
        await page.locator(step.selector).click();
        return;
      }
      if (step.by === "text") {
        await page.getByText(step.text, { exact: false }).click();
        return;
      }
      throw new Error(`Unsupported click.by: ${step.by}`);
    }
    case "fill": {
      if (step.by === "aria") {
        await page.getByLabel(step.name, { exact: false }).fill(step.text);
        return;
      }
      if (step.by === "selector") {
        await page.locator(step.selector).fill(step.text);
        return;
      }
      throw new Error(`Unsupported fill.by: ${step.by}`);
    }
    case "setRange": {
      const value = Number(step.value);
      await page.locator(step.selector).evaluate((el, v) => {
        // input[type=range]를 안전하게 갱신
        el.value = String(v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, value);
      return;
    }
    default:
      throw new Error(`Unsupported step.type: ${step.type}`);
  }
}

async function collectMetrics(page, screen) {
  const targets = Array.isArray(screen.metricsTargets) ? screen.metricsTargets : [];
  const result = await page.evaluate((t) => {
    const bySelector = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
    };

    const byRoleName = (role, name) => {
      // 간단 role 탐색(정교한 ARIA 트리는 Playwright 쪽에서 다루고, 여기선 최소 정보만)
      const all = Array.from(document.querySelectorAll("*"));
      const found = all.find((el) => {
        const r = el.getAttribute("role");
        if (r !== role) return false;
        const label = el.getAttribute("aria-label") || el.textContent || "";
        return label.includes(name);
      });
      if (!found) return null;
      const rect = found.getBoundingClientRect();
      const style = window.getComputedStyle(found);
      return {
        role,
        name,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
    };

    const metrics = {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scroll: { x: window.scrollX, y: window.scrollY },
      document: { scrollHeight: document.documentElement.scrollHeight },
      safeArea: {
        top: getComputedStyle(document.documentElement).getPropertyValue("--safe-top")?.trim() || null,
        bottom: getComputedStyle(document.documentElement).getPropertyValue("--safe-bottom")?.trim() || null,
      },
      counts: {
        buttons: document.querySelectorAll("button").length,
        inputs: document.querySelectorAll("input, textarea, [contenteditable='true']").length,
        links: document.querySelectorAll("a[href]").length,
      },
      targets: [],
    };

    for (const item of t) {
      if (item.selector) {
        metrics.targets.push({ label: item.label, ...bySelector(item.selector) });
      } else if (item.role && item.name) {
        metrics.targets.push({ label: item.label, ...byRoleName(item.role, item.name) });
      }
    }

    return metrics;
  }, targets);

  return { screenId: screen.id, metrics: result };
}

async function main() {
  const args = parseArgs(process.argv);
  const runRoot = path.join(process.cwd(), "mobile-audit", args.runId);
  await ensureDir(runRoot);

  const consoleLogs = [];
  const networkFailures = [];
  const metrics = [];

  const runManifest = {
    runId: args.runId,
    baseUrl: args.baseUrl,
    viewport: MOBILE_AUDIT_MANIFEST_V1.viewport,
    startedAt: new Date().toISOString(),
    version: MOBILE_AUDIT_MANIFEST_V1.version,
    screens: [],
  };

  const browser = await chromium.launch({ headless: args.headless });

  try {
    let executed = 0;
    for (const group of MOBILE_AUDIT_MANIFEST_V1.groups) {
      if (args.onlyGroup && group.id !== args.onlyGroup) continue;

      // eslint-disable-next-line no-console
      console.log(`[mobile-audit] group: ${group.id} (${group.screens.length} screens)`);

      const context = await browser.newContext({
        viewport: MOBILE_AUDIT_MANIFEST_V1.viewport,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
      });
      await context.addInitScript(buildInitScript(group.storagePreset));

      const page = await context.newPage();

      page.on("console", (msg) => {
        consoleLogs.push({
          ts: new Date().toISOString(),
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
        });
      });

      page.on("pageerror", (err) => {
        consoleLogs.push({
          ts: new Date().toISOString(),
          type: "pageerror",
          text: String(err?.message || err),
        });
      });

      page.on("requestfailed", (req) => {
        networkFailures.push({
          ts: new Date().toISOString(),
          url: req.url(),
          method: req.method(),
          resourceType: req.resourceType(),
          failure: req.failure(),
        });
      });

      for (const screen of group.screens) {
        const resolvedTab = screen.tab || group.tab || group.id;
        if (args.onlyTab && resolvedTab !== args.onlyTab) continue;
        if (Number.isFinite(args.maxScreens) && executed >= args.maxScreens) break;

        executed += 1;

        // eslint-disable-next-line no-console
        console.log(`[mobile-audit]  -> (${executed}) ${resolvedTab}/${screen.file}  ${screen.path}`);

        const outDir = path.join(runRoot, resolvedTab);
        await ensureDir(outDir);

        const url = normalizeUrl(args.baseUrl, screen.path);
        const outFile = path.join(outDir, screen.file);
        const screenRecord = {
          id: screen.id,
          name: screen.name,
          tab: resolvedTab,
          url,
          file: path.relative(process.cwd(), outFile).replaceAll("\\", "/"),
          ok: false,
          error: null,
          warnings: [],
          capturedAt: null,
        };

        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
          // SPA/애니메이션 안정화: networkidle은 장기 연결에서 멈출 수 있어 best-effort로만 사용
          await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(350);

          if (Array.isArray(screen.steps)) {
            for (const step of screen.steps) {
              await runStep(page, step);
              await page.waitForTimeout(150);
            }
          }

          if (Array.isArray(screen.waitFor)) {
            for (const cond of screen.waitFor) {
              if (screen.strictWaits === false) {
                await waitForCondition(page, cond).catch((e) => {
                  screenRecord.warnings.push(String(e?.message || e));
                });
              } else {
                await waitForCondition(page, cond);
              }
            }
          }

          await page.waitForTimeout(250);
          await page.screenshot({ path: outFile, fullPage: false });

          metrics.push(await collectMetrics(page, screen));

          screenRecord.ok = true;
          screenRecord.capturedAt = new Date().toISOString();

          // eslint-disable-next-line no-console
          console.log(`[mobile-audit]     ok`);
        } catch (err) {
          screenRecord.ok = false;
          screenRecord.error = String(err?.message || err);

          // eslint-disable-next-line no-console
          console.log(`[mobile-audit]     fail: ${screenRecord.error}`);
        } finally {
          runManifest.screens.push(screenRecord);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  runManifest.finishedAt = new Date().toISOString();

  await writeJson(path.join(runRoot, "manifest.json"), runManifest);
  await writeJson(path.join(runRoot, "console.json"), consoleLogs);
  await writeJson(path.join(runRoot, "network.json"), networkFailures);
  await writeJson(path.join(runRoot, "metrics.json"), metrics);

  // 간단 요약 출력
  const okCount = runManifest.screens.filter((s) => s.ok).length;
  const total = runManifest.screens.length;
  // eslint-disable-next-line no-console
  console.log(`[mobile-audit] done: ${okCount}/${total} screens captured -> ${runRoot}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[mobile-audit] failed:", err);
  process.exit(1);
});

