import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function OrderTracking() {
  return (
  <>
    <Navbar />

    <main className="page">

      <Link to="/menu" className="back-link">
        ← Back to Menu
      </Link>

      <h1>🍽️ Order Tracking</h1>

      <div className="table-info">
        🪑 Table No: <strong>12</strong>
      </div>

      <div className="order-number">
        <p>Order Number</p>
        <h2>#1042</h2>
      </div>

      <div className="estimated">
        <p>Estimated preparation time</p>
        <h1>⏱️ 15 Minutes</h1>
      </div>

      <div className="tracking">

        <div className="status completed">
          <span>✓</span>
          <div>
            <strong>Order Placed</strong>
            <small>Order received successfully</small>
          </div>
        </div>

        <div className="status completed">
          <span>✓</span>
          <div>
            <strong>Kitchen Accepted</strong>
            <small>Your order is accepted</small>
          </div>
        </div>

        <div className="status current">
          <span>🔵</span>
          <div>
            <strong>Preparing</strong>
            <small>Your food is being prepared</small>
          </div>
        </div>

        <div className="status">
          <span>○</span>
          <div>
            <strong>Ready</strong>
            <small>Your food will be served soon</small>
          </div>
        </div>

        <div className="status">
          <span>○</span>
          <div>
            <strong>Served</strong>
            <small>Enjoy your meal!</small>
          </div>
        </div>

      </div>

      <div className="service-area">

        <Link
          to="/waiter"
          className="service-button"
        >
          🔔 Request Waiter
        </Link>

        <Link
          to="/bill"
          className="service-button"
        >
          🧾 Request Bill
        </Link>

      </div>

        </main>
  </>
);
}

export default OrderTracking;