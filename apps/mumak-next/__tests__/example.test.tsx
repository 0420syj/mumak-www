import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should render a div', () => {
    render(<div data-testid="test-div">Hello World</div>);
    const element = screen.getByTestId('test-div');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});
