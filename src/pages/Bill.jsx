import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Bill() {
  const [paymentMessage, setPaymentMessage] = useState("");

  const foodTotal =
    Number(localStorage.getItem("orderTotal")) || 500;

  const gst = Math.round(foodTotal * 0.05);

  const total = foodTotal + gst;

  function payNow() {
    setPaymentMessage(
      `Payment successful! Amount paid: ₹${total}`
    );
  }

  return (
  <>
    <Navbar />

    <main className="page">

      <Link to="/menu" className="back-link">
        ← Back to Menu
      </Link>

      <div className="bill-card">

        <h1>🧾 Your Bill</h1>

        <p className="hotel-name">
          SmartDine Canteen
        </p>

        <p>
          Table No: <strong>12</strong>
        </p>

        <hr />

        <div className="bill-row">
          <span>Food Total</span>
          <strong>₹{foodTotal}</strong>
        </div>

        <div className="bill-row">
          <span>GST (5%)</span>
          <strong>₹{gst}</strong>
        </div>

        <hr />

        <div className="bill-row total-row">
          <span>Total</span>
          <strong>₹{total}</strong>
        </div>

        <button
          className="order-button"
          onClick={payNow}
        >
          💳 Pay Now
        </button>

        {paymentMessage && (
          <div className="payment-success">
            ✓ {paymentMessage}
            <br />
            <small>
              Thank you for dining with SmartDine!
            </small>
          </div>
        )}

      </div>

        </main>
  </>
);
}

export default Bill;