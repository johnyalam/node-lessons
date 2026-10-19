import { useState } from "react";
import Field from "./Field.jsx";
import { login, validateLogin, hasErrors } from "../auth.js";

export default function LoginForm({ initialEmail = "", onLogin, onError }) {
  // State: React re-draws the form whenever these change
  const [values, setValues] = useState({ email: initialEmail, password: "" });
  const [errors, setErrors] = useState({});

  // One handler for every input, using the input's name
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const found = validateLogin(values);
    setErrors(found);
    if (hasErrors(found)) return;

    const user = login(values.email, values.password);
    if (!user) {
      onError("Wrong email or password");
      return;
    }
    onLogin(user);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        id="login-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={handleChange}
      />
      <Field
        id="login-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        error={errors.password}
        onChange={handleChange}
      />
      <button type="submit" className="primary">Sign in</button>
    </form>
  );
}
