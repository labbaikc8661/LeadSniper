'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { applyTheme, getStoredTheme } from '@/lib/themes';
import { processFollowUps } from '@/lib/hooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Load theme on mount
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ls-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const handleToggle = () => {
    setCollapsed(prev => {
      localStorage.setItem('ls-sidebar-collapsed', (!prev).toString());
      return !prev;
    });
  };

  // Process follow-ups periodically (every 5 minutes)
  useEffect(() => {
    processFollowUps();
    const interval = setInterval(processFollowUps, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div
        className="transition-all duration-300 ease-out"
        style={{ marginLeft: collapsed ? 68 : 220 }}
      >
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
