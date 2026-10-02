import { motion } from "framer-motion";

export default function MotionBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <motion.div
        className="orb orb-a"
        animate={{ x: [0, 45, -20, 0], y: [0, -30, 35, 0], scale: [1, 1.12, 0.94, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb orb-b"
        animate={{ x: [0, -50, 20, 0], y: [0, 35, -25, 0], scale: [1, 0.92, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grain" />
    </div>
  );
}