'use client';

import React from 'react';
import { Search, Bell, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  // Determine search placeholder based on the active tab context
  const getPlaceholder = () => {
    switch (activeTab) {
      case 'overview':
        return 'Search transactions, entities, or cards...';
      case 'cards':
        return 'Search cards, transactions, or holders...';
      case 'transactions':
        return 'Search manual ledger ledger records...';
      case 'treasury':
        return 'Search converted API insights...';
      case 'settings':
        return 'Search institutional systems...';
      case 'specs':
        return 'Search system parameters...';
      default:
        return 'Search corporate profiles...';
    }
  };

  const getProfileName = () => {
    if (activeTab === 'settings') return 'Alexander Sterling';
    return 'Alex Chen';
  };

  const getProfileRole = () => {
    if (activeTab === 'settings') return 'Senior Treasury Manager';
    return 'Director of Treasury';
  };

  const handleProfileClick = () => {
    alert(`Signed in as ${getProfileName()} (${getProfileRole()}) — Nova Treasury Enterprise Core`);
  };

  return (
    <header className="flex justify-between items-center h-16 px-8 bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40 shadow-sm">
      {/* Search Bar Container */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <Search className="w-5 h-5 opacity-75" />
          </span>
          <input
            type="text"
            placeholder={getPlaceholder()}
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-full py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all outline-none font-medium placeholder:text-on-surface-variant/60"
          />
        </div>
      </div>

      {/* Quick Action Utilities & User Avatar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-on-surface-variant">
          {/* Notifications Utility */}
          <button
            onClick={() => alert('No new compliance risk alerts. Global liquidity is stable.')}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all rounded-full relative active:scale-95 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </button>

          {/* Activity Logs Utility */}
          <button
            onClick={() => alert(`Opening chronological system logs for ${getProfileName()}...`)}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all rounded-full active:scale-95 cursor-pointer"
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-outline-variant/60"></div>

        {/* Active Profile Info */}
        <div onClick={handleProfileClick} className="flex items-center gap-3 cursor-pointer group active:opacity-85 select-none text-right">
          <div>
            <p className="font-bold text-sm text-on-surface group-hover:text-secondary transition-colors">
              {getProfileName()}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              {getProfileRole()}
            </p>
          </div>
          {/* Custom Initials Avatar */}
          <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm border-2 border-[#1e293b] overflow-hidden shadow-inner group-hover:border-secondary transition-all">
            <span className="text-[13px]">
              {activeTab === 'settings' ? 'AS' : 'AC'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
