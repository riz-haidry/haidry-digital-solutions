import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { fadeUp, stagger } from "../components/revealVariants";

const serviceItems = [
  {
    id: "web",
    n: "01",
    icon: "⌘",
    title: "Web development",
    intro:
      "Fast, flexible websites that feel like your business and work hard for it.",
    list: [
      "Business and service websites",
      "E-commerce and landing pages",
      "Web applications and integrations",
      "Responsive build and launch support",
    ],
  },
  {
    id: "design",
    n: "02",
    icon: "◈",
    title: "UI/UX design",
    intro:
      "Useful, expressive experiences that help customers know where to go next.",
    list: [
      "User flows and wireframes",
      "Website and product interfaces",
      "Prototypes and design systems",
      "Accessibility-minded design",
    ],
  },
  {
    id: "branding",
    n: "03",
    icon: "✳",
    title: "Branding & graphics",
    intro:
      "A recognisable visual foundation for every place your brand shows up.",
    list: [
      "Logo and visual identity",
      "Brand guidelines and collateral",
      "Social media creative",
      "Campaign posters and banners",
    ],
  },
  {
    id: "technology",
    n: "04",
    icon: "</>",
    title: "Apps & technology",
    intro: "Useful digital tools and software that help your business do more.",
    list: [
      "Web apps and custom tools",
      "Business workflow solutions",
      "API and platform integrations",
      "Ongoing improvements and support",
    ],
  },
];
const faqs = [
  [
    "How does a project usually begin?",
    "We start with a conversation about your goals, audience, timing and budget. From there, we’ll suggest a practical scope and clear next steps.",
  ],
  [
    "Can you work with an existing brand?",
    "Absolutely. We can build on the identity you already have, refine it where needed and make the digital experience feel consistent.",
  ],
  [
    "Will my website work on phones?",
    "Yes. Responsive behaviour is included in the design and build process, so the experience adapts to mobile, tablet and desktop screens.",
  ],
];

export default function Services() {
  const [openFaq, setOpenFaq] = useState(0);
  const reduceMotion = useReducedMotion();
  return (
    <main className="inner-page services-page">
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">
            <span className="eyebrow-index">WHAT WE DO /</span> Strategy, design
            and technology
          </p>
          <h1>
            Good work takes
            <br />
            <span>more than one thing.</span>
          </h1>
          <p>
            We bring the right pieces together to make your business easier to
            find, understand and choose.
          </p>
          <Link className="button button-primary" to="/contact">
            Let’s plan your project <span>→</span>
          </Link>
        </div>
        <motion.div
          className="page-hero-orb"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          ✳
        </motion.div>
      </section>
      <Reveal as="section" className="services-detail section-pad">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">
              <span className="eyebrow-index">01 /</span> Our services
            </p>
            <h2>
              One trusted team.
              <br />
              <span>A few good ways to help.</span>
            </h2>
          </div>
          <motion.div
            className="service-detail-list"
            variants={stagger}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.12 }}
          >
            {serviceItems.map((item) => (
              <motion.article
                className="service-detail-card"
                id={item.id}
                key={item.id}
                variants={fadeUp}
              >
                <div className="detail-heading">
                  <span className="detail-number">{item.n}</span>
                  <motion.i
                    whileHover={
                      reduceMotion ? undefined : { rotate: 16, scale: 1.12 }
                    }
                  >
                    {item.icon}
                  </motion.i>
                </div>
                <div className="detail-copy">
                  <h3>{item.title}</h3>
                  <p>{item.intro}</p>
                  <ul>
                    {item.list.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
                <Link className="detail-link" to="/contact">
                  Talk to us about this <span>↗</span>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </Reveal>
      <Reveal as="section" className="faq-section section-pad">
        <div className="container faq-layout">
          <div className="faq-intro">
            <p className="eyebrow">
              <span className="eyebrow-index">02 /</span> Good to know
            </p>
            <h2>
              Good questions.
              <br />
              <span>Clear answers.</span>
            </h2>
            <p className="faq-intro-copy">
              A few useful details to help you feel confident about getting
              started.
            </p>
            <Link className="faq-contact-link" to="/contact">
              Have another question? <span>Let’s talk ↗</span>
            </Link>
          </div>
          <motion.div
            className="faq-list"
            variants={reduceMotion ? undefined : stagger}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: false, amount: 0.18 }}
          >
            {faqs.map(([question, answer], index) => (
              <motion.article
                className={`faq-item${openFaq === index ? " is-open" : ""}`}
                key={question}
                variants={reduceMotion ? undefined : fadeUp}
              >
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                >
                  <span className="faq-number">0{index + 1}</span>
                  <span className="faq-question-text">{question}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    <motion.i
                      animate={
                        reduceMotion
                          ? undefined
                          : { rotate: openFaq === index ? 45 : 0 }
                      }
                    >
                      +
                    </motion.i>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      className="faq-answer"
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        reduceMotion ? undefined : { height: 0, opacity: 0 }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.32,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="faq-answer-inner">
                        <p>{answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </Reveal>
      <section className="inner-cta">
        <div className="container inner-cta-content">
          <p className="eyebrow">Have a project in mind?</p>
          <h2>
            Let’s make the
            <br />
            next move yours.
          </h2>
          <Link className="button button-light" to="/contact">
            Start a conversation <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
