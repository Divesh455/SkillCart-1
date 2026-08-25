import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function SectionIntro({ eyebrow, title, text, align = "left" }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`section-intro ${align === "center" ? "section-intro-center" : ""}`}
    >
      <div className="eyebrow">
        <span />
        {eyebrow}
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </motion.div>
  );
}
