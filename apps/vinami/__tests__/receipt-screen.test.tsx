import { render, screen, fireEvent } from '@testing-library/react';
import { ReceiptScreen } from '../components/receipt/receipt-screen';
import { AROMA_DATA } from '../lib/constants';
import html2canvas from 'html2canvas';

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,mocked',
    })
  );
});

// Mock URL.createObjectURL and HTMLAnchorElement.click
window.URL.createObjectURL = jest.fn();
// HTMLAnchorElement.prototype.click = jest.fn(); // JSDOM might not support this fully, but we can verify link creation

describe('ReceiptScreen', () => {
  const mockStack = [AROMA_DATA[0], AROMA_DATA[1]];
  const wineName = 'My Test Wine';
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders receipt details', () => {
    render(<ReceiptScreen stack={mockStack} wineName={wineName} onReset={mockOnReset} />);

    expect(screen.getByText(wineName)).toBeInTheDocument();
    expect(screen.getByText(AROMA_DATA[0].name)).toBeInTheDocument();
    expect(screen.getByText(AROMA_DATA[1].name)).toBeInTheDocument();
  });

  it('calls html2canvas when download button is clicked', async () => {
    render(<ReceiptScreen stack={mockStack} wineName={wineName} onReset={mockOnReset} />);

    const downloadButton = screen.getByText('이미지 저장');
    fireEvent.click(downloadButton);

    // Use waitFor if the action is async
    expect(html2canvas).toHaveBeenCalled();
  });
});
