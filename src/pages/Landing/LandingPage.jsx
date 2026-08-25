import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTwitter, FaLinkedin } from "react-icons/fa";
import {
  ArrowRight,
  BarChart3,
  Check,
  FileUp,
  Gauge,
  Menu,
  MessageSquareText,
  Play,
  Search,
  Sparkles,
  Target,
  Upload,
  X,
  Zap,
} from "lucide-react";

import { fadeUp, stagger } from "../../utils/animations";
import { features, steps, showcase } from "../../data/dummyData";
import Logo from "../../components/ui/Logo";
import Button from "../../components/ui/Button";
import SectionIntro from "../../components/common/SectionIntro";
import DashboardPreview from "../../components/common/DashboardPreview";
import ShowcasePreview from "../../components/common/ShowcasePreview";

// Map icon name strings from dummyData to actual lucide components
const iconMap = {
  FileUp,
  Gauge,
  Sparkles,
  Target,
  MessageSquareText,
  BarChart3,
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div id="top" className="site-shell">
      <nav className="navbar">
        <div className="nav-inner">
          <Logo />
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>
              Pricing
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
            <div className="mobile-actions">
              <Button variant="ghost" href="/auth">
                Log in
              </Button>
              <Button href="/auth" icon={ArrowRight}>
                Get started
              </Button>
            </div>
          </div>
          <div className="nav-actions">
            <Link className="login-link" to="/auth">
              Log in
            </Link>
            <Button href="/auth" icon={ArrowRight}>
              Get started
            </Button>
          </div>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="hero-section">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
          <div className="container hero-grid">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="hero-copy"
            >
              <motion.div variants={fadeUp} className="eyebrow">
                <span />
                THE AI CAREER COPILOT
              </motion.div>
              <motion.h1 variants={fadeUp}>
                Make your next move <em>remarkable.</em>
              </motion.h1>
              <motion.p variants={fadeUp}>
                SkillCart helps you turn your experience into your next
                opportunity with AI-powered tools that know what hiring teams
                look for.
              </motion.p>
              <motion.div variants={fadeUp} className="hero-actions">
                <Button href="/auth" icon={ArrowRight}>
                  Start for free
                </Button>
                <a className="demo-link" href="#showcase">
                  <span>
                    <Play size={13} fill="currentColor" />
                  </span>{" "}
                  See how it works
                </a>
              </motion.div>
              <motion.div variants={fadeUp} className="hero-note">
                <div className="avatar-stack">
                  <span>J</span>
                  <span>M</span>
                  <span>K</span>
                  <span>+</span>
                </div>
                <span>Join 12,000+ ambitious people getting career-ready</span>
              </motion.div>
            </motion.div>
            <DashboardPreview />
          </div>
          <div className="hero-bottom">
            <div className="container hero-bottom-inner">
              <span>
                Built for every step between <strong>"I'm ready"</strong> and{" "}
                <strong>"You're hired."</strong>
              </span>
              <div className="trust-logos">
                <b>notion</b>
                <b>Vercel</b>
                <b>loom</b>
                <b>stripe</b>
                <b>figma</b>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <motion.section
          id="features"
          className="section features-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          <div className="container">
            <SectionIntro
              eyebrow="YOUR CAREER, UPGRADED"
              title={
                <>
                  Everything you need to move
                  <br className="desktop-break" /> from potential to{" "}
                  <span className="accent-text">progress.</span>
                </>
              }
              text="One focused workspace for the work that makes the work happen."
            />
            <div className="feature-grid">
              {features.map(({ icon, title, text, tone }) => {
                const Icon = iconMap[icon];
                return (
                  <motion.article
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    className="feature-card"
                    key={title}
                  >
                    <div className={`feature-icon ${tone}`}>
                      {Icon && <Icon size={21} />}
                    </div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <a href="#showcase" aria-label={`Explore ${title}`}>
                      <ArrowRight size={17} />
                    </a>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── How it works ── */}
        <motion.section
          id="how-it-works"
          className="section steps-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
          variants={stagger}
        >
          <div className="container">
            <SectionIntro
              eyebrow="A BETTER WAY FORWARD"
              title="From first draft to first day."
              text="A clear, calm process that turns career momentum into a daily habit."
            />
            <div className="steps-grid">
              <div className="steps-line" />
              {steps.map((step, index) => (
                <motion.div
                  variants={fadeUp}
                  className="step-item"
                  key={step.number}
                >
                  <div className={`step-number ${index === 0 ? "active" : ""}`}>
                    {step.number}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Showcase ── */}
        <motion.section
          id="showcase"
          className="section showcase-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          <div className="container showcase-container">
            <SectionIntro
              eyebrow="ONE PLACE TO GET BETTER"
              title={
                <>
                  A little more clarity
                  <br /> goes a <span className="accent-text">long way.</span>
                </>
              }
              text="See the signal behind the noise, then make your next best move."
            />
            <div className="showcase-tabs">
              {Object.entries(showcase).map(([key, value]) => (
                <button
                  key={key}
                  className={activeTab === key ? "active" : ""}
                  onClick={() => setActiveTab(key)}
                >
                  {value.label}
                </button>
              ))}
            </div>
            <div className="showcase-grid">
              <div className="showcase-copy">
                <div className="showcase-number">
                  0{Object.keys(showcase).indexOf(activeTab) + 1}
                </div>
                <h3>{showcase[activeTab].title}</h3>
                <p>{showcase[activeTab].text}</p>
                <a className="text-link" href="#start">
                  Explore {showcase[activeTab].label.toLowerCase()}{" "}
                  <ArrowRight size={16} />
                </a>
              </div>
              <ShowcasePreview tab={activeTab} />
            </div>
          </div>
        </motion.section>

        {/* ── Benefits ── */}
        <motion.section
          className="section benefits-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="container benefits-grid">
            <SectionIntro
              eyebrow="WHY SKILLCART"
              title={
                <>
                  Your unfair advantage
                  <br /> is <span className="accent-text">consistency.</span>
                </>
              }
              text="Small improvements compound. SkillCart makes sure you always know which one matters most."
            />
            <div className="benefit-list">
              <motion.div variants={fadeUp}>
                <span className="benefit-icon">
                  <Zap size={18} />
                </span>
                <div>
                  <h3>Save time on the busywork</h3>
                  <p>
                    Let AI handle the formatting, scanning, and searching so you
                    can focus on the story.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeUp}>
                <span className="benefit-icon">
                  <Target size={18} />
                </span>
                <div>
                  <h3>Increase your odds</h3>
                  <p>
                    Show up stronger for the roles that match where you want to
                    go next.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeUp}>
                <span className="benefit-icon">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3>Get an expert in your corner</h3>
                  <p>
                    Personalized suggestions, available whenever your momentum
                    shows up.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── Testimonials ── */}
        <motion.section
          className="section testimonials-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          <div className="container">
            <SectionIntro
              eyebrow="THEY'RE MOVING FORWARD"
              title="The confidence looks good on you."
              align="center"
            />
            <div className="testimonial-grid">
              <motion.article variants={fadeUp} className="testimonial-card">
                <div className="quote-mark">"</div>
                <p>
                  SkillCart made my resume feel like me, just sharper. I went
                  from sending applications into a void to getting three
                  interviews in a week.
                </p>
                <div className="person">
                  <div className="person-avatar avatar-one">SR</div>
                  <div>
                    <strong>Samira R.</strong>
                    <span>Product Designer · Berlin</span>
                  </div>
                  <span className="stars">★★★★★</span>
                </div>
              </motion.article>
              <motion.article
                variants={fadeUp}
                className="testimonial-card featured-testimonial"
              >
                <div className="quote-mark">"</div>
                <p>
                  The interview practice is a game changer. The feedback is
                  specific enough to actually change how I answer, not just
                  generic encouragement.
                </p>
                <div className="person">
                  <div className="person-avatar avatar-two">DC</div>
                  <div>
                    <strong>David C.</strong>
                    <span>Software Engineer · Toronto</span>
                  </div>
                  <span className="stars">★★★★★</span>
                </div>
              </motion.article>
              <motion.article variants={fadeUp} className="testimonial-card">
                <div className="quote-mark">"</div>
                <p>
                  I finally have a process. My job search feels less like a
                  second job and more like a plan I can trust.
                </p>
                <div className="person">
                  <div className="person-avatar avatar-three">LP</div>
                  <div>
                    <strong>Leo P.</strong>
                    <span>Marketing Lead · London</span>
                  </div>
                  <span className="stars">★★★★★</span>
                </div>
              </motion.article>
            </div>
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <section id="start" className="cta-section">
          <div className="cta-pattern" />
          <div className="container cta-inner">
            <div className="eyebrow light">
              <span />
              YOUR NEXT CHAPTER STARTS HERE
            </div>
            <h2>
              Ready to make your
              <br />
              <em>move?</em>
            </h2>
            <p>
              Build the career you keep thinking about. Your first step is free.
            </p>
            <Button href="/auth" variant="light" icon={ArrowRight}>
              Get started free
            </Button>
            <div className="cta-note">
              <Check size={14} /> No credit card required <span />{" "}
              <Check size={14} /> Free forever plan
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer id="contact" className="footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <Logo />
            <p>
              The AI career copilot for people
              <br />
              who are going places.
            </p>
          </div>
          <div className="footer-col">
            <strong>Product</strong>
            <a href="#features">Features</a>
            <a href="#showcase">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#start">Changelog</a>
          </div>
          <div className="footer-col">
            <strong>Company</strong>
            <a href="#contact">About us</a>
            <a href="#contact">
              Careers <small>We're hiring</small>
            </a>
            <a href="#contact">Contact</a>
            <a href="#contact">Blog</a>
          </div>
          <div className="footer-col">
            <strong>Resources</strong>
            <a href="#contact">Help center</a>
            <a href="#contact">Career guides</a>
            <a href="#contact">Community</a>
            <a href="#contact">Privacy</a>
          </div>
          <div className="footer-newsletter">
            <strong>Get the good stuff.</strong>
            <p>A thoughtful note on work, once a month.</p>
            <div className="email-box">
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
              />
              <button aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 SkillCart, Inc. Made for the next move.</span>
          <div className="socials">
            <a href="#contact" aria-label="Twitter">
              <FaTwitter size={16} />
            </a>
            <a href="#contact" aria-label="LinkedIn">
              <FaLinkedin size={16} />
            </a>
            <a href="#contact" aria-label="Search">
              <Search size={16} />
            </a>
          </div>
          <span>
            Made with intention <span className="heart">♥</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
