const passwordInput = document.getElementById("password");
const checkBtn = document.getElementById("checkBtn");
const feedback = document.getElementById("feedback");
const suggestion = document.getElementById("suggestion");
const strengthBar = document.getElementById("strengthBar");
const breach = document.getElementById("breach");

// Show/hide password
document.getElementById("togglePassword").addEventListener("click", function () {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  this.textContent = type === "text" ? "🙈" : "👁️";
});

// Clear info if input is empty
passwordInput.addEventListener("input", () => {
  if (passwordInput.value.trim() === "") {
    feedback.textContent = "";
    suggestion.textContent = "";
    breach.textContent = "";
    strengthBar.style.width = "0";
  }
});

checkBtn.addEventListener("click", () => {
  const password = passwordInput.value.trim();
  if (!password) return;

  let score = 0;
  const feedbackList = [];

  if (password.length >= 8) score++;
  else feedbackList.push("at least 8 characters");

  if (/[A-Z]/.test(password)) score++;
  else feedbackList.push("an uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else feedbackList.push("a lowercase letter");

  if (/[0-9]/.test(password)) score++;
  else feedbackList.push("a number");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedbackList.push("a special character");

  // Update strength bar
  const colors = ["#ff4d4d", "#ff944d", "#ffc107", "#8bc34a", "#00e676"];
  strengthBar.style.width = `${(score / 5) * 100}%`;
  strengthBar.style.backgroundColor = colors[score - 1] || "#ff4d4d";

  // Show feedback
  if (feedbackList.length === 0) {
    feedback.textContent = "✅ Your password is strong!";
  } else {
    feedback.innerHTML = `❌ Password is missing: <strong>${feedbackList.join(
      ", "
    )}</strong>`;
  }

  // Suggest strong password
  const generated = generateStrongPassword();
  suggestion.innerHTML = `💡 Try this strong password: <code>${generated}</code>`;

  // Check breach
  checkBreach(password);
});

function generateStrongPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

async function checkBreach(password) {
  const sha1 = await sha1Hash(password);
  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();

  const found = text.split("\n").find((line) => line.startsWith(suffix));
  if (found) {
    breach.innerHTML = `⚠️ This password has appeared in <strong>${parseInt(
      found.split(":")[1]
    ).toLocaleString()}</strong> data breaches. Avoid using it.`;
  } else {
    breach.textContent = "✅ This password has not appeared in known breaches.";
  }
}

async function sha1Hash(str) {
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-1", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}
