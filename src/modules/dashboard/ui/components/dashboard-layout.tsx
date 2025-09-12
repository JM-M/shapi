"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMemo } from "react";
import { useDashboardLayout } from "../../hooks/use-dashboard-layout";

const LEFT_PANEL_MIN_WIDTH = 220;

interface DashboardLayoutProps {
  leftPanel?: React.ReactNode;
  middlePanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const DashboardLayout = ({
  leftPanel,
  middlePanel,
  rightPanel,
}: DashboardLayoutProps) => {
  const { containerRef, containerWidth } = useDashboardLayout();

  const { leftPanelMinWidth } = useMemo(() => {
    const widthToPercentage = (width: number) => {
      return Math.round((width / containerWidth) * 100);
    };

    const leftPanelMinWidth = Math.round(
      containerWidth > 0 ? widthToPercentage(LEFT_PANEL_MIN_WIDTH) : 0,
    );

    return { leftPanelMinWidth };
  }, [containerWidth]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden transition-opacity duration-200"
    >
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={33}
          minSize={leftPanelMinWidth}
        // maxSize={60}
        >
          {leftPanel}
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel
          defaultSize={33}
        // minSize={25}
        // maxSize={panelWidths.right > 0 ? 60 : 100}
        >
          {middlePanel}
        </ResizablePanel>

        <ResizableHandle />
        <ResizablePanel
          defaultSize={34}
        // minSize={25}
        // maxSize={60}
        >
          {rightPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
