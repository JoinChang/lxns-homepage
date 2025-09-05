import classes from './Tabs.module.scss';

import React, { useEffect, useState } from 'react';

interface TabGroupProps {
  activeTab: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

export default function TabGroup({ activeTab, containerRef, children }: TabGroupProps) {
  const [clientWidth, setClientWidth] = useState<number>(0);

  // 监听窗口大小变化，用于计算居中位置
  useEffect(() => {
    const handleResize = () => {
      setClientWidth(document.documentElement.clientWidth);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 同步 TabContent 的高度
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tabElements = container.querySelectorAll<HTMLElement>(`[data-tab-value]`);
    const firstEl = tabElements[0].children[0] as HTMLElement;

    const syncHeights = (height: number) => {
      tabElements.forEach((el) => {
        el.style.height = `${Math.max(el.offsetHeight, height)}px`;
        el.style.maxHeight = `${height}px`;
      });
    };

    syncHeights(firstEl.offsetHeight);

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === firstEl) {
          syncHeights(firstEl.offsetHeight);
        }
      }
    });

    resizeObserver.observe(firstEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // 计算 activeTab 的位置并居中
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tabElements = container.querySelectorAll<HTMLElement>(`[data-tab-value]`);
    const tabIndex = Array.from(tabElements).findIndex(
      (el) => el instanceof HTMLElement && el.dataset.tabValue === activeTab
    );
    if (tabIndex === -1) return;

    const activeTabElement = tabElements[tabIndex];
    let width = activeTabElement?.clientWidth || 0;
    let translateX = 0;

    tabElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.cursor = el === activeTabElement ? 'auto' : 'pointer';
      }
    });

    if (clientWidth >= 730) {
      translateX = (clientWidth - width) / 2 - 15 - tabIndex * 715;
    } else {
      translateX = (1 - (tabIndex + 1)) * (width + 15);
    }

    requestAnimationFrame(() => {
      tabElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.transform = `translateX(${translateX}px)`;
        }
      });
    });
  }, [containerRef, activeTab, clientWidth]);

  return (
    <div className={classes.tabGroup} ref={containerRef}>
      {children}
    </div>
  );
}