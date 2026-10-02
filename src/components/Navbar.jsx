import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const links = [["/", "Home"], ["/menu", "Menu"], ["/tracking", "Track"], ["/waiter", "Service"]];

  return (
    <header className="nav-wrap">
      <Link to="/" className="brand">
        <span className="brand-symbol">✦</span>
        <span>Smart<span>Dine</span></span>
      </Link>

      <nav>
        {links.map(([path, label]) => (
          <Link key={path} className={location.pathname === path ? "active" : ""} to={path}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="nav-right">
        <Link className="nav-cart" to="/cart">
          <ShoppingBag size={16} /> Cart <ArrowUpRight size={14} />
        </Link>
        <Link className="staff-link" to="/staff">Staff</Link>
      </div>
    </header>
  );
}