const TARGET_DOMAIN = "manuleaconstruction.co.nz";
const EXPECTED_WWW_CNAME = "otago-star.github.io";
const EXPECTED_APEX_A = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153"
];

const logEl = document.getElementById("status-log");
const runButton = document.getElementById("run-status-check");
const lastRunEl = document.getElementById("last-status-run");

function logLine(message) {
  if (!logEl) {
    return;
  }

  const now = new Date().toLocaleTimeString();
  logEl.textContent += `\n[${now}] ${message}`;
}

function setStatus(cardId, state, summary, details) {
  const card = document.getElementById(cardId);
  if (!card) {
    return;
  }

  const pill = card.querySelector(".status-pill");
  const detailsEl = card.querySelector(".status-details");

  if (pill) {
    pill.className = `status-pill ${state}`;
    pill.textContent = summary;
  }

  if (detailsEl && details) {
    detailsEl.textContent = details;
  }
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function checkHttpsReachability() {
  const start = performance.now();

  try {
    await withTimeout(
      fetch(`https://${TARGET_DOMAIN}/`, {
        method: "GET",
        mode: "no-cors",
        cache: "no-store"
      }),
      12000,
      "Timed out while connecting to HTTPS homepage"
    );

    const elapsed = Math.round(performance.now() - start);
    setStatus("status-https", "pass", "PASS", `HTTPS responded in ~${elapsed}ms.`);
    logLine(`HTTPS homepage reachable in ~${elapsed}ms.`);
  } catch (error) {
    setStatus("status-https", "fail", "FAIL", "Browser could not complete TLS connection to live homepage.");
    logLine(`HTTPS homepage failed: ${error.message}`);
  }
}

function checkLiveAsset() {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const image = new Image();

    image.onload = () => {
      const elapsed = Math.round(performance.now() - startedAt);
      setStatus("status-asset", "pass", "PASS", `Live image loaded in ~${elapsed}ms.`);
      logLine(`Live asset loaded in ~${elapsed}ms.`);
      resolve();
    };

    image.onerror = () => {
      setStatus("status-asset", "fail", "FAIL", "Could not load logo image from live domain.");
      logLine("Live asset failed to load.");
      resolve();
    };

    image.src = `https://${TARGET_DOMAIN}/images/logo/logo.png?cacheBust=${Date.now()}`;
  });
}

async function checkApexARecords() {
  try {
    const response = await withTimeout(
      fetch(`https://dns.google/resolve?name=${TARGET_DOMAIN}&type=A`, {
        cache: "no-store"
      }),
      12000,
      "Timed out while querying DNS"
    );

    const data = await response.json();
    const answers = (data.Answer || [])
      .filter((item) => item.type === 1)
      .map((item) => item.data)
      .sort();

    const expected = [...EXPECTED_APEX_A].sort();
    const missing = expected.filter((entry) => !answers.includes(entry));

    if (answers.length && missing.length === 0) {
      setStatus("status-apex-a", "pass", "PASS", `Root A records are correct: ${answers.join(", ")}`);
      logLine("Root A records match GitHub Pages targets.");
      return;
    }

    setStatus("status-apex-a", "warn", "WARN", `Missing expected A records: ${missing.join(", ") || "unknown"}`);
    logLine(`Root A records not complete. Found: ${answers.join(", ") || "none"}`);
  } catch (error) {
    setStatus("status-apex-a", "warn", "WARN", "Could not verify DNS A records from browser.");
    logLine(`Root A record check error: ${error.message}`);
  }
}

async function checkWwwCname() {
  try {
    const response = await withTimeout(
      fetch(`https://dns.google/resolve?name=www.${TARGET_DOMAIN}&type=CNAME`, {
        cache: "no-store"
      }),
      12000,
      "Timed out while querying www CNAME"
    );

    const data = await response.json();
    const answer = (data.Answer || []).find((item) => item.type === 5);
    const actual = answer ? String(answer.data || "").replace(/\.$/, "") : "";

    if (actual === EXPECTED_WWW_CNAME) {
      setStatus("status-www-cname", "pass", "PASS", `www CNAME is correctly set to ${EXPECTED_WWW_CNAME}.`);
      logLine("www CNAME points to expected GitHub host.");
      return;
    }

    setStatus("status-www-cname", "warn", "WARN", `www CNAME is ${actual || "not found"}; expected ${EXPECTED_WWW_CNAME}.`);
    logLine(`www CNAME mismatch. Found: ${actual || "not found"}`);
  } catch (error) {
    setStatus("status-www-cname", "warn", "WARN", "Could not verify www CNAME from browser.");
    logLine(`www CNAME check error: ${error.message}`);
  }
}

async function runAllChecks() {
  if (runButton) {
    runButton.disabled = true;
    runButton.textContent = "Checking...";
  }

  if (logEl) {
    logEl.textContent = "Starting checks...";
  }

  setStatus("status-https", "pending", "Pending", "Checks if the browser can load the live homepage over TLS.");
  setStatus("status-asset", "pending", "Pending", "Loads a known image from the live site to confirm routing and static content delivery.");
  setStatus("status-apex-a", "pending", "Pending", "Validates the root domain resolves to GitHub Pages IPv4 addresses.");
  setStatus("status-www-cname", "pending", "Pending", "Checks that www points to otago-star.github.io.");

  await checkHttpsReachability();
  await checkLiveAsset();
  await checkApexARecords();
  await checkWwwCname();

  if (lastRunEl) {
    lastRunEl.textContent = `Last check: ${new Date().toLocaleString()}`;
  }

  if (runButton) {
    runButton.disabled = false;
    runButton.textContent = "Run Checks Again";
  }
}

if (runButton) {
  runButton.addEventListener("click", runAllChecks);
}

runAllChecks();
