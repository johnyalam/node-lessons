export default function Welcome({ user, onLogout }) {
  return (
    <section className="welcome">
      <h2>Welcome, {user.name}!</h2>
      <p>
        You are signed in as <strong>{user.email}</strong>.
      </p>
      <button type="button" className="secondary" onClick={onLogout}>
        Sign out
      </button>
    </section>
  );
}
