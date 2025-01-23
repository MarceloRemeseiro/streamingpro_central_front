import { useState, useEffect } from 'react';

type OutputCollapseType = 'rtmp-output' | 'srt-output';

export const useOutputCollapse = (type: OutputCollapseType, outputId: string) => {
  const key = `${type}-${outputId}`;

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(isCollapsed));
  }, [isCollapsed, key]);

  return [isCollapsed, setIsCollapsed] as const;
}; 