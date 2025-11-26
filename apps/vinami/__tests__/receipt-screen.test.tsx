import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReceiptScreen } from '../components/receipt/receipt-screen';
import { AROMA_DATA } from '../lib/constants';
import * as htmlToImage from 'html-to-image';

// Mock html-to-image
jest.mock('html-to-image', () => ({
  toPng: jest.fn(() => Promise.resolve('data:image/png;base64,mocked')),
}));

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

  it('triggers download when download button is clicked', async () => {
    // Mock anchor element
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    } as unknown as HTMLAnchorElement;

    // Spy on createElement but only return mock for 'a' tag
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return originalCreateElement(tagName, options);
      });

    render(<ReceiptScreen stack={mockStack} wineName={wineName} onReset={mockOnReset} />);

    const downloadButton = screen.getByText('이미지 저장');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toContain('data:image/png;base64,mocked');
      expect(mockLink.download).toMatch(/wine-receipt-\d+\.png/);
      expect(mockLink.click).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
  });
});
