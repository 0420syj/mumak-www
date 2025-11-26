import { useState, useCallback } from 'react';
import { AromaItem } from '../lib/constants';

export function useAromaStack() {
  const [stack, setStack] = useState<AromaItem[]>([]);

  const addAroma = useCallback((aroma: AromaItem) => {
    setStack(prev => [...prev, aroma]);
  }, []);

  const removeAroma = useCallback((index: number) => {
    setStack(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetStack = useCallback(() => {
    setStack([]);
  }, []);

  return {
    stack,
    addAroma,
    removeAroma,
    resetStack,
  };
}
