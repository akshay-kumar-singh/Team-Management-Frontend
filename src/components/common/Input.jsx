export const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  className = "",
  disabled,
  ...rest
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-white border border-line rounded text-sm text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
          disabled ? "bg-gray-50 text-ink-subtle cursor-not-allowed" : ""
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};
