"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  BarChart3,
  Cloud,
  Droplets,
  Eye,
  Gauge,
  SearchIcon,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div
        className="text-muted-foreground file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full min-w-0 cursor-text rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-2">
          <SearchIcon className="size-4" />
          <span>Search...</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </span>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Basic Weather">
            <CommandItem>
              <Thermometer className="mr-2 h-4 w-4" />
              <span>Temperature</span>
            </CommandItem>
            <CommandItem>
              <Droplets className="mr-2 h-4 w-4" />
              <span>Humidity</span>
            </CommandItem>
            <CommandItem>
              <Eye className="mr-2 h-4 w-4" />
              <span>Dew Point</span>
            </CommandItem>
            <CommandItem>
              <Wind className="mr-2 h-4 w-4" />
              <span>Wind</span>
            </CommandItem>
            <CommandItem>
              <Cloud className="mr-2 h-4 w-4" />
              <span>Clouds</span>
            </CommandItem>
            <CommandItem>
              <Sun className="mr-2 h-4 w-4" />
              <span>Evaporation</span>
            </CommandItem>
            <CommandItem>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Atmospheric Stability</span>
            </CommandItem>
            <CommandItem>
              <Zap className="mr-2 h-4 w-4" />
              <span>Radiation</span>
            </CommandItem>
            <CommandItem>
              <Gauge className="mr-2 h-4 w-4" />
              <span>Atmospheric Pressure and Density</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pressure Options">
            <CommandItem>
              <Gauge className="mr-2 h-4 w-4" />
              <span>Pressure Adjusted to Sea Level</span>
              <CommandShortcut>GET</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Gauge className="mr-2 h-4 w-4" />
              <span>Surface Pressure</span>
              <CommandShortcut>GET</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
