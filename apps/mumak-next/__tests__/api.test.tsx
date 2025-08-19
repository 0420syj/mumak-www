import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = () => {
  return <div data-testid="test-component">Test Component</div>;
};

describe('API Test Component', () => {
  it('should render test component', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByTestId('test-component')).toHaveTextContent('Test Component');
  });
});
