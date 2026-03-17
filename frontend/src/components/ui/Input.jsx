const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  name,
  maxLength,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1">
      {/* label shown above input */}
      {label && (
        <label className="text-sm font-medium text-campus-dark">{label}</label>
      )}

      {/* the actual input field */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-2.5 rounded-lg border text-campus-dark placeholder:text-campus-muted text-sm focus:outline-none focus:ring-2-primary-600 focus:border-transparent transition-all duration-200 &{error ? "border-red-500 bg-red-50" : "border-campus-border bg-white"} ${className}`}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
