import { render, screen } from '@testing-library/react';
import Home from './page';

test('renders landing primary CTAs', () => {
  render(<Home />);
  expect(screen.getAllByRole('link', { name: /start free trial/i })[0]).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /schedule demo/i })[0]).toBeInTheDocument();
});
