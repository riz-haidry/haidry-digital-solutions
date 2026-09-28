export const fadeUp = {
  hidden: { opacity: 0, y: 52, rotateX: -7, scale: 0.955, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 78, damping: 19, mass: 0.9 },
  },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.06 } },
};
