// __tests__/Hello.test.js
import { render, screen, waitFor } from '@testing-library/react';
import Hello from '../Hello';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ name: 'Alice' }),
    })
  ) as jest.Mock;
});

test('fetches and displays user', async () => {
  render(<Hello />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => expect(screen.getByText('User: Alice')).toBeInTheDocument());
});
