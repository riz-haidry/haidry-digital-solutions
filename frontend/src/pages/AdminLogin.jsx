import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import logo from "../assets/logo-640.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const reduceMotion = useReducedMotion();
  if (sessionStorage.getItem("hds-admin-token"))
    return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      sessionStorage.setItem("hds-admin-token", result.token);
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <motion.section
        className="admin-login-card"
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 16 }}
      >
        <Link className="admin-brand" to="/">
          <img src={logo} alt="" /> Haidry Digital
        </Link>
        <p className="eyebrow">PRIVATE WORKSPACE</p>
        <h1>Welcome back.</h1>
        <p className="login-copy">
          Sign in to manage enquiries, projects and work shown on your website.
        </p>
        <form className="contact-form admin-login-form" onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="admin@yourdomain.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder="Your password"
            />
          </label>
          {error && (
            <p className="form-message error" role="alert">
              {error}
            </p>
          )}
          <motion.button
            className="button button-dark form-submit"
            type="submit"
            disabled={loading}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            {loading ? "Signing in…" : "Sign in"} <span>↗</span>
          </motion.button>
        </form>
        <Link className="back-home" to="/">
          ← Back to website
        </Link>
      </motion.section>
    </main>
  );
}
