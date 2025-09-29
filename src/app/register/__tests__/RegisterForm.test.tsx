import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import RegisterForm from '../RegisterForm';
import * as AuthStore from '@/lib/auth-store';

// Mock the auth store
const mockRegister = vi.fn();
const mockClearError = vi.fn();

const mockAuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

vi.mock('@/lib/auth-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-store')>();
  return {
    ...actual,
    useAuth: () => ({
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      state: mockAuthState,
      clearError: mockClearError,
    }),
  };
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render register form with all required fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for weak password', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for password without uppercase letter', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for password without lowercase letter', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'PASSWORD123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for password without number', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    mockRegister.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      requiresEmailConfirmation: true
    });

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123');
    });
  });

  it('should show loading state during submission', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should show error message from auth state', () => {
    const mockAuthStateWithError = {
      ...mockAuthState,
      error: 'Email already exists'
    };

    vi.spyOn(AuthStore, 'useAuth').mockReturnValue({
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      state: mockAuthStateWithError,
      clearError: mockClearError
    });

    render(<RegisterForm />);

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });

  it('should toggle password visibility for both password fields', () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const [passwordToggleButton, confirmPasswordToggleButton] = screen.getAllByLabelText(/show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle password visibility
    fireEvent.click(passwordToggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle confirm password visibility
    fireEvent.click(confirmPasswordToggleButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('should clear errors when user types', async () => {
    const mockAuthStateWithError = {
      ...mockAuthState,
      error: 'Email already exists'
    };

    vi.spyOn(AuthStore, 'useAuth').mockReturnValue({
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      state: mockAuthStateWithError,
      clearError: mockClearError
    });

    render(<RegisterForm />);

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  it('should call onSubmit callback when provided', async () => {
    const mockOnSubmit = vi.fn();
    mockRegister.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      requiresEmailConfirmation: true
    });

    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'Password123');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(emailInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(confirmPasswordInput).toHaveAttribute('aria-required', 'true');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
  });
});
