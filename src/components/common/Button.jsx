export const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center px-3 py-1.5 rounded font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm";

  const variants = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    secondary: "bg-gray-100 text-ink border border-line hover:bg-gray-200",
    danger: "bg-danger text-white hover:bg-red-800",
    ghost: "bg-transparent text-ink-subtle hover:bg-gray-100 hover:text-ink",
    outline: "bg-transparent border border-brand text-brand hover:bg-brand-tint",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};
