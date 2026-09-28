import { motion, useReducedMotion } from "framer-motion";

export default function WhatsAppButton() {
  const phone = (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const reduceMotion = useReducedMotion();
  if (!phone) return null;

  const message = encodeURIComponent(
    "Hi Haidry Digital Solutions, I would like to discuss a project.",
  );
  return (
    <motion.a
      className="whatsapp-button"
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={reduceMotion ? false : { scale: 0, rotate: -16 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={reduceMotion ? undefined : { scale: 1.09, rotate: 5 }}
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 250, damping: 14 }}
    >
      <span aria-hidden="true">◉</span>
      <span className="whatsapp-label">Chat with us</span>
    </motion.a>
  );
}
