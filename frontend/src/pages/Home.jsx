import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import CampaignGallery from "../components/CampaignGallery";
import ThreeStudioScene from "../components/ThreeStudioScene";
import brandingImage from "../assets/75496b03e72084e746dfb04e83a274cc.jpg";
import uiImage from "../assets/440b946255040a7158c8fa0ad1cce833.jpg";
import webImage from "../assets/30a4c1ef9e7e07a3d8ec7bbab6125582.jpg";
import productImage from "../assets/11ffcff027e910c23ff708e96a83cb28.jpg";

const services = [
  {
    number: "01",
    category: "Brand & visual identity",
    title: "Graphic design that gets remembered.",
    copy: "Logos, brand systems and campaign graphics with a clear point of view.",
    image: brandingImage,
    alt: "Brand identity and business card design presentation",
    tag: "GRAPHIC DESIGN",
    anchor: "branding",
  },
  {
    number: "02",
    category: "Digital product design",
    title: "Digital experiences made simple.",
    copy: "Research-led UI/UX, wireframes and polished interfaces built around real people.",
    image: uiImage,
    alt: "Mobile and desktop user interface design screens",
    tag: "UI / UX DESIGN",
    anchor: "design",
  },
  {
    number: "03",
    category: "Web design & development",
    title: "Websites built to move you forward.",
    copy: "Responsive business websites and online stores, designed to look sharp and work hard.",
    image: webImage,
    alt: "Responsive online store website design",
    tag: "WEB DEVELOPMENT",
    anchor: "web",
  },
  {
    number: "04",
    category: "Apps & technology",
    title: "Useful tech, from idea to launch.",
    copy: "Web apps, digital tools and practical software that help your business do more.",
    image: productImage,
    alt: "Mobile commerce product interface design",
    tag: "APP & TECH",
    anchor: "technology",
  },
];

const proofPoints = [
  ["01", "Clear thinking", "A focused plan before the pixels."],
  ["02", "Design that fits", "Made around your audience and goals."],
  ["03", "Built with care", "Responsive, reliable and ready to grow."],
];

function Arrow({ diagonal = false }) {
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3 10h13m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroArtY = useTransform(scrollYProgress, [0, 1], [0, 74]);
  const heroArtTilt = useTransform(scrollYProgress, [0, 1], [0, -7]);
  const heroCopyY = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const enter = reduceMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          y: 42,
          rotateX: -6,
          scale: 0.96,
          filter: "blur(8px)",
        },
        whileInView: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          filter: "blur(0px)",
        },
        viewport: { once: false, amount: 0.18 },
        transition: { duration: 0.72, ease: [0.2, 0.75, 0.25, 1] },
      };

  return (
    <main className="studio-home">
      <section ref={heroRef} className="studio-hero" id="home">
        <div className="container studio-hero-layout">
          <motion.div
            className="studio-hero-copy"
            style={reduceMotion ? undefined : { y: heroCopyY }}
            {...enter}
          >
            <p className="studio-kicker">
              <span /> INDEPENDENT DIGITAL STUDIO · INDIA
            </p>
            <h1>
              Good ideas deserve <span>great design.</span>
            </h1>
            <p className="studio-hero-lede">
              We build brands, websites and digital products that help ambitious
              businesses look their best and work smarter.
            </p>
            <div className="studio-hero-actions">
              <Link
                className="studio-button studio-button-primary"
                to="/contact"
              >
                Let’s talk about your project <Arrow />
              </Link>
              <a className="studio-text-link" href="#services">
                Explore our services <span>↓</span>
              </a>
            </div>
            <div className="studio-hero-meta">
              <span>BRANDING</span>
              <i />
              <span>DESIGN</span>
              <i />
              <span>DEVELOPMENT</span>
            </div>
          </motion.div>
          <motion.div
            className="studio-hero-art"
            aria-label="Selected brand and website design work"
            style={
              reduceMotion
                ? undefined
                : {
                    y: heroArtY,
                    rotateX: heroArtTilt,
                    transformPerspective: 1300,
                  }
            }
          >
            <ThreeStudioScene />
            <div className="studio-art-index">
              CREATIVE × TECHNOLOGY
              <br />
              <strong>MADE TO WORK.</strong>
            </div>
          </motion.div>
        </div>
        <div className="container studio-hero-bottom">
          <span>DESIGN PARTNER FOR WHAT’S NEXT</span>
          <a href="#services">
            SCROLL TO EXPLORE <span>↓</span>
          </a>
        </div>
      </section>

      <section className="studio-services section-pad" id="services">
        <div className="container">
          <Reveal>
            <div className="studio-section-head">
              <div>
                <p className="studio-kicker">
                  <span /> WHAT WE DO
                </p>
                <h2>
                  One team for your
                  <br />
                  <span>next big move.</span>
                </h2>
              </div>
              <p>
                From your first logo to your next digital product, we bring good
                design and dependable development together.
              </p>
            </div>
          </Reveal>
          <div className="studio-service-grid">
            {services.map((service) => (
              <motion.article
                className="studio-service-card"
                key={service.number}
                style={{ transformPerspective: 1300 }}
                {...enter}
                transition={{
                  duration: 0.72,
                  delay: reduceMotion ? 0 : (Number(service.number) - 1) * 0.12,
                  ease: [0.2, 0.75, 0.25, 1],
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -12,
                        rotateX: 2.5,
                        rotateY: Number(service.number) % 2 ? 2 : -2,
                        scale: 1.018,
                      }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              >
                <Link
                  className="studio-service-image"
                  to={`/services#${service.anchor}`}
                  aria-label={`Explore ${service.category}`}
                >
                  <img src={service.image} alt={service.alt} loading="lazy" />
                  <span className="studio-image-tag">{service.tag}</span>
                  <span className="studio-image-arrow">
                    <Arrow diagonal />
                  </span>
                </Link>
                <div className="studio-service-copy">
                  <div className="studio-service-overline">
                    <span>{service.number} / 04</span>
                    <span>{service.category}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <Link
                    className="studio-card-link"
                    to={`/services#${service.anchor}`}
                  >
                    Explore this service <Arrow />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <CampaignGallery />

      <section className="studio-showcase section-pad" id="work">
        <div className="container studio-showcase-layout">
          <Reveal className="studio-showcase-copy">
            <p className="studio-kicker">
              <span /> A LITTLE OF WHAT WE DO
            </p>
            <h2>
              From the first sketch
              <br />
              to the <span>final screen.</span>
            </h2>
            <p>
              Distinctive identities, intuitive interfaces and websites with the
              details taken care of.
            </p>
            <Link className="studio-button studio-button-light" to="/portfolio">
              See selected work <Arrow />
            </Link>
          </Reveal>
          <div className="studio-showcase-images">
            <Reveal className="studio-showcase-main">
              <img
                src={webImage}
                alt="E-commerce website and digital storefront design"
                loading="lazy"
              />
              <span>WEB DESIGN & DEVELOPMENT</span>
            </Reveal>
            <Reveal className="studio-showcase-small">
              <img
                src={brandingImage}
                alt="Brand identity system and stationery mockup"
                loading="lazy"
              />
              <span>BRAND IDENTITY</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="studio-approach section-pad">
        <div className="container">
          <Reveal>
            <div className="studio-approach-heading">
              <p className="studio-kicker">
                <span /> HOW WE WORK
              </p>
              <h2>
                Thoughtful at every
                <br />
                <span>step of the process.</span>
              </h2>
            </div>
          </Reveal>
          <div className="studio-proof-grid">
            {proofPoints.map(([number, title, copy]) => (
              <Reveal className="studio-proof" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="studio-contact-cta">
        <div className="container studio-contact-inner">
          <div>
            <p className="studio-kicker">
              <span /> HAVE A PROJECT IN MIND?
            </p>
            <h2>
              Let’s make your
              <br />
              <span>next move count.</span>
            </h2>
          </div>
          <Link className="studio-button studio-button-primary" to="/contact">
            Tell us what you’re building <Arrow diagonal />
          </Link>
        </div>
      </section>
    </main>
  );
}
