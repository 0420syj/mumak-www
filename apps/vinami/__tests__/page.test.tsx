import { render, screen, fireEvent } from '@testing-library/react';
import Page from '../app/page';
import { AROMA_DATA } from '../lib/constants';

// Mock html-to-image for ReceiptScreen
jest.mock('html-to-image', () => ({
  toPng: jest.fn(() => Promise.resolve('')),
}));
window.URL.createObjectURL = jest.fn();

// Mock useAromaStack hook? No, let's test integration with real hook logic.

describe('Page Integration', () => {
  it('renders TastingScreen initially', () => {
    render(<Page />);
    expect(screen.getByPlaceholderText('와인 이름을 입력하세요')).toBeInTheDocument();
  });

  it('shows Finish button when aroma is added', () => {
    render(<Page />);

    // Add an aroma
    const fruitAroma = AROMA_DATA.find(a => a.category === 'fruit');
    if (fruitAroma) {
      const button = screen.getByText(fruitAroma.name);
      fireEvent.click(button);
    }

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('switches to ReceiptScreen on Finish', () => {
    render(<Page />);

    // Add an aroma
    const fruitAroma = AROMA_DATA.find(a => a.category === 'fruit');
    if (fruitAroma) {
      const button = screen.getByText(fruitAroma.name);
      fireEvent.click(button);
    }

    // Click Finish
    const finishButton = screen.getByText('완료');
    fireEvent.click(finishButton);

    expect(screen.getByText('My Wine Receipt')).toBeInTheDocument();
  });

  it('resets and goes back to TastingScreen', () => {
    render(<Page />);

    // Add aroma -> Finish
    const fruitAroma = AROMA_DATA.find(a => a.category === 'fruit');
    if (fruitAroma) {
      const button = screen.getByText(fruitAroma.name);
      fireEvent.click(button);
    }
    fireEvent.click(screen.getByText('완료'));

    // Click Reset
    const resetButton = screen.getByText('새로 만들기');
    fireEvent.click(resetButton);

    expect(screen.getByPlaceholderText('와인 이름을 입력하세요')).toBeInTheDocument();
  });
});
