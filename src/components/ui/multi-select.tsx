"use client";

import * as React from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  /** Max number of badges to show before "+ N more". Default 3. */
  maxDisplay?: number;
  /** Max width of the trigger (e.g. "max-w-md", "max-w-sm"). Default "max-w-md". */
  maxWidth?: string;
  /** Class name for each selected badge in the trigger. */
  badgeClassName?: string;
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select options",
  emptyMessage = "No results found.",
  searchPlaceholder = "Search...",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  maxDisplay = 3,
  maxWidth = "max-w-md",
  badgeClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(() => value);

  React.useEffect(() => {
    setSelected((prev) => {
      if (prev.length !== value.length || value.some((v, i) => prev[i] !== v)) {
        return value;
      }
      return prev;
    });
  }, [value]);

  const handleSelect = (optionValue: string) => {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    setSelected(next);
    onValueChange?.(next);
  };

  const handleClearOne = (
    e: React.MouseEvent | React.KeyboardEvent,
    optionValue: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const next = selected.filter((v) => v !== optionValue);
    setSelected(next);
    onValueChange?.(next);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected([]);
    onValueChange?.([]);
  };

  const displayValues = selected.slice(0, maxDisplay);
  const remainingCount = selected.length - maxDisplay;
  const valueSet = new Set(selected);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "min-h-9 h-auto w-full justify-between gap-2 py-1.5 font-normal bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-foreground",
            maxWidth,
            !selected.length && "text-muted-foreground",
            triggerClassName,
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {displayValues.length > 0
              ? displayValues.map((v) => {
                  const option = options.find((o) => o.value === v);
                  return (
                    <Badge
                      key={v}
                      variant="secondary"
                      className={cn(
                        "gap-1 rounded-xl px-1.5 py-3 font-normal bg-c-c1c1c1/20 text-neutral-800",
                        badgeClassName,
                      )}
                    >
                      {option?.label ?? v}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleClearOne(e, v)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleClearOne(e, v);
                          }
                        }}
                        className="rounded p-0.5 hover:bg-muted cursor-pointer"
                        aria-label={`Remove ${option?.label ?? v}`}
                      >
                        <XIcon className="size-3" />
                      </span>
                    </Badge>
                  );
                })
              : placeholder}
            {remainingCount > 0 && (
              <span className="text-xs bg-c-c1c1c1/20 text-neutral-800 rounded-xl px-2 py-1">
                +{remainingCount}
              </span>
            )}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-(--radix-popover-trigger-width) p-0 gap-0",
          contentClassName,
        )}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = valueSet.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => handleSelect(option.value)}
                    data-checked={isSelected}
                  >
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs font-normal"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

