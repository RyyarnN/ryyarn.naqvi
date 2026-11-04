// The 100% Chain section: countdown, signup form, live leaderboard and age gate.
// Signups and the leaderboard live on the Netlify API named in the section's data-api.
(() => {
  const MIN_AGE = 18;
  const GATE_KEY = "ageGate";
  const PLATFORM = { playstation: "PS5", xbox: "Xbox" };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const today = () => new Date().toISOString().slice(0, 10);

  function ageOn(dob, now = new Date()) {
    const [y, m, d] = dob.split("-").map(Number);
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
    return age;
  }

  const readGate = () => {
    try { return JSON.parse(localStorage.getItem(GATE_KEY)); } catch { return null; }
  };
  const saveGate = (value) => {
    try { localStorage.setItem(GATE_KEY, JSON.stringify(value)); } catch {}
  };

  function initCountdown(root) {
    const box = root.querySelector("[data-countdown]");
    const label = root.querySelector("[data-countdown-label]");
    const launch = Date.parse(root.dataset.launch);
    if (!box || Number.isNaN(launch)) { box?.setAttribute("hidden", ""); return; }
    const tick = () => {
      const diff = launch - Date.now();
      if (diff <= 0) {
        box.hidden = true;
        label.textContent = "The game is out. The race is on.";
        return;
      }
      const parts = {
        d: Math.floor(diff / 864e5),
        h: Math.floor(diff / 36e5) % 24,
        m: Math.floor(diff / 6e4) % 60,
        s: Math.floor(diff / 1e3) % 60,
      };
      for (const [unit, v] of Object.entries(parts))
        box.querySelector(`[data-unit="${unit}"]`).textContent = String(v).padStart(2, "0");
      setTimeout(tick, 1000);
    };
    tick();
  }

  function initLeaderboard(root) {
    const status = root.querySelector("[data-lb-status]");
    const rows = root.querySelector("[data-lb-rows]");
    if (!rows) return;
    const load = async () => {
      try {
        const res = await fetch(`${root.dataset.api}/api/leaderboard`);
        if (!res.ok) throw new Error(res.status);
        const { entrants, count, updatedAt } = await res.json();
        status.textContent = `${count} player${count === 1 ? "" : "s"} entered · updated ${new Date(updatedAt).toLocaleTimeString()}`;
        rows.innerHTML = entrants.length
          ? entrants.map((e, i) => {
              const pct = e.progress?.percent;
              const progress = pct == null
                ? '<span class="hc-meta">Awaiting launch</span>'
                : `<div class="hc-bar" title="${Number(e.progress.earned)}/${Number(e.progress.total)}"><i style="width:${Math.min(100, Math.max(0, Number(pct)))}%"></i></div>
                   <span class="hc-pct">${Number(pct)}%</span>`;
              return `<tr>
                <td class="hc-rank">${i + 1}</td>
                <td>${esc(e.gamertag)}</td>
                <td><span class="hc-tag">${PLATFORM[e.platform] ?? ""}</span></td>
                <td>${progress}</td>
                <td><a href="${esc(e.streamUrl)}" target="_blank" rel="noopener nofollow">Watch</a></td>
              </tr>`;
            }).join("")
          : '<tr><td colspan="5" class="hc-meta">No entries yet. <a href="#hc-enter">Be the first.</a></td></tr>';
      } catch {
        status.textContent = "Couldn't load the leaderboard. Retrying shortly…";
      }
    };
    load();
    setInterval(load, 60_000);
  }

  function initForm(root) {
    const form = root.querySelector("[data-signup]");
    if (!form) return;
    form.querySelector('[name="dob"]').max = today();

    form.addEventListener("change", (e) => {
      if (e.target.name !== "platform") return;
      form.querySelector("[data-gamertag-label]").textContent =
        e.target.value === "playstation" ? "PSN Online ID" : "Xbox gamertag";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.querySelectorAll(".hc-error").forEach((el) => (el.textContent = ""));
      const fd = new FormData(form);
      const body = {
        name: fd.get("name"),
        email: fd.get("email"),
        dob: fd.get("dob"),
        platform: fd.get("platform") ?? "",
        gamertag: fd.get("gamertag"),
        streamUrl: fd.get("streamUrl"),
        company: fd.get("company"),
        publicProfile: fd.has("publicProfile"),
        over18: fd.has("over18"),
        acceptRules: fd.has("acceptRules"),
      };

      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const res = await fetch(`${root.dataset.api}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          form.innerHTML = `
            <div class="hc-success">
              <h3>You're in.</h3>
              <p class="hc-meta">Keep your trophies/achievements public. You'll appear on the leaderboard
              once tracking starts at launch.</p>
              <a class="hc-btn" href="#hc-leaderboard">View leaderboard</a>
            </div>`;
          return;
        }
        if (data.errors) {
          for (const [field, msg] of Object.entries(data.errors)) {
            const el = form.querySelector(`.hc-error[data-for="${field}"]`);
            if (el) el.textContent = msg;
          }
        } else {
          form.querySelector("[data-form-error]").textContent = "Something went wrong. Please try again.";
        }
      } catch {
        form.querySelector("[data-form-error]").textContent = "Network error. Please try again.";
      } finally {
        button.disabled = false;
      }
    });
  }

  // Links to the rules open the collapsed rules panel.
  function initRules(root) {
    const rules = root.querySelector("[data-rules]");
    root.querySelectorAll("[data-open-rules]").forEach((a) =>
      a.addEventListener("click", () => { if (rules) rules.open = true; }),
    );
    const openOnHash = () => { if (location.hash === "#hc-rules" && rules) rules.open = true; };
    openOnHash();
    window.addEventListener("hashchange", openOnHash);
  }

  // Date-of-birth gate. Under-18 visitors stay blocked on this browser; the server
  // re-checks the date of birth on signup, and the winner shows photo ID.
  function initAgeGate(root) {
    const dialog = root.querySelector("[data-age-gate]");
    if (!dialog || typeof dialog.showModal !== "function") return;

    const prefill = (dob) => {
      const field = root.querySelector('[data-signup] [name="dob"]');
      if (field && !field.value) field.value = dob;
    };
    const stored = readGate();
    if (stored?.dob && ageOn(stored.dob) >= MIN_AGE) { prefill(stored.dob); return; }

    const form = dialog.querySelector("[data-age-form]");
    const denied = dialog.querySelector("[data-age-denied]");
    const input = form.querySelector('input[type="date"]');
    const error = form.querySelector(".hc-error");
    input.max = today();

    const deny = () => { form.hidden = true; denied.hidden = false; };
    if (stored?.denied) deny();

    dialog.addEventListener("cancel", (e) => e.preventDefault());
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const dob = input.value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || dob > today() || dob < "1900-01-01") {
        error.textContent = "Enter your date of birth.";
        return;
      }
      if (ageOn(dob) < MIN_AGE) {
        saveGate({ denied: true, at: new Date().toISOString() });
        deny();
        return;
      }
      saveGate({ dob, at: new Date().toISOString() });
      prefill(dob);
      dialog.close();
      document.documentElement.classList.remove("hc-locked");
    });

    dialog.showModal();
    document.documentElement.classList.add("hc-locked");
  }

  function init(root) {
    if (root.dataset.hcReady) return;
    root.dataset.hcReady = "1";
    root.dataset.api = (root.dataset.api || "").replace(/\/+$/, "");
    initCountdown(root);
    initLeaderboard(root);
    initForm(root);
    initRules(root);
    initAgeGate(root);
  }

  const boot = () => document.querySelectorAll(".hc").forEach(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  // Re-run when the section is re-rendered in the theme editor.
  document.addEventListener("shopify:section:load", boot);
})();
