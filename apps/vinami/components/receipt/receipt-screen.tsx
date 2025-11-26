import { AromaItem } from '@/lib/constants';
import { Button } from '@mumak/ui/components/button';
import { toPng } from 'html-to-image';
import { Download, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

interface ReceiptScreenProps {
  stack: AromaItem[];
  wineName: string;
  onReset: () => void;
}

// Safe colors (Hex codes)
const COLORS = {
  bg: '#ffffff',
  bg_slate_50: '#f8fafc',
  bg_slate_100: '#f1f5f9',
  bg_slate_200: '#e2e8f0',
  bg_slate_300: '#cbd5e1',
  bg_slate_900: '#0f172a',
  text_slate_900: '#0f172a',
  text_slate_800: '#1e293b',
  text_slate_500: '#64748b',
  text_slate_400: '#94a3b8',
  border_slate_200: '#e2e8f0',
  border_slate_300: '#cbd5e1',
};

export function ReceiptScreen({ stack, wineName, onReset }: ReceiptScreenProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: COLORS.bg_slate_50,
        pixelRatio: 2, // Higher quality
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `wine-receipt-${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to generate receipt image:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <div
        ref={receiptRef}
        style={{
          width: '100%',
          maxWidth: '24rem', // max-w-sm
          padding: '1.5rem', // p-6
          marginBottom: '2rem', // mb-8
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: COLORS.bg,
          backgroundImage: `radial-gradient(circle, transparent 2px, ${COLORS.bg} 2px)`,
          backgroundSize: '100% 100%',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Zigzag Top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '0.5rem', // h-2
            backgroundColor: COLORS.bg_slate_100,
            maskImage:
              'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            maskSize: '10px 10px',
            WebkitMaskImage:
              'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            WebkitMaskSize: '10px 10px',
          }}
        />

        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            paddingBottom: '1rem',
            marginBottom: '1rem',
            borderBottom: `2px dashed ${COLORS.border_slate_300}`,
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0,
              color: COLORS.text_slate_900,
            }}
          >
            My Wine Receipt
          </h1>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', margin: 0, color: COLORS.text_slate_500 }}>
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}
          >
            <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: COLORS.text_slate_500 }}>Item</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: COLORS.text_slate_900 }}>
              {wineName || 'Unnamed Wine'}
            </span>
          </div>

          <div
            style={{
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              borderTop: `1px dashed ${COLORS.border_slate_200}`,
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  color: COLORS.text_slate_400,
                  marginBottom: '0.5rem',
                }}
              >
                <span>00</span>
                <span>Start</span>
              </li>
              {stack.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    color: COLORS.text_slate_800,
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: COLORS.text_slate_400 }}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, margin: '0 0.5rem' }}>
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: COLORS.bg_slate_100,
                      color: COLORS.text_slate_500,
                    }}
                  >
                    {item.category}
                  </span>
                </li>
              ))}
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  color: COLORS.text_slate_400,
                  marginTop: '0.5rem',
                }}
              >
                <span>{(stack.length + 1).toString().padStart(2, '0')}</span>
                <span>Finish</span>
              </li>
            </ul>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              fontWeight: 700,
              borderTop: `2px dashed ${COLORS.border_slate_300}`,
            }}
          >
            <span style={{ color: COLORS.text_slate_900 }}>Total Aromas</span>
            <span style={{ color: COLORS.text_slate_900 }}>{stack.length}</span>
          </div>
        </div>

        {/* Footer / Barcode */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div
            style={{
              height: '3rem',
              width: '75%',
              margin: '0 auto',
              opacity: 0.8,
              backgroundColor: COLORS.bg_slate_900,
              maskImage: 'repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)',
              WebkitMaskImage: 'repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)',
              marginBottom: '0.5rem',
            }}
          />
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              margin: 0,
              color: COLORS.text_slate_400,
            }}
          >
            Thanks for drinking
          </p>
        </div>

        {/* Zigzag Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '0.5rem',
            backgroundColor: COLORS.bg_slate_100,
            maskImage:
              'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            maskSize: '10px 10px',
            WebkitMaskImage:
              'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            WebkitMaskSize: '10px 10px',
            transform: 'rotate(180deg)',
          }}
        />
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        <Button
          variant="outline"
          className="flex-1 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
          onClick={onReset}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          새로 만들기
        </Button>
        <Button
          className="flex-1 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          이미지 저장
        </Button>
      </div>
    </div>
  );
}
