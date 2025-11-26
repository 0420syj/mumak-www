import React from 'react';
import { AROMA_CATEGORIES, AROMA_DATA, AromaItem } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mumak/ui/components/tabs';
import { Card } from '@mumak/ui/components/card';
import { Input } from '@mumak/ui/components/input';
import { Button } from '@mumak/ui/components/button';
import { cn } from '@mumak/ui/lib/utils';
import { X } from 'lucide-react';

interface TastingScreenProps {
  stack: AromaItem[];
  onAddAroma: (aroma: AromaItem) => void;
  onRemoveAroma: (index: number) => void;
  wineName: string;
  setWineName: (name: string) => void;
}

export function TastingScreen({ stack, onAddAroma, onRemoveAroma, wineName, setWineName }: TastingScreenProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Top 50% - Display Area */}
      <div className="h-1/2 flex flex-col p-4 bg-slate-50 relative overflow-hidden">
        <div className="mb-4">
          <Input
            placeholder="와인 이름을 입력하세요"
            value={wineName}
            onChange={e => setWineName(e.target.value)}
            className="text-center text-lg font-medium border-none bg-transparent placeholder:text-slate-400 focus-visible:ring-0"
          />
        </div>

        <div className="flex-1 flex flex-col-reverse items-center gap-2 overflow-y-auto pb-20">
          {stack.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              data-testid={`stack-item-${index}`}
              className={cn(
                'animate-in slide-in-from-bottom-4 fade-in duration-300',
                'flex items-center gap-3 px-6 py-3 rounded-full shadow-sm cursor-pointer hover:opacity-80 transition-opacity',
                item.color
              )}
              onClick={() => onRemoveAroma(index)}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              <X className="w-4 h-4 ml-2 opacity-50" />
            </div>
          ))}
          {stack.length === 0 && (
            <div className="text-slate-400 text-sm mt-10">아래에서 향을 선택하여 맛의 변화를 기록해보세요</div>
          )}
        </div>
      </div>

      {/* Bottom 50% - Action Area */}
      <div className="h-1/2 bg-white border-t rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <Tabs defaultValue={AROMA_CATEGORIES[0].value} className="h-full flex flex-col">
          <TabsList className="w-full justify-between px-4 py-6 bg-transparent h-auto">
            {AROMA_CATEGORIES.map(category => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-xs">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {AROMA_CATEGORIES.map(category => (
              <TabsContent key={category.value} value={category.value} className="mt-0 h-full">
                <div className="grid grid-cols-3 gap-3 pb-safe">
                  {AROMA_DATA.filter(item => item.category === category.value).map(item => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-24 flex flex-col gap-2 hover:bg-slate-50 border-slate-200"
                      onClick={() => onAddAroma(item)}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-xs font-medium text-slate-600">{item.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
