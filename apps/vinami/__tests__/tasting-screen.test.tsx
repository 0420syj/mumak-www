import { render, screen, fireEvent } from '@testing-library/react';
import { TastingScreen } from '../components/tasting/tasting-screen';
import { AROMA_DATA } from '../lib/constants';

// Mock UI components if necessary, but shallow render is better or full render if simple.
// Shadcn components are usually simple enough to render fully.

describe('TastingScreen', () => {
  const mockStack = [];
  const mockOnAddAroma = jest.fn();
  const mockOnRemoveAroma = jest.fn();
  const mockSetWineName = jest.fn();
  const wineName = '';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders wine name input', () => {
    render(
      <TastingScreen
        stack={mockStack}
        onAddAroma={mockOnAddAroma}
        onRemoveAroma={mockOnRemoveAroma}
        wineName={wineName}
        setWineName={mockSetWineName}
      />
    );
    expect(screen.getByPlaceholderText('와인 이름을 입력하세요')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(
      <TastingScreen
        stack={mockStack}
        onAddAroma={mockOnAddAroma}
        onRemoveAroma={mockOnRemoveAroma}
        wineName={wineName}
        setWineName={mockSetWineName}
      />
    );
    expect(screen.getByText('과일/꽃')).toBeInTheDocument();
    expect(screen.getByText('달콤/고소')).toBeInTheDocument();
    expect(screen.getByText('허브/스파이스')).toBeInTheDocument();
    expect(screen.getByText('숙성/기타')).toBeInTheDocument();
  });

  it('clicking an aroma calls onAddAroma', () => {
    render(
      <TastingScreen
        stack={mockStack}
        onAddAroma={mockOnAddAroma}
        onRemoveAroma={mockOnRemoveAroma}
        wineName={wineName}
        setWineName={mockSetWineName}
      />
    );

    // Default tab is first one (Fruit/Flower)
    const fruitAroma = AROMA_DATA.find(a => a.category === 'fruit');
    if (fruitAroma) {
      const button = screen.getByText(fruitAroma.name);
      fireEvent.click(button);
      expect(mockOnAddAroma).toHaveBeenCalledWith(fruitAroma);
    }
  });

  it('renders stack items and clicking one calls onRemoveAroma', () => {
    const stack = [AROMA_DATA[0]];
    render(
      <TastingScreen
        stack={stack}
        onAddAroma={mockOnAddAroma}
        onRemoveAroma={mockOnRemoveAroma}
        wineName={wineName}
        setWineName={mockSetWineName}
      />
    );

    const stackItem = screen.getByTestId('stack-item-0');
    fireEvent.click(stackItem);
    expect(mockOnRemoveAroma).toHaveBeenCalledWith(0);
  });
});
