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
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

const PLACEHOLDER_VALUE = "__search_select_placeholder__";

const triggerClassName =
  "border-input data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 gap-1.5 rounded-xl border bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] h-9 flex w-full min-w-0 items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export type SearchSelectOption = {
  value: string;
  label?: string;
};

export type SearchSelectProps = {
  /** Current selected value (empty string = none). */
  value: string;
  /** Called when selection changes. Pass "" when cleared. */
  onValueChange: (value: string) => void;
  /** Options to show. Use `label` for display when different from `value`. */
  options: SearchSelectOption[];
  /** Trigger button placeholder when nothing selected. */
  placeholder?: string;
  /** Search input placeholder. */
  searchPlaceholder?: string;
  /** Message when no options match search. */
  emptyMessage?: string;
  /** When true, selecting the current value again clears the selection. */
  clearable?: boolean;
  /** Id for the trigger (e.g. for form labels). */
  id?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Extra class names for the trigger button. */
  className?: string;
  /** PopoverContent align. */
  align?: "start" | "center" | "end";
};

export function SearchSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  clearable = true,
  id,
  disabled = false,
  className,
  align = "start",
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);

  const displayValue = value
    ? (options.find((o) => o.value === value)?.label ?? value)
    : "";

  const handleSelect = (optionValue: string) => {
    const isPlaceholder = optionValue === PLACEHOLDER_VALUE;
    const isCurrent = optionValue === value;
    if (clearable && (isPlaceholder || isCurrent)) {
      onValueChange("");
    } else {
      onValueChange(optionValue);
    }
    setOpen(false);
  };

  const commandValue = value || PLACEHOLDER_VALUE;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={id}
          disabled={disabled}
          className={cn(
            triggerClassName,
            "font-normal",
            !displayValue && "text-muted-foreground",
            className,
          )}
        >
          {displayValue || placeholder}
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align={align}
      >
        <Command value={commandValue}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = value === opt.value;
                const label = opt.label ?? opt.value;
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    checked={isSelected}
                    onSelect={() => handleSelect(opt.value)}
                  >
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
