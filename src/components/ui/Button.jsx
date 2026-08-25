import { Link } from "react-router-dom";

export default function Button({
  children,
  variant = "primary",
  href = "/auth",
  icon: Icon,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseClass = `button button-${variant} ${className}`.trim();

  if (href && href.startsWith("/")) {
    return (
      <Link to={href} className={baseClass} onClick={onClick} {...props}>
        {children}
        {Icon && <Icon size={16} strokeWidth={2.2} />}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={baseClass} href={href} onClick={onClick} {...props}>
        {children}
        {Icon && <Icon size={16} strokeWidth={2.2} />}
      </a>
    );
  }

  return (
    <button type={type} className={baseClass} onClick={onClick} {...props}>
      {children}
      {Icon && <Icon size={16} strokeWidth={2.2} />}
    </button>
  );
}
