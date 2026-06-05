'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileSpreadsheet, 
  Landmark, 
  Settings2, 
  Plus, 
  HelpCircle, 
  LogOut,
  BookOpen,
  ShieldCheck,
  Skull
} from 'lucide-react';

const DeadpoolIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#dc2626" stroke="#000000" strokeWidth="1.5" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="#000000" strokeWidth="1.5" />
    <path d="M12 5 C9.5 5 7.5 7.5 7.5 12 C7.5 16.5 9.5 19 12 19 Z" fill="#0f172a" />
    <path d="M12 5 C14.5 5 16.5 7.5 16.5 12 C16.5 16.5 14.5 19 12 19 Z" fill="#0f172a" />
    <path d="M10.8 11.2 L9 12.2 C9.2 12.5 9.8 12.5 10.2 12.2 Z" fill="#ffffff" />
    <path d="M13.2 11.2 L15 12.2 C14.8 12.5 14.2 12.5 13.8 12.2 Z" fill="#ffffff" />
  </svg>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenIssueModal: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onOpenIssueModal }: SidebarProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'cards', name: 'Cards', icon: CreditCard },
    { id: 'transactions', name: 'Transactions', icon: FileSpreadsheet },
    { id: 'treasury', name: 'Treasury', icon: Landmark },
    { id: 'settings', name: 'Settings', icon: Settings2 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-primary-container shadow-xl flex flex-col py-8 px-4 z-50 text-white border-r border-[#1e293b]">
      {/* Brand Header */}
      <div className="mb-10 px-4">
        <h1 className="font-headline-sm text-xl lg:text-2xl font-bold text-on-secondary-container tracking-tight">
          Nova Treasury
        </h1>
        <p className="text-on-primary-container text-xs opacity-70 mt-1 uppercase tracking-wider font-semibold">
          Enterprise Account
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-md'
                  : 'text-on-primary-container hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-on-primary-container opacity-85'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Action Buttons and Footers */}
      <div className="mt-auto pt-6 border-t border-[#1e293b] space-y-4">
        <button
          onClick={onOpenIssueModal}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary-container font-bold rounded-lg hover:bg-slate-100 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Issue New Card</span>
        </button>

        <div className="space-y-1">
          <a 
            href={`${apiBaseUrl}/scalar/v1`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-on-primary-container hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-on-primary-container opacity-85" />
            <span>API Reference</span>
          </a>
          <button 
            onClick={() => setActiveTab('specs')} 
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-md'
                : 'text-on-primary-container hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-on-primary-container opacity-85" />
            <span>Design Document</span>
          </button>
          <button 
            onClick={() => setActiveTab('osint')} 
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'osint'
                ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-md'
                : 'text-on-primary-container hover:text-white hover:bg-white/5'
            }`}
          >
            <DeadpoolIcon className="w-5 h-5 shrink-0" />
            <span>Chimichanga Scanner</span>
          </button>
          <button 
            onClick={() => alert('Support portal is open. If you have any inquiries, please contact corporate-support@novatreasury.com')} 
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-on-primary-container hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-on-primary-container opacity-85" />
            <span>Support</span>
          </button>
          <button 
            onClick={() => alert('Enterprise Account signing out...')} 
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-medium text-error-container hover:text-red-300 hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-error" />
            <span className="text-error font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
