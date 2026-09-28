import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "../components/Reveal";
import { fadeUp, stagger } from "../components/revealVariants";
import { submitInquiry } from "../services/api";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  service: "Website development",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const reduceMotion = useReducedMotion();

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      await submitInquiry(form);
      setStatus({
        state: "success",
        message: "Your enquiry has been sent. We’ll be in touch soon.",
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error.message ||
          "We could not send that just now. Please try again in a moment.",
      });
    }
  };

  return (
    <main className="inner-page contact-page">
      <section className="page-hero contact-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">
            <span className="eyebrow-index">CONTACT /</span> Your next move
            starts here
          </p>
          <h1>
            Let’s make
            <br />
            <span>something matter.</span>
          </h1>
          <p>
            Tell us what you’re thinking. A few details are enough to get a
            useful first conversation going.
          </p>
        </div>
        <motion.div
          className="contact-hero-mark"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        >
          ✳
        </motion.div>
      </section>
      <Reveal as="section" className="contact-main section-pad">
        <div className="container contact-layout">
          <div className="contact-copy">
            <p className="eyebrow">
              <span className="eyebrow-index">01 /</span> Tell us about it
            </p>
            <h2>
              What are you
              <br />
              <span>looking to make?</span>
            </h2>
            <p>
              Share a little about your business, the challenge you want to
              solve or the idea you’re excited about. We’ll take it from there.
            </p>
            <div className="contact-promise">
              <motion.span
                animate={reduceMotion ? undefined : { scale: [1, 1.14, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✦
              </motion.span>
              <span>
                Thoughtful conversations.
                <br />
                No hard sell.
              </span>
            </div>
          </div>
          <div className="contact-form-wrap">
            <AnimatePresence mode="wait" initial={false}>
              {status.state === "success" ? (
                <motion.div
                  key="success"
                  className="form-success"
                  initial={reduceMotion ? false : "hidden"}
                  animate="show"
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                  variants={fadeUp}
                  role="status"
                >
                  <motion.span
                    className="success-icon"
                    animate={
                      reduceMotion
                        ? undefined
                        : { rotate: [0, 10, -10, 0], scale: [1, 1.12, 1] }
                    }
                    transition={{ duration: 1.4 }}
                  >
                    ✓
                  </motion.span>
                  <h3>Thanks for reaching out.</h3>
                  <p>{status.message}</p>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => setStatus({ state: "idle", message: "" })}
                  >
                    Send another enquiry <span>↗</span>
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="contact-form"
                  onSubmit={handleSubmit}
                  variants={stagger}
                  initial={reduceMotion ? false : "hidden"}
                  animate="show"
                  exit={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                >
                  <motion.div className="form-heading" variants={fadeUp}>
                    <span>01 — YOUR DETAILS</span>
                    <span>* REQUIRED</span>
                  </motion.div>
                  <motion.div className="form-row" variants={stagger}>
                    <motion.label variants={fadeUp}>
                      Your name *
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={update}
                        placeholder="e.g. Alex Morgan"
                      />
                    </motion.label>
                    <motion.label variants={fadeUp}>
                      Phone number *
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={form.phone}
                        onChange={update}
                        placeholder="+91 00000 00000"
                      />
                    </motion.label>
                  </motion.div>
                  <motion.label variants={fadeUp}>
                    Email address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={update}
                      placeholder="you@company.com"
                    />
                  </motion.label>
                  <motion.label variants={fadeUp}>
                    What can we help with? *
                    <select
                      name="service"
                      value={form.service}
                      onChange={update}
                    >
                      <option>Website development</option>
                      <option>UI/UX design</option>
                      <option>Branding & graphics</option>
                      <option>Posters & campaign design</option>
                      <option>Apps & technology</option>
                      <option>Something else</option>
                    </select>
                  </motion.label>
                  <motion.label variants={fadeUp}>
                    A little about your project
                    <textarea
                      name="message"
                      rows="4"
                      value={form.message}
                      onChange={update}
                      placeholder="What would you like to make happen?"
                    />
                  </motion.label>
                  <motion.button
                    className="button button-dark form-submit"
                    type="submit"
                    disabled={status.state === "sending"}
                    whileHover={
                      reduceMotion ? undefined : { y: -3, scale: 1.01 }
                    }
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    {status.state === "sending"
                      ? "Sending…"
                      : "Send project enquiry"}{" "}
                    <span>↗</span>
                  </motion.button>
                  <motion.p
                    className={`form-message ${status.state}`}
                    role={status.state === "error" ? "alert" : undefined}
                    variants={fadeUp}
                  >
                    {status.message ||
                      "Your details are only used to follow up on this enquiry."}
                  </motion.p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
