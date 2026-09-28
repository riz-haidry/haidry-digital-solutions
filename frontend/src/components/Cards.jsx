import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp } from "./revealVariants";

const MotionLink = motion.create(Link);

export function ServiceCard({ service }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className="service-card"
      variants={reduceMotion ? undefined : fadeUp}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -10,
              rotateX: 2,
              rotateY: 3,
              scale: 1.015,
              boxShadow: "0 28px 62px rgba(0,0,0,.28)",
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
    >
      <div className="service-card-top">
        <span>{service.number}</span>
        <motion.i
          whileHover={
            reduceMotion ? undefined : { rotate: [0, -12, 12, 0], scale: 1.16 }
          }
        >
          {service.icon}
        </motion.i>
      </div>
      <h3>{service.title}</h3>
      <p>{service.description ?? service.text}</p>
      <div className="service-card-bottom">
        <span>Strategy · Craft · Care</span>
        <MotionLink to={service.to} aria-label={`Learn about ${service.title}`}>
          Explore{" "}
          <svg
            className="arrow-icon"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M5 15 15 5M6 5h9v9" />
          </svg>
        </MotionLink>
      </div>
    </motion.article>
  );
}

export function ConceptCard({ project }) {
  const reduceMotion = useReducedMotion();
  const conceptText =
    project.id === "01" ? (
      <>
        Shape
        <br />
        <em>your day.</em>
      </>
    ) : project.id === "02" ? (
      <>
        Make it
        <br />
        <em>make sense.</em>
      </>
    ) : (
      <>
        Good work,
        <br />
        <em>close by.</em>
      </>
    );
  const initial = project.id === "01" ? "F" : project.id === "02" ? "N" : "M";
  return (
    <motion.article
      className="portfolio-card"
      variants={fadeUp}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -10, rotateX: 2, rotateY: 2, scale: 1.012 }
      }
    >
      <div className={`portfolio-art ${project.skin}`}>
        <div className="portfolio-art-nav">
          <span>
            {project.name}
            <b>✳</b>
          </span>
          <span>STUDIO CONCEPT&nbsp;&nbsp;↗</span>
        </div>
        <div className="portfolio-art-title">{conceptText}</div>
        <div className="portfolio-art-element">{initial}</div>
        <div className="portfolio-art-caption">{project.type}</div>
      </div>
      <div className="portfolio-card-meta">
        <div>
          <span>
            {project.id} / {project.category}
          </span>
          <h3>{project.title}</h3>
        </div>
        <motion.span
          className="project-arrow"
          whileHover={reduceMotion ? undefined : { rotate: 45 }}
        >
          ↗
        </motion.span>
      </div>
    </motion.article>
  );
}
