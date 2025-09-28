"use client";

import React from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useFormErrorHandler } from "@/lib/use-error-handler";
import { CompactErrorDisplay } from "@/components/ErrorDisplay";

// Validation schema for register form
const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSubmit?: (email: string, password: string) => void;
  className?: string;
}

export default function RegisterForm({ onSubmit, className }: RegisterFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const { register, state, clearError } = useAuth();
  const router = useRouter();
  const { 
    globalError, 
    clearAllErrors, 
    setGlobalErrorFromException 
  } = useFormErrorHandler();

  // Clear errors when form values change
  React.useEffect(() => {
    clearAllErrors();
    clearError();
  }, [email, password, confirmPassword, clearAllErrors, clearError]);

  // Display auth store errors
  React.useEffect(() => {
    if (state.error) {
      setGlobalErrorFromException(new Error(state.error), 'register');
    }
  }, [state.error, setGlobalErrorFromException]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    clearAllErrors();
    setSuccessMessage(null);

    // Validate form data
    const result = registerSchema.safeParse({ email, password, confirmPassword });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Call auth service register
      const result = await register(email, password);
      
      // Call optional onSubmit callback
      onSubmit?.(email, password);
      
      // Handle different registration outcomes
      if (result.requiresEmailConfirmation) {
        // Redirect to email confirmation page for better UX
        router.push('/auth/confirm');
      } else if (result.tokens) {
        // Auto-confirm case - redirect to success page
        router.push('/auth/success');
      } else {
        // Fallback - show success message
        setSuccessMessage("Registration successful!");
      }
    } catch (error) {
      // Error is already handled by auth store, just need to reset submitting state
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
          <p className="mt-1 text-sm text-gray-600">Join Flowmatic today</p>
          
          {/* Success Message Display */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
              <p className="text-sm text-green-700" role="alert">
                {successMessage}
              </p>
              {successMessage.includes('check your email') && (
                <div className="mt-2">
                  <a
                    href="/login"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Go to Login →
                  </a>
                </div>
              )}
            </div>
          )}
          
          {/* Global Error Display */}
          {globalError && (
            <div className="mt-4">
              <CompactErrorDisplay error={globalError} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-green-600 focus:ring-green-600"
              }`}
              placeholder="name@mail.com"
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full rounded-md border px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-600"
                }`}
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full rounded-md border px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-600"
                }`}
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}
