'use client';

import { Button } from '@repo/ui/components/button';
import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Mumak Next</h1>
        <p className="text-lg">Count: {count}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={() => setCount(count - 1)}>
            -
          </Button>
          <Button size="sm" onClick={() => setCount(count + 1)}>
            +
          </Button>
        </div>
      </div>
    </div>
  );
}
