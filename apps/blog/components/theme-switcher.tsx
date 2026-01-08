'use client';

import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@mumak/ui/components/button';

import { SwitcherDropdown } from './switcher-dropdown';

type ThemeValue = 'light' | 'dark' | 'system';

const themeOptions: Array<{ value: ThemeValue; label: string; Icon: typeof SunIcon }> = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: LaptopIcon },
];

function ThemeIcon() {
  return (
    <>
      <SunIcon className="size-4 block dark:hidden" aria-hidden />
      <MoonIcon className="size-4 hidden dark:block" aria-hidden />
    </>
  );
}

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme: ThemeValue = mounted && theme ? (theme as ThemeValue) : 'system';

  const effectiveTheme: ThemeValue = mounted
    ? selectedTheme === 'system'
      ? ((resolvedTheme as ThemeValue | undefined) ?? 'system')
      : selectedTheme
    : 'system';

  const TriggerIcon = effectiveTheme === 'system' ? LaptopIcon : effectiveTheme === 'dark' ? MoonIcon : SunIcon;

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" aria-label="Change theme">
        <ThemeIcon />
      </Button>
    );
  }

  return (
    <SwitcherDropdown
      ariaLabel="Change theme"
      triggerIcon={TriggerIcon}
      selectedValue={selectedTheme}
      onValueChange={value => setTheme(value as ThemeValue)}
      options={themeOptions.map(option => ({
        value: option.value,
        label: option.label,
        icon: option.Icon,
      }))}
    />
  );
}
