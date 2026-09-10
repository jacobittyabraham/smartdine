import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [tableNumber, setTableNumber] = useState("");
  const navigate = useNavigate();

  function continueToMenu() {
    if (!tableNumber) {
      alert("Please enter your table number.");
      return;
    }

    if (Number(tableNumber) < 1) {
      alert("Please enter a valid table number.");
      return;
    }

    localStorage.setItem("tableNumber", tableNumber);

    navigate("/menu");
  }

  return (
    <div className="home">
      <div className="home-content">

        <div className="home-logo">🍽️</div>

        <h1>Hi! 👋</h1>

        <h2>Welcome to Our Canteen</h2>

        <p>
          Enter your table number to continue.
        </p>

        <input
          className="table-input"
          type="number"
          min="1"
          placeholder="Enter Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />

        <button
          className="menu-button"
          onClick={continueToMenu}
        >
          🍴 Continue to Menu
        </button>

      </div>
    </div>
  );
}

export default Home;