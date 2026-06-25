import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";

/* ── friendly Firebase error messages ────────────────────── */
const parseError = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Login failed. Please try again.";
  }
};

/* ── Login ────────────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const { dispatch } = useContext(AuthContext);
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      dispatch({ type: "LOGIN", payload: result.user });
      navigate("/admin");
    } catch (err) {
      setError(parseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* grid atmosphere */}
      <div className="login-grid-bg" aria-hidden="true" />

      <div className="login-card" role="main">
        {/* header */}
        <p className="login-card__eyebrow">— Admin access</p>
        <h1 className="login-card__title">
          Sign in<span>.</span>
        </h1>
        <p className="login-card__subtitle">
          Restricted to portfolio admin only.
        </p>

        <div className="login-divider" />

        {/* form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* email */}
          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className={`login-input ${error ? "error" : ""}`}
              required
              disabled={loading}
            />
          </div>

          {/* password */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <div className="login-input-wrap">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`login-input ${error ? "error" : ""}`}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPass ? "●" : "○"}
              </button>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              <span aria-hidden="true">✕</span>
              {error}
            </div>
          )}

          {/* submit */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              <>↗ Sign in</>
            )}
          </button>
        </form>

        {/* back to site */}
        <Link to="/" className="login-back">
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
};

export default Login;