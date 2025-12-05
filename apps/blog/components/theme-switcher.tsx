'use client';

import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@mumak/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@mumak/ui/components/dropdown-menu';

type ThemeValue = 'light' | 'dark' | 'system';

const themeOptions: Array<{ value: ThemeValue; label: string; Icon: typeof SunIcon }> = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: LaptopIcon },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme: ThemeValue = mounted && theme ? (theme as ThemeValue) : 'system';

  const TriggerIcon = (() => {
    if (!mounted) {
      return SunIcon;
    }

    if (selectedTheme === 'system') {
      return LaptopIcon;
    }

    return selectedTheme === 'dark' ? MoonIcon : SunIcon;
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Change theme">
          <TriggerIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuRadioGroup value={selectedTheme} onValueChange={value => setTheme(value as ThemeValue)}>
          {themeOptions.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="flex items-center gap-2">
              <Icon className="size-4" />
              <span>{label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
