import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import logo from "../assets/logo-640.png";

const footerLinks = [
  { label: "Services", to: "/services" },
  { label: "Selected work", to: "/portfolio" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  const reduceMotion = useReducedMotion();
  return (
    <Reveal as="footer" className="site-footer">
      <div className="footer-ambient" aria-hidden="true">
        <span />
        <span />
        <i>✳</i>
      </div>
      <div className="container footer-shell">
        <div className="footer-eyebrow">
          <span className="footer-live-dot" /> Independent digital studio{" "}
          <span className="footer-eyebrow-divider">/</span> India
        </div>
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link
              className="brand footer-brand"
              to="/"
              aria-label="Haidry Digital home"
            >
              <motion.img
                className="brand-logo"
                src={logo}
                alt=""
                whileHover={
                  reduceMotion ? undefined : { rotate: -5, scale: 1.08 }
                }
              />
              <span>
                Haidry Digital<small>Built for what’s next.</small>
              </span>
            </Link>
            <p>
              Ideas into a better
              <br />
              digital presence.
            </p>
          </div>
          <div className="footer-cta-block">
            <p className="footer-cta-kicker">Have a good idea?</p>
            <h2>
              Let’s make it
              <br />
              <em>matter.</em>
            </h2>
            <motion.div
              className="footer-contact-wrap"
              whileHover={reduceMotion ? undefined : { y: -4 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <Link className="footer-contact-link" to="/contact">
                <span>
                  <strong>Start a project</strong>
                  <small>Tell us what you’re building</small>
                </span>
                <motion.i
                  aria-hidden="true"
                  animate={
                    reduceMotion ? undefined : { x: [0, 3, 0], y: [0, -3, 0] }
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                  }
                >
                  ↗
                </motion.i>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="footer-link-row">
          <span className="footer-link-label">Explore</span>
          <nav aria-label="Footer navigation">
            {footerLinks.map(({ label, to }, index) => (
              <Link key={to} to={to}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
                <i aria-hidden="true">↗</i>
              </Link>
            ))}
          </nav>
          <button
            className="footer-back-top"
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: reduceMotion ? "auto" : "smooth",
              })
            }
          >
            Back to top <span>↑</span>
          </button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Haidry Digital Solutions</span>
          <span>
            Made with intention in India <i>✳</i>
          </span>
          <span className="footer-bottom-note">
            Design <b>·</b> Development <b>·</b> Digital
          </span>
        </div>
      </div>
    </Reveal>
  );
}
