'use client';

import React, { useState } from 'react';
import { useAromaStack } from '@/hooks/use-aroma-stack';
import { TastingScreen } from '@/components/tasting/tasting-screen';
import { ReceiptScreen } from '@/components/receipt/receipt-screen';
import { Button } from '@mumak/ui/components/button';
import { ArrowRight } from 'lucide-react';

type ViewState = 'tasting' | 'receipt';

export default function Page() {
  const [viewState, setViewState] = useState<ViewState>('tasting');
  const [wineName, setWineName] = useState('');
  const { stack, addAroma, removeAroma, resetStack } = useAromaStack();

  const handleFinish = () => {
    setViewState('receipt');
  };

  const handleReset = () => {
    resetStack();
    setWineName('');
    setViewState('tasting');
  };

  return (
    <main className="min-h-screen bg-slate-200 flex items-center justify-center p-0 md:p-4">
      <div className="w-full h-screen md:h-[800px] max-w-md bg-white md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
        {viewState === 'tasting' ? (
          <>
            <div className="flex-1 overflow-hidden">
              <TastingScreen
                stack={stack}
                onAddAroma={addAroma}
                onRemoveAroma={removeAroma}
                wineName={wineName}
                setWineName={setWineName}
              />
            </div>
            {stack.length > 0 && (
              <div className="absolute top-4 right-4 z-50 animate-in fade-in zoom-in duration-300">
                <Button
                  onClick={handleFinish}
                  className="rounded-full shadow-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  완료 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <ReceiptScreen stack={stack} wineName={wineName} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
