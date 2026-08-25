import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { showcase } from "../../data/dummyData";

export default function ShowcasePreview({ tab }) {
  const data = showcase[tab];
  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="showcase-ui"
    >
      <div className="showcase-windowbar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>skillcart / {tab}</span>
        <span>•••</span>
      </div>
      <div className="showcase-body">
        <div className="showcase-head">
          <div>
            <span className="preview-kicker">AI INSIGHT</span>
            <h4>{data.label}</h4>
          </div>
          <div className="tiny-avatar">AM</div>
        </div>
        <div className="showcase-columns">
          <div className="metric-panel">
            <span className="metric-ring">
              <b>{data.metric}</b>
              <small>{data.metricLabel}</small>
            </span>
            <div className="metric-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="insight-list">
            <div className="insight-title">
              What to focus on next <Sparkles size={14} />
            </div>
            <div className="insight-row">
              <span className="insight-check">
                <Check size={12} />
              </span>
              <span>Make your impact measurable</span>
              <em>High impact</em>
            </div>
            <div className="insight-row">
              <span className="insight-check">
                <Check size={12} />
              </span>
              <span>Bring skills into your summary</span>
              <em>Quick win</em>
            </div>
            <div className="insight-row">
              <span className="insight-check">
                <Check size={12} />
              </span>
              <span>Add one more project outcome</span>
              <em>Suggested</em>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
