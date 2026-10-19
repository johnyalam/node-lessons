// One label + input + error message. Used by both forms.
// Props are the component's inputs, like function parameters.
export default function Field({ id, label, name, type = "text", value, error, autoComplete, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : "false"}
        onChange={onChange}
      />
      <small className="error">{error}</small>
    </div>
  );
}
