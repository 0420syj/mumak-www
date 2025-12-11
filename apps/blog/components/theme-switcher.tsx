'use client';

import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { SwitcherDropdown } from './switcher-dropdown';

type ThemeValue = 'light' | 'dark' | 'system';

const themeOptions: Array<{ value: ThemeValue; label: string; Icon: typeof SunIcon }> = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: LaptopIcon },
];

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme: ThemeValue = mounted && theme ? (theme as ThemeValue) : 'system';

  const TriggerIcon = (() => {
    if (!mounted) {
      return SunIcon;
    }

    const effectiveTheme: ThemeValue =
      selectedTheme === 'system' ? ((resolvedTheme as ThemeValue | undefined) ?? 'system') : selectedTheme;

    if (effectiveTheme === 'system') {
      return LaptopIcon;
    }

    return effectiveTheme === 'dark' ? MoonIcon : SunIcon;
  })();

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
