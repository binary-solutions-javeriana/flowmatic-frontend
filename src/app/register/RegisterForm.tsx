"use client";

import React from "react";
import styled from "styled-components";
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

const StyledWrapper = styled.div`
  .form_container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 50px 40px 20px 40px;
    background-color: #ffffff;
    box-shadow: 0px 106px 42px rgba(0, 0, 0, 0.01),
      0px 59px 36px rgba(0, 0, 0, 0.05), 0px 26px 26px rgba(0, 0, 0, 0.09),
      0px 7px 15px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
    border-radius: 11px;
    font-family: "Inter", sans-serif;
  }

  @media (max-width: 640px) {
    .form_container {
      max-width: 400px;
      padding: 40px 30px 20px 30px;
    }
  }

  @media (max-width: 480px) {
    .form_container {
      max-width: 350px;
      padding: 30px 20px 15px 20px;
      gap: 12px;
    }
  }

  .logo_section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .logo_image {
    width: 88px;
    height: 88px;
    object-fit: contain;
  }

  .logo_text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0c272d;
    font-family: "Inter", sans-serif;
  }

  .title_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #212121;
  }

  .input_container {
    width: 100%;
    max-width: 400px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field_wrapper {
    position: relative;
    width: 100%;
    height: 40px;
  }

  .icon {
    width: 20px;
    position: absolute;
    z-index: 1;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

  .input_label {
    font-size: 0.75rem;
    color: #8B8E98;
    font-weight: 600;
  }

  .input_field {
    width: 100%;
    height: 40px;
    padding: 0 15px 0 40px;
    border-radius: 7px;
    outline: none;
    border: 1px solid #e5e5e5;
    filter: drop-shadow(0px 1px 0px #efefef)
      drop-shadow(0px 1px 0.5px rgba(239, 239, 239, 0.5));
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
    box-sizing: border-box;
  }

  .input_field:focus {
    border: 1px solid transparent;
    box-shadow: 0px 0px 0px 2px #242424;
    background-color: transparent;
  }

  .sign-in_btn {
    width: 100%;
    max-width: 400px;
    height: 40px;
    border: 0;
    background: #14a67e;
    border-radius: 7px;
    outline: none;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .sign-in_btn:hover {
    background: #14a67e;
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .sign-in_lms {
    width: 100%;
    max-width: 400px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #4f46e5;
    border-radius: 7px;
    outline: none;
    color: #ffffff;
    border: 1px solid #4f46e5;
    filter: drop-shadow(0px 1px 0px #efefef)
      drop-shadow(0px 1px 0.5px rgba(239, 239, 239, 0.5));
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .sign-in_lms:hover {
    background: #4338ca;
    border-color: #4338ca;
    transform: translateY(-1px);
  }

  .cta_orange {
    width: 100%;
    max-width: 400px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #f97316; /* orange-500 */
    border-radius: 7px;
    outline: none;
    color: #ffffff;
    border: 1px solid #f97316;
    filter: drop-shadow(0px 1px 0px #efefef)
      drop-shadow(0px 1px 0.5px rgba(239, 239, 239, 0.5));
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cta_orange:hover {
    background: #ea580c; /* orange-600 */
    border-color: #ea580c;
    transform: translateY(-1px);
  }

  .separator {
    width: 100%;
    max-width: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    color: #8B8E98;
  }

  .separator .line {
    display: block;
    width: 100%;
    height: 1px;
    border: 0;
    background-color: #e8e8e8;
  }

  .note {
    font-size: 0.75rem;
    color: #8B8E98;
    text-decoration: underline;
    cursor: pointer;
  }

  .error_text {
    font-size: 0.75rem;
    color: #dc2626; /* red-600 */
    margin-top: 4px;
  }
`;

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
      // Keep first error per field to align with UX and tests
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string | undefined;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
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
      if (result && result.requiresEmailConfirmation) {
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
    <StyledWrapper>
      <form onSubmit={handleSubmit} className={className} noValidate>
        <div className="form_container">
          <div className="logo_section">
            <img src="/logo/flowmatic_logo.png" alt="Flowmatic" className="logo_image" />
            <span className="logo_text">Flowmatic</span>
          </div>
          <div className="title_container">
            <p className="title">Create your account</p>
          </div>
          {successMessage && (
            <div className="w-full max-w-[400px] p-3 bg-green-100 border border-green-300 rounded-md">
              <p className="text-sm text-green-700" role="alert">{successMessage}</p>
            </div>
          )}
          {globalError && (
            <div className="w-full max-w-[400px]">
              <CompactErrorDisplay error={globalError} />
            </div>
          )}

          <div className="input_container">
            <label className="input_label" htmlFor="email_field">Email</label>
            <div className="field_wrapper">
              <svg fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg" className="icon">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" />
                <path strokeLinejoin="round" strokeWidth="1.5" stroke="#141B34" d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" />
              </svg>
              <input
                placeholder="name@mail.com"
                title="Email input"
                name="email"
                type="email"
                className="input_field"
                id="email_field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="error_text" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="input_container">
            <label className="input_label" htmlFor="password_field">Password</label>
            <div className="field_wrapper">
              <svg fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg" className="icon">
                <path strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22" />
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9" />
                <path fill="#141B34" d="M21.2046 15.1045L20.6242 15.6956V15.6956L21.2046 15.1045ZM21.4196 16.4767C21.7461 16.7972 22.2706 16.7924 22.5911 16.466C22.9116 16.1395 22.9068 15.615 22.5804 15.2945L21.4196 16.4767ZM18.0228 15.1045L17.4424 14.5134V14.5134L18.0228 15.1045ZM18.2379 18.0387C18.5643 18.3593 19.0888 18.3545 19.4094 18.028C19.7299 17.7016 19.7251 17.1771 19.3987 16.8565L18.2379 18.0387ZM14.2603 20.7619C13.7039 21.3082 12.7957 21.3082 12.2394 20.7619L11.0786 21.9441C12.2794 23.1232 14.2202 23.1232 15.4211 21.9441L14.2603 20.7619ZM12.2394 20.7619C11.6914 20.2239 11.6914 19.358 12.2394 18.82L11.0786 17.6378C9.86927 18.8252 9.86927 20.7567 11.0786 21.9441L12.2394 20.7619ZM12.2394 18.82C12.7957 18.2737 13.7039 18.2737 14.2603 18.82L15.4211 17.6378C14.2202 16.4587 12.2794 16.4587 11.0786 17.6378L12.2394 18.82ZM20.6242 15.6956L21.4196 16.4767L22.5804 15.2945L21.785 14.5134L20.6242 15.6956Z" />
              </svg>
              <input
                placeholder="••••••••"
                title="Password input"
                name="password"
                type={showPassword ? "text" : "password"}
                className="input_field"
                id="password_field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#8B8E98' }}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="error_text" role="alert">{errors.password}</p>
            )}
          </div>

          <div className="input_container">
            <label className="input_label" htmlFor="confirm_password_field">Confirm Password</label>
            <div className="field_wrapper">
              <svg fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg" className="icon">
                <path strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22" />
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9" />
                <path fill="#141B34" d="M21.2046 15.1045L20.6242 15.6956V15.6956L21.2046 15.1045ZM21.4196 16.4767C21.7461 16.7972 22.2706 16.7924 22.5911 16.466C22.9116 16.1395 22.9068 15.615 22.5804 15.2945L21.4196 16.4767ZM18.0228 15.1045L17.4424 14.5134V14.5134L18.0228 15.1045ZM18.2379 18.0387C18.5643 18.3593 19.0888 18.3545 19.4094 18.028C19.7299 17.7016 19.7251 17.1771 19.3987 16.8565L18.2379 18.0387ZM14.2603 18.82C13.7039 19.358 14.8082 20.2239 14.2603 20.7619L15.4211 21.9441C16.6304 20.7567 16.6304 18.8252 15.4211 17.6378L14.263 18.82ZM12.2394 18.82C12.7957 18.2737 13.7039 18.2737 14.2603 18.82L15.4211 17.6378C14.2202 16.4587 12.2794 16.4587 11.0786 17.6378L12.2394 18.82ZM20.6242 15.6956L21.4196 16.4767L22.5804 15.2945L21.785 14.5134L20.6242 15.6956Z" />
              </svg>
              <input
                placeholder="••••••••"
                title="Confirm Password input"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="input_field"
                id="confirm_password_field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              />
              <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#8B8E98' }}>
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="error_text" role="alert">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="sign-in_btn">
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <div className="separator">
            <hr className="line" />
            <span>Or</span>
            <hr className="line" />
          </div>

          <button type="button" className="sign-in_lms">
            <svg height={18} width={18} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span>Log in with LMS</span>
          </button>

          <button type="button" className="cta_orange" onClick={() => router.push('/login')}>
            Go to Login
          </button>

          <p className="note">Terms of use &amp; Conditions</p>
        </div>
      </form>
    </StyledWrapper>
  );
}
