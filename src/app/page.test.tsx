import { render, screen } from '@testing-library/react';
import Home from './page';

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

vi.mock('@/lib/auth-store', () => ({
  useAuth: () => ({
    state: {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
    logout: vi.fn(),
  }),
}));

test('renders CTA links', () => {
  render(<Home />);
  expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
});
