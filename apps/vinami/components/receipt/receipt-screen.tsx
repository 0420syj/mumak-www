import React, { useRef } from 'react';
import { AromaItem } from '@/lib/constants';
import { Button } from '@mumak/ui/components/button';
import { Download, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReceiptScreenProps {
  stack: AromaItem[];
  wineName: string;
  onReset: () => void;
}

export function ReceiptScreen({ stack, wineName, onReset }: ReceiptScreenProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#f8fafc', // match bg-slate-50
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `wine-receipt-${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to generate receipt image:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 bg-slate-100">
      <div
        ref={receiptRef}
        className="w-full max-w-sm bg-white p-6 shadow-lg relative overflow-hidden mb-8"
        style={{
          backgroundImage: 'radial-gradient(circle, transparent 2px, #fff 2px)',
          backgroundSize: '100% 100%',
        }}
      >
        {/* Zigzag Top */}
        <div
          className="absolute top-0 left-0 w-full h-2 bg-slate-100"
          style={{
            maskImage:
              'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            maskSize: '10px 10px',
          }}
        />

        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">My Wine Receipt</h1>
          <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-500 uppercase">Item</span>
            <span className="text-lg font-bold text-slate-900">{wineName || 'Unnamed Wine'}</span>
          </div>

          <div className="border-t border-dashed border-slate-200 py-2">
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm text-slate-400 italic">
                <span>00</span>
                <span>Start</span>
              </li>
              {stack.map((item, index) => (
                <li key={`${item.id}-${index}`} className="flex justify-between items-center text-slate-800">
                  <span className="text-xs text-slate-400 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                  <div className="flex items-center gap-2 flex-1 mx-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.category}</span>
                </li>
              ))}
              <li className="flex justify-between items-center text-sm text-slate-400 italic mt-2">
                <span>{(stack.length + 1).toString().padStart(2, '0')}</span>
                <span>Finish</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-between border-t-2 border-dashed border-slate-300 pt-2 font-bold">
            <span>Total Aromas</span>
            <span>{stack.length}</span>
          </div>
        </div>

        {/* Footer / Barcode */}
        <div className="mt-8 text-center space-y-2">
          <div
            className="h-12 bg-slate-900 mx-auto w-3/4 opacity-80"
            style={{
              maskImage: 'repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)',
            }}
          />
          <p className="text-[10px] text-slate-400 tracking-[0.5em] uppercase">Thanks for drinking</p>
        </div>

        {/* Zigzag Bottom */}
        <div
          className="absolute bottom-0 left-0 w-full h-2 bg-slate-100"
          style={{
            maskImage:
              'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            maskSize: '10px 10px',
            transform: 'rotate(180deg)',
          }}
        />
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          새로 만들기
        </Button>
        <Button className="flex-1" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          이미지 저장
        </Button>
      </div>
    </div>
  );
}
