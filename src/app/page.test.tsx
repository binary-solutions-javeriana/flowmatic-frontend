import { render, screen } from '@testing-library/react';
import Home from './page';

test('renderiza el CTA', () => {
  render(<Home />);
  expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
});
