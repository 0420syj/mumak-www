'use client';

import { LucideIcon } from 'lucide-react';

import { Button } from '@mumak/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@mumak/ui/components/dropdown-menu';

type SwitcherOption<Value extends string> = {
  value: Value;
  label: string;
  icon?: LucideIcon;
  emoji?: string;
  disabled?: boolean;
};

interface SwitcherDropdownProps<Value extends string> {
  ariaLabel: string;
  triggerIcon: LucideIcon;
  selectedValue: Value;
  onValueChange: (value: Value) => void;
  options: Array<SwitcherOption<Value>>;
}

export function SwitcherDropdown<Value extends string>({
  ariaLabel,
  triggerIcon: TriggerIcon,
  selectedValue,
  onValueChange,
  options,
}: SwitcherDropdownProps<Value>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={ariaLabel}>
          <TriggerIcon className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuRadioGroup value={selectedValue} onValueChange={value => onValueChange(value as Value)}>
          {options.map(({ value, label, icon: Icon, emoji, disabled }) => {
            const hasVisual = Boolean(emoji || Icon);

            return (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                disabled={disabled}
                className={`flex items-center ${hasVisual ? 'gap-2' : ''}`}
              >
                {emoji ? (
                  <span aria-hidden className="text-base leading-none">
                    {emoji}
                  </span>
                ) : Icon ? (
                  <Icon className="size-4" aria-hidden />
                ) : null}
                <span className="truncate">{label}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
