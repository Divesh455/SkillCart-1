import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-[#12221d]/70"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#68756f] pointer-events-none flex items-center justify-center">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full py-3 ${
            Icon ? "pl-11" : "pl-4"
          } ${
            isPasswordType ? "pr-11" : "pr-4"
          } text-sm bg-white border ${
            error
              ? "border-red-400 focus:ring-red-400/20 focus:border-red-500"
              : "border-[#dfe7e2] focus:ring-[#19714e]/20 focus:border-[#19714e]"
          } rounded-xl text-[#12221d] placeholder-[#68756f]/60 outline-none transition-all duration-200 shadow-xs hover:border-[#19714e]/40 disabled:opacity-60 disabled:cursor-not-allowed`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-[#68756f] hover:text-[#12221d] transition-colors flex items-center justify-center p-1 rounded-md"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium mt-0.5 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
}
