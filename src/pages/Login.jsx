import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!data?.token || !data?.user?.id) {
        throw new Error("Login response did not include a valid user session.");
      }

      localStorage.setItem("smartdine_token", data.token);
      localStorage.setItem("smartdine_user", JSON.stringify(data.user));
      navigate("/table");
    } catch (loginError) {
      setError(loginError.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">

      {/* Ambient background */}
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />

      <div className="login-container">

        {/* Brand */}
        <motion.div
          className="login-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="login-logo">
            <UtensilsCrossed size={22} />
          </div>

          <span>SMARTDINE</span>
        </motion.div>

        {/* Main content */}
        <motion.section
          className="login-card"
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >

          <div className="login-icon">
            <Sparkles size={22} />
          </div>

          <p className="login-eyebrow">
            THE FUTURE OF DINING
          </p>

          <h1>
            Welcome to
            <span> SmartDine.</span>
          </h1>

          <p className="login-description">
            A seamless dining experience connecting guests,
            kitchen and restaurant teams in real time.
          </p>

          <div className="login-fields">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <div className="login-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="login-error">{error}</p>}
          </div>

          {/* Guest */}
          <button
            className="login-primary-button"
            onClick={handleLogin}
            disabled={loading}
          >
            <span className="login-button-content">
              {loading && <span className="login-spinner" />}
              <span>{loading ? "Signing in..." : "Continue as Guest"}</span>
            </span>

            <ArrowRight size={19} />
          </button>

          <div className="login-divider">
            <span>OPERATIONS</span>
          </div>

          {/* Staff */}
          <button
            className="login-secondary-button"
            onClick={() => navigate("/staff")}
          >
            <span>
              Staff Login
            </span>

            <ArrowRight size={18} />
          </button>

          {/* Admin */}
          <button
            className="login-secondary-button"
            onClick={() => navigate("/admin")}
          >
            <span>
              Admin Login
            </span>

            <ArrowRight size={18} />
          </button>

          {/* Security */}
          <div className="login-security">
            <ShieldCheck size={17} />

            <span>
              Secure role-based access
            </span>
          </div>

        </motion.section>

        {/* Footer */}
        <motion.p
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          SmartDine · Intelligent hospitality platform
        </motion.p>

      </div>

    </main>
  );
}