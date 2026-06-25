import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "About",    to: "/" },
  { label: "Projects", to: "/projects" },
];

const Navbar = () => {
  const [open, setOpen]  = useState(false);
  const { pathname }     = useLocation();
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* logo */}
      <Link to="/" className="navbar__logo" aria-label="Home">
        Rev
        <span className="navbar__logo-slash">/</span>
      </Link>

      {/* desktop */}
      <ul className="navbar__links" role="list">
        {NAV_LINKS.map(({ label, to }) => (
          <li key={to}>
            <Link
              to={to}
              className={`navbar__link ${isActive(to) ? "active" : ""}`}
              aria-current={isActive(to) ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* hamburger */}
      <button
        className={`navbar__hamburger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-drawer"
      >
        <span /><span /><span />
      </button>

      {/* mobile drawer */}
      <div id="mobile-drawer" className={`navbar__drawer ${open ? "open" : ""}`} role="menu">
        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            role="menuitem"
            className={`navbar__drawer-link ${isActive(to) ? "active" : ""}`}
            aria-current={isActive(to) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;