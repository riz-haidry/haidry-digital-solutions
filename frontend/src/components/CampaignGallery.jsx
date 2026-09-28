import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import concertImage from "../assets/unsplash-concert-campaign.jpg";
import skincareImage from "../assets/unsplash-skincare-campaign.jpg";
import coffeeImage from "../assets/unsplash-coffee-campaign.jpg";
import architectureImage from "../assets/unsplash-orange-architecture.jpg";

const posters = [
  {
    id: "01",
    label: "EVENT POSTER",
    title: (
      <>
        MAKE SOME
        <br />
        <em>noise.</em>
      </>
    ),
    note: "Music & culture campaign",
    image: concertImage,
    alt: "Concert crowd under stage lights, used in an original event poster concept",
    skin: "campaign-concert",
  },
  {
    id: "02",
    label: "PRODUCT CAMPAIGN",
    title: (
      <>
        COLOR YOUR
        <br />
        <em>everyday.</em>
      </>
    ),
    note: "Beauty product launch",
    image: skincareImage,
    alt: "Colorful skincare bottles arranged for a product advertising concept",
    skin: "campaign-product",
  },
  {
    id: "03",
    label: "PROMO POSTER",
    title: (
      <>
        A BETTER
        <br />
        <em>kind of brew.</em>
      </>
    ),
    note: "Coffee shop promotion",
    image: coffeeImage,
    alt: "Coffee and roasted beans photographed for a cafe campaign poster concept",
    skin: "campaign-coffee",
  },
];

export default function CampaignGallery({ compact = false }) {
  const reduceMotion = useReducedMotion();
  return (
    <section
      className={`campaign-section section-pad${compact ? " campaign-section-compact" : ""}`}
      id="campaigns"
    >
      <div className="container">
        <Reveal>
          <div className="campaign-heading">
            <div>
              <p className="studio-kicker">
                <span /> CAMPAIGN & PRINT DESIGN
              </p>
              <h2>
                Posters and banners
                <br />
                <span>made to stop the scroll.</span>
              </h2>
            </div>
            <p>
              From a bold launch poster to a wide-format brand banner, we shape
              campaign visuals around the moment they need to make.
            </p>
          </div>
        </Reveal>
        <div className="campaign-poster-grid">
          {posters.map((poster, index) => (
            <motion.article
              className={`campaign-poster ${poster.skin}`}
              key={poster.id}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 48, rotateX: 8, scale: 0.96 }
              }
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{
                duration: 0.65,
                delay: reduceMotion ? 0 : index * 0.1,
                ease: [0.2, 0.75, 0.25, 1],
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -10,
                      rotateY: index === 1 ? 3 : -3,
                      rotateX: 2,
                      scale: 1.015,
                    }
              }
            >
              <div className="campaign-poster-photo">
                <img src={poster.image} alt={poster.alt} loading="lazy" />
              </div>
              <div className="campaign-poster-overlay">
                <span>{poster.label} / HAIDRY STUDIO CONCEPT</span>
                <h3>{poster.title}</h3>
                <i>{poster.note}</i>
              </div>
              <span className="campaign-poster-number">{poster.id}</span>
            </motion.article>
          ))}
        </div>
        <Reveal className="campaign-banner-card">
          <img
            src={architectureImage}
            alt="Vibrant orange architecture, used in an original brand launch banner concept"
            loading="lazy"
          />
          <div className="campaign-banner-shade" />
          <div className="campaign-banner-copy">
            <span>WIDE-FORMAT BRAND BANNER / STUDIO CONCEPT</span>
            <h3>
              Make room
              <br />
              for <em>what’s next.</em>
            </h3>
            <Link to="/contact">
              Plan a campaign <b>↗</b>
            </Link>
          </div>
          <span className="campaign-banner-edge">
            CAMPAIGNS · PRINT · DIGITAL
          </span>
        </Reveal>
        <p className="campaign-disclaimer">
          Original layout concepts using licensed stock photography. Photography
          is credited in the project assets.
        </p>
      </div>
    </section>
  );
}
