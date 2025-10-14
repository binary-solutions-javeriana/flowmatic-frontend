import { render, screen } from '@testing-library/react';
import Home from './page';

test('renders landing primary CTAs', () => {
  render(<Home />);
  expect(screen.getAllByRole('link', { name: /see pricings/i })[0]).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /watch demo/i })[0]).toBeInTheDocument();
});
