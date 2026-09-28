// Age gate: asks for date of birth before showing the site. Under-18 visitors stay
// blocked on this browser. The signup form re-checks date of birth on the server,
// and the winner's age is confirmed with photo ID before the prize ships.
(() => {
  const KEY = "ageGate";
  const MIN_AGE = 18;

  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  };
  const save = (value) => {
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {}
  };

  function ageOn(dob, now = new Date()) {
    const [y, m, d] = dob.split("-").map(Number);
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
    return age;
  }

  function prefill(dob) {
    const field = document.querySelector('#signup input[name="dob"]');
    if (field && !field.value) field.value = dob;
  }

  const stored = read();
  if (stored?.dob && ageOn(stored.dob) >= MIN_AGE) {
    document.addEventListener("DOMContentLoaded", () => prefill(stored.dob));
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const dialog = document.createElement("dialog");
  dialog.className = "age-gate";
  dialog.setAttribute("aria-labelledby", "age-gate-title");

  const deniedHtml = `
    <div class="denied">
      <h2 id="age-gate-title">Sorry</h2>
      <p>You must be ${MIN_AGE} or older to view this challenge.</p>
    </div>`;

  dialog.innerHTML = stored?.denied ? deniedHtml : `
    <form method="dialog" novalidate>
      <h2 id="age-gate-title">Confirm your age</h2>
      <p>This challenge is open only to players ${MIN_AGE} and older.</p>
      <label for="age-gate-dob">Date of birth</label>
      <input id="age-gate-dob" type="date" required min="1900-01-01" max="${today}">
      <p class="error" role="alert"></p>
      <button class="btn" type="submit">Enter site</button>
      <small>The winner must show government-issued photo ID before receiving the prize.</small>
    </form>`;

  // The gate can't be dismissed with Escape.
  dialog.addEventListener("cancel", (e) => e.preventDefault());

  dialog.querySelector("form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const dob = dialog.querySelector("#age-gate-dob").value;
    const error = dialog.querySelector(".error");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || dob > today || dob < "1900-01-01") {
      error.textContent = "Enter your date of birth.";
      return;
    }
    if (ageOn(dob) < MIN_AGE) {
      save({ denied: true, at: new Date().toISOString() });
      dialog.innerHTML = deniedHtml;
      return;
    }
    save({ dob, at: new Date().toISOString() });
    prefill(dob);
    dialog.close();
    document.documentElement.style.overflow = "";
  });

  const open = () => {
    document.body.append(dialog);
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  if (document.body) open();
  else document.addEventListener("DOMContentLoaded", open);
})();
