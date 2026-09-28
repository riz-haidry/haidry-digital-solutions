import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import CampaignGallery from "../components/CampaignGallery";
import { stagger } from "../components/revealVariants";
import { ConceptCard } from "../components/Cards";
import { apiRequest, resolveMediaUrl } from "../services/api";

const concepts = [
  {
    id: "01",
    name: "FORME",
    title: "A calmer kind of commerce.",
    type: "E-commerce concept",
    skin: "portfolio-forme",
    category: "Brand & digital",
  },
  {
    id: "02",
    name: "NOVA",
    title: "Clarity for complex things.",
    type: "Product experience concept",
    skin: "portfolio-nova",
    category: "UI/UX design",
  },
  {
    id: "03",
    name: "MONO",
    title: "A sharper local presence.",
    type: "Service business concept",
    skin: "portfolio-mono",
    category: "Web development",
  },
];

function UploadedWork() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let isActive = true;
    apiRequest("/portfolio")
      .then((result) => {
        if (isActive) setItems(result.data ?? []);
      })
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, []);

  if (!items.length) return null;

  return (
    <Reveal
      as="section"
      className="uploaded-work-section section-pad"
      id="client-work"
    >
      <div className="container">
        <div className="section-heading heading-split">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-index">CLIENT WORK /</span> Made at
              Haidry
            </p>
            <h2>
              Real projects,
              <br />
              <span>made with care.</span>
            </h2>
          </div>
          <p className="section-lede">
            A selection of our latest design, development and creative work.
          </p>
        </div>
        <div className="uploaded-work-grid">
          {items.map((item) => (
            <article className="uploaded-work-card" key={item._id}>
              <div
                className="uploaded-work-media"
                style={{
                  aspectRatio:
                    (Number(item.displayWidth) || 1200) +
                    " / " +
                    (Number(item.displayHeight) || 800),
                }}
              >
                {item.mediaType === "video" ? (
                  <video
                    src={resolveMediaUrl(item.mediaUrl)}
                    controls
                    preload="metadata"
                    playsInline
                    style={{
                      objectFit:
                        item.fitMode === "contain" ? "contain" : "cover",
                    }}
                    aria-label={item.title + " project video"}
                  />
                ) : (
                  <img
                    src={resolveMediaUrl(item.mediaUrl)}
                    alt={item.title}
                    loading="lazy"
                    style={{
                      objectFit:
                        item.fitMode === "contain" ? "contain" : "cover",
                    }}
                  />
                )}
              </div>
              <div className="uploaded-work-copy">
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function Portfolio() {
  const reduceMotion = useReducedMotion();
  return (
    <main className="inner-page portfolio-page">
      <section className="page-hero portfolio-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">
            <span className="eyebrow-index">THE PORTFOLIO /</span> Studio
            explorations
          </p>
          <h1>
            Thoughtful ideas,
            <br />
            <span>made visible.</span>
          </h1>
          <p>
            A peek at the directions we like to explore. These concept pieces
            show our approach to brand, design and digital craft.
          </p>
          <a className="button button-primary" href="#concepts">
            See the concepts <span>↓</span>
          </a>
        </div>
        <motion.div
          className="portfolio-hero-shape"
          animate={
            reduceMotion ? undefined : { rotate: [0, 9, -7, 0], y: [0, -10, 0] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <span>H</span>
          <i>✳</i>
        </motion.div>
      </section>
      <UploadedWork />
      <Reveal
        as="section"
        className="portfolio-showcase section-pad"
        id="concepts"
      >
        <div className="container">
          <div className="section-heading heading-split">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-index">01 /</span> Concept work
              </p>
              <h2>
                Each idea has
                <br />
                <span>its own energy.</span>
              </h2>
            </div>
            <p className="section-lede">
              Explorations created to show different visual directions across
              brand, design and digital craft.
            </p>
          </div>
          <motion.div
            className="portfolio-grid"
            variants={stagger}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.1 }}
          >
            {concepts.map((project) => (
              <ConceptCard project={project} key={project.id} />
            ))}
          </motion.div>
          <p className="portfolio-disclaimer">
            Concept explorations only. These are not commissioned client
            projects or performance claims.
          </p>
        </div>
      </Reveal>
      <CampaignGallery compact />
      <Reveal as="section" className="portfolio-cta">
        <div className="container portfolio-cta-inner">
          <motion.span
            className="cta-star"
            animate={reduceMotion ? undefined : { rotate: 180 }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            ✳
          </motion.span>
          <div>
            <p className="eyebrow">Your idea could be next</p>
            <h2>
              Let’s make something
              <br />
              <span>that feels like you.</span>
            </h2>
          </div>
          <Link className="button button-light" to="/contact">
            Tell us about it <span>↗</span>
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
