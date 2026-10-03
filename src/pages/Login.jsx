import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGuestAccess() {
    setError("");

    try {
      setLoading(true);

      const guestId =
        typeof crypto?.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const guestEmail = `guest-${guestId}@smartdine.demo`;
      const guestPassword = `SmartDine-${guestId}`;

      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "SmartDine Guest",
          email: guestEmail,
          password: guestPassword,
        }),
      });

      const userId = Number(data?.user?.id);

      if (!data?.token || !Number.isInteger(userId) || userId <= 0) {
        throw new Error(
          "Guest registration did not include a valid user session."
        );
      }

      localStorage.setItem("smartdine_token", data.token);
      localStorage.setItem(
        "smartdine_user",
        JSON.stringify({ ...data.user, id: userId })
      );
      navigate("/table");
    } catch (guestError) {
      setError(
        guestError.message ||
          "Could not start a guest session. Please try again."
      );
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

          {/* Guest */}
          <button
            className="login-primary-button"
            onClick={handleGuestAccess}
            disabled={loading}
          >
            <span className="login-button-content">
              {loading && <span className="login-spinner" />}
              <span>
                {loading ? "Creating guest session..." : "Continue as Guest"}
              </span>
            </span>

            <ArrowRight size={19} />
          </button>

          {error && <p className="login-error">{error}</p>}

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