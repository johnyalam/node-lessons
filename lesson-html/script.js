// Step 1: plain JavaScript. We find elements in the page and change them by hand.

// =============================================================
// 1. Storage (DEMO ONLY)
//    Real apps never keep passwords in the browser. Later the EMM
//    server will check passwords (hashed with bcrypt) instead.
// =============================================================
const USERS_KEY = "emm-users";
const SESSION_KEY = "emm-session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(email) {
  return loadUsers().find((u) => u.email === email.trim().toLowerCase());
}

// Never hand the password to the UI: return only public fields
const publicUser = ({ name, email }) => ({ name, email });

function registerUser({ name, email, password }) {
  const user = { name: name.trim(), email: email.trim().toLowerCase(), password };
  saveUsers([...loadUsers(), user]);
  return publicUser(user);
}

function login(email, password) {
  const user = findUser(email);
  if (!user || user.password !== password) return null;
  return publicUser(user);
}

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function startSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function endSession() {
  localStorage.removeItem(SESSION_KEY);
}

// =============================================================
// 2. Validation: returns { fieldName: "error message" }
//    An empty object means "no errors".
// =============================================================
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin({ email, password }) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  return errors;
}

function validateRegister({ name, email, password, confirm }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Enter your full name";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  else if (findUser(email)) errors.email = "An account with this email already exists";
  if (password.length < 8) errors.password = "Use at least 8 characters";
  if (confirm !== password) errors.confirm = "Passwords do not match";
  return errors;
}

// =============================================================
// 3. DOM: find elements and update them
// =============================================================
const authView = document.querySelector("#auth-view");
const welcomeView = document.querySelector("#welcome-view");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#message");
const tabs = document.querySelectorAll(".tab");

// Read all inputs of a form into an object: { email: "...", password: "..." }
function formValues(form) {
  return Object.fromEntries(new FormData(form));
}

// Put each error under its input, and mark the input red
function showErrors(form, errors) {
  for (const input of form.querySelectorAll("input")) {
    const text = errors[input.name] ?? "";
    input.closest(".field").querySelector(".error").textContent = text;
    input.setAttribute("aria-invalid", text ? "true" : "false");
  }
}

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;
  message.hidden = false;
}

function hideMessage() {
  message.hidden = true;
}

function switchTab(name) {
  for (const tab of tabs) tab.classList.toggle("active", tab.dataset.tab === name);
  loginForm.hidden = name !== "login";
  registerForm.hidden = name !== "register";
  showErrors(loginForm, {});
  showErrors(registerForm, {});
}

function showWelcome(user) {
  document.querySelector("#welcome-name").textContent = user.name;
  document.querySelector("#welcome-email").textContent = user.email;
  authView.hidden = true;
  welcomeView.hidden = false;
}

function showAuth() {
  welcomeView.hidden = true;
  authView.hidden = false;
}

// =============================================================
// 4. Events: what happens when the user clicks or submits
// =============================================================
for (const tab of tabs) {
  tab.addEventListener("click", () => {
    hideMessage();
    switchTab(tab.dataset.tab);
  });
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the browser from reloading the page
  hideMessage();

  const values = formValues(loginForm);
  const errors = validateLogin(values);
  showErrors(loginForm, errors);
  if (Object.keys(errors).length > 0) return;

  const user = login(values.email, values.password);
  if (!user) {
    // Same message for "no such user" and "wrong password": don't reveal which
    showMessage("Wrong email or password", "error");
    return;
  }

  startSession(user);
  loginForm.reset();
  showWelcome(user);
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hideMessage();

  const values = formValues(registerForm);
  const errors = validateRegister(values);
  showErrors(registerForm, errors);
  if (Object.keys(errors).length > 0) return;

  const user = registerUser(values);
  registerForm.reset();
  switchTab("login");
  loginForm.elements.email.value = user.email; // pre-fill for convenience
  showMessage(`Account created for ${user.email}. You can sign in now.`);
});

document.querySelector("#logout").addEventListener("click", () => {
  endSession();
  showAuth();
  switchTab("login");
  showMessage("You have been signed out.");
});

// =============================================================
// 5. Start: if a session exists, skip the login screen
// =============================================================
const sessionUser = getSessionUser();
if (sessionUser) showWelcome(sessionUser);
