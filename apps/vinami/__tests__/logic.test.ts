import { renderHook, act } from '@testing-library/react';
import { useAromaStack } from '../hooks/use-aroma-stack';
import { AROMA_DATA } from '../lib/constants';

describe('useAromaStack Logic', () => {
  it('should start with an empty stack', () => {
    const { result } = renderHook(() => useAromaStack());
    expect(result.current.stack).toEqual([]);
  });

  it('should add an aroma to the stack', () => {
    const { result } = renderHook(() => useAromaStack());
    const aroma = AROMA_DATA[0];

    act(() => {
      result.current.addAroma(aroma);
    });

    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0]).toEqual(aroma);
  });

  it('should remove an aroma from the stack by index', () => {
    const { result } = renderHook(() => useAromaStack());
    const aroma1 = AROMA_DATA[0];
    const aroma2 = AROMA_DATA[1];

    act(() => {
      result.current.addAroma(aroma1);
      result.current.addAroma(aroma2);
    });

    expect(result.current.stack).toHaveLength(2);

    act(() => {
      // Remove the first item (index 0)
      result.current.removeAroma(0);
    });

    expect(result.current.stack).toHaveLength(1);
    expect(result.current.stack[0]).toEqual(aroma2);
  });

  it('should stack aromas in order', () => {
    const { result } = renderHook(() => useAromaStack());
    const aroma1 = AROMA_DATA[0];
    const aroma2 = AROMA_DATA[1];

    act(() => {
      result.current.addAroma(aroma1);
      result.current.addAroma(aroma2);
    });

    expect(result.current.stack[0]).toEqual(aroma1);
    expect(result.current.stack[1]).toEqual(aroma2);
  });
});
