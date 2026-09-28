import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";

function labelForSlide(element, index) {
  const heading = element.querySelector("h1, h2");
  const text = (element.dataset.slideTitle || heading?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
  return (
    text ||
    (element.classList.contains("site-footer")
      ? "Studio details"
      : `Section ${index + 1}`)
  );
}

export default function SectionDots() {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const page = document.querySelector("main.studio-home, main.inner-page");
    if (!page) return undefined;

    const sections = [...page.children].filter(
      (element) => element.tagName === "SECTION",
    );
    const footer = document.querySelector(".site-footer");
    const elements = footer ? [...sections, footer] : sections;
    const entries = elements.map((element, index) => {
      element.classList.add("snap-slide");
      return { element, title: labelForSlide(element, index) };
    });
    const slideUpdateFrame = requestAnimationFrame(() => {
      setSlides(entries);
      setActiveIndex(0);
    });

    const observer = new IntersectionObserver(
      (observed) => {
        const visibleSlides = observed.filter((entry) => entry.isIntersecting);
        visibleSlides.forEach((entry) =>
          entry.target.classList.add("slide-visible"),
        );
        const mostVisible = visibleSlides.sort(
          (first, second) => second.intersectionRatio - first.intersectionRatio,
        )[0];
        if (mostVisible) {
          mostVisible.target.classList.add("slide-current");
          entries.forEach(({ element }) => {
            if (element !== mostVisible.target)
              element.classList.remove("slide-current");
          });
          setActiveIndex(
            entries.findIndex(({ element }) => element === mostVisible.target),
          );
        }
      },
      { threshold: [0.08, 0.18, 0.35, 0.55], rootMargin: "-8% 0px -8% 0px" },
    );
    entries.forEach(({ element }) => observer.observe(element));

    return () => {
      cancelAnimationFrame(slideUpdateFrame);
      observer.disconnect();
      entries.forEach(({ element }) =>
        element.classList.remove(
          "snap-slide",
          "slide-visible",
          "slide-current",
        ),
      );
    };
  }, [pathname]);

  if (pathname.startsWith("/admin") || slides.length < 2) return null;

  return (
    <nav className="section-dots" aria-label="Page sections">
      {slides.map(({ element, title }, index) => (
        <button
          key={`${pathname}-${title}-${index}`}
          type="button"
          aria-label={`Go to ${title}`}
          aria-current={index === activeIndex ? "location" : undefined}
          title={title}
          onClick={() =>
            element.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "start",
            })
          }
        >
          <span aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
