import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo-640.png";

const MotionNavLink = motion.create(NavLink);

const links = [
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Our work" },
  { to: "/portfolio#campaigns", label: "Campaigns" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onKeyDown = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.header
      className={`site-header${scrolled ? " is-scrolled" : ""}`}
      initial={reduceMotion ? false : { y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="container header-inner">
        <Link
          className="brand"
          to="/"
          onClick={closeMenu}
          aria-label="Haidry Digital Solutions home"
        >
          <motion.img
            className="brand-logo"
            src={logo}
            alt=""
            whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 4 }}
            transition={{ type: "spring", stiffness: 280, damping: 14 }}
          />
          <span>
            Haidry Digital<small>Solutions for what’s next.</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          {links.map((item) => (
            <MotionNavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              whileHover={reduceMotion ? undefined : { y: -3 }}
            >
              {item.label}
            </MotionNavLink>
          ))}
        </nav>
        <motion.div
          whileHover={reduceMotion ? undefined : { y: -3 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          <Link className="header-cta" to="/contact">
            Start a project <span>↗</span>
          </Link>
        </motion.div>
        <motion.button
          className="menu-toggle"
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        >
          <span />
          <span />
        </motion.button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
          >
            {links.map((item, index) => (
              <MotionNavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={reduceMotion ? undefined : { x: 5 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
              >
                {item.label}
              </MotionNavLink>
            ))}
            <motion.div whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
              <Link
                className="nav-mobile-cta"
                to="/contact"
                onClick={closeMenu}
              >
                Start a project <span>↗</span>
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
