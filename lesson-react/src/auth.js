// The same logic as step 1 (storage + validation), now exported as a module.
// No DOM code here: React handles the page.

// DEMO ONLY: real apps never keep passwords in the browser.
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

const publicUser = ({ name, email }) => ({ name, email });

export function registerUser({ name, email, password }) {
  const user = { name: name.trim(), email: email.trim().toLowerCase(), password };
  saveUsers([...loadUsers(), user]);
  return publicUser(user);
}

export function login(email, password) {
  const user = findUser(email);
  if (!user || user.password !== password) return null;
  return publicUser(user);
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function startSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function endSession() {
  localStorage.removeItem(SESSION_KEY);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  return errors;
}

export function validateRegister({ name, email, password, confirm }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Enter your full name";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  else if (findUser(email)) errors.email = "An account with this email already exists";
  if (password.length < 8) errors.password = "Use at least 8 characters";
  if (confirm !== password) errors.confirm = "Passwords do not match";
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
