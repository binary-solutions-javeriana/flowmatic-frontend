import { render, screen } from '@testing-library/react';
import Home from './page';
import * as AuthStore from '@/lib/auth-store';

vi.mock('@/lib/auth-store', () => ({
  useAuth: () => ({
    state: {
      isLoading: false,
      isAuthenticated: false,
      user: null,
      tokens: null,
      error: null,
    },
    logout: vi.fn(),
  }),
}));

test('renderiza el CTA', () => {
  render(<Home />);
  expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
});
