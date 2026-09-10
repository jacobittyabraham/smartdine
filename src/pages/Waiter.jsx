import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
function Waiter() {
  const [message, setMessage] = useState("");

  const requests = [
    "🔔 Call Waiter",
    "💧 Need Water",
    "🍽️ Extra Plates",
    "🥄 Extra Cutlery",
    "🧻 Need Tissue",
    "🧾 Request Bill"
  ];

  function sendRequest(request) {
    setMessage(`${request} requested for Table 12`);
  }

  return (
  <>
    <Navbar />

    <main className="page">

      <Link to="/menu" className="back-link">
        ← Back to Menu
      </Link>

      <h1>🔔 Request Waiter</h1>

      <div className="table-info">
        🪑 Table No: <strong>12</strong>
      </div>

      <p className="waiter-help">
        How can we help you?
      </p>

      <div className="waiter-options">

        {requests.map((request) => (
          <button
            key={request}
            onClick={() => sendRequest(request)}
          >
            {request}
          </button>
        ))}

      </div>

      {message && (
        <div className="success">
          ✓ {message}
          <br />
          <small>
            A waiter will assist you shortly.
          </small>
        </div>
      )}

        </main>
  </>
);
}

export default Waiter;