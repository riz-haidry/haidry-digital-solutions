import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "./revealVariants";

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  ...props
}) {
  const Component = motion[as];
  const reduceMotion = useReducedMotion();
  return (
    <Component
      className={className}
      variants={reduceMotion ? undefined : fadeUp}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: false, amount: 0.16 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { delay, type: "spring", stiffness: 92, damping: 16 }
      }
      {...props}
    >
      {children}
    </Component>
  );
}
