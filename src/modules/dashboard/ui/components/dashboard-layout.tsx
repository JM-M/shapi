"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboard } from "@/contexts/dashboard";
import { useMemo } from "react";
import { useDashboardLayout } from "../../hooks/use-dashboard-layout";
import { Toolbar } from "./toolbar";

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
  const { state } = useDashboard();
  const { layout } = state;

  const { leftPanelMinWidth } = useMemo(() => {
    const widthToPercentage = (width: number) => {
      return Math.round((width / containerWidth) * 100);
    };

    const leftPanelMinWidth = Math.round(
      containerWidth > 0 ? widthToPercentage(LEFT_PANEL_MIN_WIDTH) : 0,
    );

    return { leftPanelMinWidth };
  }, [containerWidth]);

  const renderPanels = () => {
    if (layout.layoutType === "3-panel") {
      // 3-panel layout: Left | Middle | Right (horizontal)
      return (
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100%-3rem)]"
          id="panel-group"
        >
          <ResizablePanel
            defaultSize={33}
            minSize={leftPanelMinWidth}
            id="left-panel"
          >
            <ScrollArea className="h-full">{leftPanel}</ScrollArea>
          </ResizablePanel>
          <ResizableHandle />

          <ResizablePanel defaultSize={33} id="middle-panel">
            <ScrollArea className="h-full">{middlePanel}</ScrollArea>
          </ResizablePanel>

          <ResizableHandle />
          <ResizablePanel defaultSize={34} id="right-panel">
            <ScrollArea className="h-full">{rightPanel}</ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      );
    } else {
      // 2-panel layout: Left | Right (with right split vertically)
      return (
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100%-3rem)]"
          id="panel-group"
        >
          <ResizablePanel
            defaultSize={33}
            minSize={leftPanelMinWidth}
            id="left-panel"
          >
            <ScrollArea className="h-full">{leftPanel}</ScrollArea>
          </ResizablePanel>
          <ResizableHandle />

          <ResizablePanel defaultSize={67}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} id="middle-panel">
                <ScrollArea className="h-full">{middlePanel}</ScrollArea>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50} id="right-panel">
                <ScrollArea className="h-full">{rightPanel}</ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden transition-opacity duration-200"
    >
      <Toolbar />
      {renderPanels()}
    </div>
  );
};
