import { useState } from "react";
import Field from "./Field.jsx";
import { registerUser, validateRegister, hasErrors } from "../auth.js";

const EMPTY = { name: "", email: "", password: "", confirm: "" };

export default function RegisterForm({ onRegistered }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const found = validateRegister(values);
    setErrors(found);
    if (hasErrors(found)) return;

    const user = registerUser(values);
    onRegistered(user);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field id="register-name" label="Full name" name="name" autoComplete="name"
        value={values.name} error={errors.name} onChange={handleChange} />
      <Field id="register-email" label="Email" name="email" type="email" autoComplete="email"
        value={values.email} error={errors.email} onChange={handleChange} />
      <Field id="register-password" label="Password" name="password" type="password" autoComplete="new-password"
        value={values.password} error={errors.password} onChange={handleChange} />
      <Field id="register-confirm" label="Confirm password" name="confirm" type="password" autoComplete="new-password"
        value={values.confirm} error={errors.confirm} onChange={handleChange} />
      <button type="submit" className="primary">Create account</button>
    </form>
  );
}
