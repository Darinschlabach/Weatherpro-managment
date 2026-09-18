"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  id: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
};

export function PasswordInput({
  id,
  name,
  required,
  autoComplete = "current-password",
  className,
  placeholder,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const describedBy = useId();

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        spellCheck={false}
        className={`${className ?? ""} pr-11`}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        className="absolute inset-y-0 right-1.5 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-brand-700"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span id={describedBy} className="sr-only">
          {showPassword ? "Password is visible" : "Password is hidden"}
        </span>
      </button>
    </div>
  );
}
