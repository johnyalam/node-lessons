import { useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import Welcome from "./components/Welcome.jsx";
import { getSessionUser, startSession, endSession } from "./auth.js";

export default function App() {
  // All screen state lives here. Change state → React re-draws the page.
  const [user, setUser] = useState(() => getSessionUser()); // read once at start
  const [tab, setTab] = useState("login");                  // "login" | "register"
  const [message, setMessage] = useState(null);             // { type, text } or null
  const [prefillEmail, setPrefillEmail] = useState("");

  function changeTab(next) {
    setTab(next);
    setMessage(null);
  }

  function handleLogin(loggedIn) {
    startSession(loggedIn);
    setUser(loggedIn);
    setMessage(null);
  }

  function handleRegistered(created) {
    setPrefillEmail(created.email);
    setTab("login");
    setMessage({ type: "success", text: `Account created for ${created.email}. You can sign in now.` });
  }

  function handleLogout() {
    endSession();
    setUser(null);
    setTab("login");
    setMessage({ type: "success", text: "You have been signed out." });
  }

  return (
    <main className="card">
      <h1 className="brand">EMM Console</h1>
      <p className="subtitle">Manage your organization's tablets</p>

      {user ? (
        <Welcome user={user} onLogout={handleLogout} />
      ) : (
        <section>
          <div className="tabs">
            <button type="button" className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => changeTab("login")}>
              Sign in
            </button>
            <button type="button" className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => changeTab("register")}>
              Create account
            </button>
          </div>

          {message && <p className={`message ${message.type}`}>{message.text}</p>}

          {tab === "login" ? (
            <LoginForm
              initialEmail={prefillEmail}
              onLogin={handleLogin}
              onError={(text) => setMessage({ type: "error", text })}
            />
          ) : (
            <RegisterForm onRegistered={handleRegistered} />
          )}
        </section>
      )}

      <p className="note">Demo only: accounts are saved in this browser.</p>
    </main>
  );
}
