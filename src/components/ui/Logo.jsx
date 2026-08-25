export default function Logo({ compact = false }) {
  return (
    <a className="logo" href="#top" aria-label="SkillCart home">
      <span className="logo-mark">
        <span />
      </span>
      <span>{compact ? "skillcart" : "skillcart"}</span>
    </a>
  );
}
