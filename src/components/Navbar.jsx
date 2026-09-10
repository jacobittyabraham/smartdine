import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        🍽️ SmartDine
      </Link>

      <div className="nav-links">

        <Link to="/menu">
          Menu
        </Link>

        <Link to="/cart">
          🛒 Cart
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;