import { useState } from "react";
import { login, signup } from "../utils/api";

export default function LoginPage({ onAuth }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isSignup && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = isSignup
        ? await signup(email, password)
        : await login(email, password);
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setConfirmPassword("");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
        <p className="auth-subtitle">
          {isSignup
            ? "Start tracking your workouts"
            : "Log in to continue"}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
          {isSignup && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}
          <button
            className="auth-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Sign Up"
              : "Log In"}
          </button>
        </div>

        <p className="auth-toggle">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="auth-toggle-btn" onClick={toggleMode}>
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}
