import React from "react";

/**
 * Flexible Skeleton loader UI primitive component with light and dark mode shimmer support.
 */
export default function Skeleton({
  className = "",
  variant = "rectangular", // 'text' | 'circular' | 'rectangular' | 'pill'
  theme = "light", // 'light' | 'dark'
  animate = true,
  ...props
}) {
  const baseClasses = theme === "dark" ? "skeleton-dark-shimmer-bg" : "skeleton-shimmer-bg";

  let roundedClass = "rounded-xl";
  if (variant === "circular") roundedClass = "rounded-full";
  if (variant === "pill") roundedClass = "rounded-full";
  if (variant === "text") roundedClass = "rounded-md";

  return (
    <div
      className={`relative overflow-hidden ${baseClasses} ${roundedClass} ${className}`}
      {...props}
    />
  );
}
