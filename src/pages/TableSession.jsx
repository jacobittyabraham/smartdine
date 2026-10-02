import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  MapPin,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TableSession() {
  const navigate = useNavigate();

  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);

  const handleTableChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    setTableNumber(value);
    setError("");

    if (value) {
      setSelectedTable(value);
    } else {
      setSelectedTable(null);
    }
  };

  const handleContinue = () => {
    if (!tableNumber) {
      setError("Please enter your table number.");
      return;
    }

    const number = Number(tableNumber);

    if (number < 1 || number > 100) {
      setError("Please enter a table number between 1 and 100.");
      return;
    }

    // Save table session
    localStorage.setItem("smartdine_table", String(number));

    // Create a simple session ID for the current visit
    const sessionId = `SD-${Date.now()}`;

    localStorage.setItem("smartdine_session", sessionId);

    // Go to menu
    navigate("/menu");
  };

  return (
    <main className="table-session-page">

      {/* Ambient background */}
      <div className="table-orb table-orb-one" />
      <div className="table-orb table-orb-two" />

      <div className="table-session-container">

        {/* Brand */}
        <motion.div
          className="table-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="table-brand-icon">
            <UtensilsCrossed size={20} />
          </div>

          <span>SMARTDINE</span>
        </motion.div>

        {/* Main card */}
        <motion.section
          className="table-session-card"
          initial={{
            opacity: 0,
            y: 35,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.75,
            ease: "easeOut",
          }}
        >

          {/* Icon */}
          <motion.div
            className="table-session-icon"
            initial={{ scale: 0.7, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              type: "spring",
            }}
          >
            <MapPin size={25} />
          </motion.div>

          {/* Heading */}
          <p className="table-eyebrow">
            TABLE SESSION
          </p>

          <h1>
            Where are you
            <span> dining?</span>
          </h1>

          <p className="table-description">
            Enter your table number to connect your dining
            session with SmartDine.
          </p>

          {/* Input */}
          <div className="table-input-wrapper">

            <label htmlFor="table-number">
              TABLE NUMBER
            </label>

            <div
              className={`table-input-box ${
                error ? "table-input-error" : ""
              }`}
            >
              <span className="table-prefix">
                T
              </span>

              <input
                id="table-number"
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="12"
                value={tableNumber}
                onChange={handleTableChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleContinue();
                  }
                }}
                autoFocus
              />

              {selectedTable && (
                <motion.div
                  className="table-check"
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                >
                  <Check size={17} />
                </motion.div>
              )}
            </div>

            {error && (
              <motion.p
                className="table-error-message"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Continue */}
          <button
            className="table-continue-button"
            onClick={handleContinue}
          >
            <span>
              Continue to Menu
            </span>

            <ArrowRight size={19} />
          </button>

          {/* Preview */}
          <motion.div
            className="table-preview"
            animate={{
              opacity: selectedTable ? 1 : 0.55,
              y: selectedTable ? 0 : 4,
            }}
          >
            <div className="table-preview-icon">
              <UtensilsCrossed size={17} />
            </div>

            <div className="table-preview-content">
              <span className="table-preview-label">
                YOUR TABLE
              </span>

              <strong>
                {selectedTable
                  ? `T${selectedTable}`
                  : "Waiting for table"}
              </strong>
            </div>

            <Sparkles
              size={17}
              className="table-preview-sparkle"
            />
          </motion.div>

          {/* Help text */}
          <p className="table-help">
            Your table number is usually displayed on
            the table stand or dining area.
          </p>

        </motion.section>

        {/* Footer */}
        <motion.p
          className="table-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          SmartDine · Intelligent hospitality platform
        </motion.p>

      </div>
    </main>
  );
}