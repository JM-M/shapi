"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useDashboard } from "@/contexts/dashboard";
import siteConfig from "@/site.config";
import { Columns3Icon, Home, LayoutPanelLeftIcon } from "lucide-react";
import Link from "next/link";

export const Toolbar = () => {
  const { state, toggleLeftPanel, toggleRightPanel, toggleLayoutType } =
    useDashboard();
  const { layout } = state;

  const handleLeftPanelToggle = (pressed: boolean) => {
    if (pressed) {
      // If left panel is being activated, ensure layout type is 2-panel
      if (layout.layoutType === "3-panel") {
        toggleLayoutType();
      }
    }
    toggleLeftPanel();
  };

  const handleLayoutTypeToggle = (pressed: boolean) => {
    if (pressed) {
      // If 3-panel layout is being activated, ensure left panel is visible
      if (!layout.leftPanelVisible) {
        toggleLeftPanel();
      }
    }
    toggleLayoutType();
  };

  return (
    <div className="bg-background flex h-12 items-center justify-between border-b px-4">
      {/* Left section - Navigation and layout controls */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Home className="h-4 w-4" />
            <span className="sr-only">Go home</span>
          </Button>
        </Link>
      </div>

      {/* Center section - Could be used for breadcrumbs or title */}
      <div className="flex items-center">
        <span className="text-muted-foreground text-sm font-medium">
          {siteConfig.name}
        </span>
      </div>

      {/* Right section - Settings and theme */}
      <div className="flex items-center gap-2">
        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={layout.leftPanelVisible && layout.layoutType === "2-panel"}
          onPressedChange={handleLeftPanelToggle}
        >
          <LayoutPanelLeftIcon className="size-4" strokeWidth={1.2} />
          <span className="sr-only">Toggle left panel</span>
        </Toggle>

        <Toggle
          size="sm"
          className="h-8 w-8 p-0"
          pressed={layout.layoutType === "3-panel"}
          onPressedChange={handleLayoutTypeToggle}
        >
          <Columns3Icon className="size-4" strokeWidth={1.2} />
          <span className="sr-only">Toggle layout type</span>
        </Toggle>
        <ModeToggle />
      </div>
    </div>
  );
};
