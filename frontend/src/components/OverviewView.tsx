'use client';

import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  HelpCircle,
  Download, 
  Calendar,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Database,
  Plane,
  Coins,
  ShieldCheck,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card, Transaction } from '../types';

interface OverviewViewProps {
  cards: Card[];
  transactions: Transaction[];
  onNavigateToTab: (tab: string) => void;
  onOpenNewTransfer: () => void;
}

export default function OverviewView({ 
  cards, 
  transactions, 
  onNavigateToTab,
  onOpenNewTransfer
}: OverviewViewProps) {

  // Aggregate stats
  const totalLimit = cards.reduce((sum, c) => sum + c.limit, 0) + 19500000; // adding baseline limit for enterprise
  const totalSpent = cards.reduce((sum, c) => sum + c.spent, 0) + 8225000;
  const netAvailable = totalLimit - totalSpent;
  const spendPercent = Math.round((totalSpent / totalLimit) * 100);

  // Take first 3 cards for visual visual display
  const displayCards = cards.slice(0, 3);

  const getTransactionIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('aws') || desc.includes('cloud') || desc.includes('software')) return <Database className="w-4 h-4 text-slate-600" />;
    if (desc.includes('united') || desc.includes('air') || desc.includes('travel')) return <Plane className="w-4 h-4 text-blue-600" />;
    if (desc.includes('goldman') || desc.includes('treasury') || desc.includes('transfer')) return <Coins className="w-4 h-4 text-emerald-600 animate-pulse" />;
    return <ShieldCheck className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-on-surface">Overview</h2>
          <p className="text-on-surface-variant font-medium text-sm mt-1">Real-time status of your global liquidity and operational limits.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Calendar lookback filter: Last 30 Days selected')}
            className="px-4 py-2 border border-outline-variant bg-white text-on-surface text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            <span>Last 30 Days</span>
          </button>
          <button 
            onClick={() => alert('Exporting corporate liquidity audit in CSV...')}
            className="px-4 py-2 border border-outline-variant bg-white text-on-surface text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Grid: Stats & Donut */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left 8 Columns: Dynamic Summary Cards & Active Card Slide & Activity */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Credit Limit */}
            <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-[0px_1px_3px_rgba(15,23,42,0.08)] hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Total Credit Limit</span>
                <TrendingUp className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-2xl font-mono text-slate-900 font-bold tracking-tight">
                ${totalLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +12.5%
                </span>
                <span className="text-on-surface-variant/70">vs last month</span>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-[0px_1px_3px_rgba(15,23,42,0.08)] hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Total Spent</span>
                <Wallet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-mono text-slate-900 font-bold tracking-tight">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary-container h-full rounded-full transition-all duration-500" 
                  style={{ width: `${spendPercent}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-on-surface-variant font-bold text-right mt-1.5">
                {spendPercent}% OF CAP EXHAUSTED
              </div>
            </div>

            {/* Net Available Balance */}
            <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-[0px_1px_3px_rgba(15,23,42,0.08)] hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Net Available Balance</span>
                <Coins className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-mono text-slate-900 font-bold tracking-tight text-secondary">
                ${netAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-on-surface-variant/80">
                <span>Instant Liquidation Cap:</span>
                <span className="text-slate-900 font-bold">92% Priority</span>
              </div>
            </div>
          </div>

          {/* Active Cards display */}
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-lg text-slate-900">My Active Corporate Cards</h3>
              <button 
                onClick={() => onNavigateToTab('cards')}
                className="text-secondary font-semibold text-sm flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All Cards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayCards.map((card) => (
                <div 
                  key={card.id}
                  onClick={() => onNavigateToTab('cards')}
                  className="bg-[#0b1c30] rounded-xl p-5 text-white relative h-40 flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none group-hover:opacity-30 transition-opacity"></div>
                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-bold text-on-primary-container tracking-wider uppercase">
                      {card.cardType} Platinum
                    </span>
                    <span className="w-6 h-4 bg-yellow-500/80 rounded-xs"></span>
                  </div>
                  <div className="font-mono text-[15px] tracking-[0.16em] z-10 py-2">
                    •••• •••• •••• {card.last4}
                  </div>
                  <div className="flex justify-between items-end z-10 text-[11px]">
                    <div>
                      <p className="text-[8px] uppercase text-on-primary-container/85 mb-0.5">Holder</p>
                      <p className="font-bold tracking-wide uppercase text-slate-200">{card.holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase text-on-primary-container/85 mb-0.5">Expires</p>
                      <p className="font-bold text-slate-200">{card.expires}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity table */}
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-900">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant text-xs">Tracking:</span>
                <select className="text-xs border border-outline-variant bg-surface rounded-md px-2 py-1 outline-none font-semibold cursor-pointer">
                  <option>All Operations</option>
                  <option>North America</option>
                  <option>United Kingdom</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant/60">
                    <th className="px-6 py-3.5 text-xs text-on-surface-variant/80 font-bold tracking-wider uppercase">Transaction</th>
                    <th className="px-6 py-3.5 text-xs text-on-surface-variant/80 font-bold tracking-wider uppercase">Entity</th>
                    <th className="px-6 py-3.5 text-xs text-on-surface-variant/80 font-bold tracking-wider uppercase">Date</th>
                    <th className="px-6 py-3.5 text-xs text-on-surface-variant/80 font-bold tracking-wider uppercase">Status</th>
                    <th className="px-6 py-3.5 text-xs text-on-surface-variant/80 font-bold tracking-wider uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 text-sm">
                  {transactions.slice(0, 4).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                            {getTransactionIcon(tx.description)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{tx.description}</p>
                            <p className="text-xs text-on-surface-variant/90 font-mono font-medium">{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{tx.entity}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.status === 'Cleared' || tx.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === 'Cleared' || tx.status === 'Success'
                              ? 'bg-emerald-500'
                              : tx.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${
                        tx.amount < 0 ? 'text-slate-900' : 'text-emerald-600'
                      }`}>
                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Liquidities & Action Items */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Donut Treasury Mix Analysis */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg text-slate-900 mb-4">Treasury Asset Mix</h3>
            
            <div className="flex justify-center py-4">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle className="stroke-slate-100" cx="18" cy="18" r="16" fill="none" strokeWidth="3.2"></circle>
                  
                  {/* Slice 1: Cash & Equivalents (60%) */}
                  <circle className="stroke-slate-900" cx="18" cy="18" r="16" fill="none" 
                    strokeWidth="3.2" strokeDasharray="60 100" strokeDashoffset="0"
                  ></circle>
                  
                  {/* Slice 2: Securities (25%) */}
                  <circle className="stroke-secondary" cx="18" cy="18" r="16" fill="none" 
                    strokeWidth="3.2" strokeDasharray="25 100" strokeDashoffset="-60"
                  ></circle>
                  
                  {/* Slice 3: Venture Reserves (15%) */}
                  <circle className="stroke-tertiary-fixed-dim" cx="18" cy="18" r="16" fill="none" 
                    strokeWidth="3.2" strokeDasharray="15 100" strokeDashoffset="-85"
                  ></circle>
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-mono text-slate-900 font-bold block">USD</span>
                  <span className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Core Asset</span>
                </div>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                  <span>Cash & Equivalents</span>
                </div>
                <span className="font-mono text-slate-900">60%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span>Marketable Securities</span>
                </div>
                <span className="font-mono text-slate-900">25%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                  <span>Venture Reserve</span>
                </div>
                <span className="font-mono text-slate-900">15%</span>
              </div>
            </div>
          </section>

          {/* Compliance & Regulatory Alerts */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="font-semibold text-lg text-slate-900">Compliance Status</h3>
              <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-red-200">
                2 Action Items
              </span>
            </div>

            <div className="space-y-4">
              {/* KYB Alert */}
              <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Entity KYB Expiring</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  Proton UK Ltd requires structural documentation refresh within 4 days to avoid sandbox penalties.
                </p>
                <button 
                  onClick={() => alert('Starting Secure Portal document upload workflow for Proton UK Ltd KYB renewal.')}
                  className="w-full text-center text-xs font-bold text-white bg-red-600 py-1.5 rounded hover:bg-red-700 active:scale-95 transition-all cursor-pointer inline-block"
                >
                  Renew documentation immediately
                </button>
              </div>

              {/* Threshold Alarm */}
              <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <Scale className="w-4 h-4" />
                  <span>Threshold Alert</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  Quarterly marketing spend threshold triggers. Card Elena Rodriguez has exhaustively reached 85%.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onNavigateToTab('settings')}
                    className="w-full text-center text-xs font-bold text-amber-800 bg-amber-200/50 py-1.5 rounded hover:bg-amber-200 transition-all cursor-pointer inline-block"
                  >
                    Adjust compliance lookbacks
                  </button>
                </div>
              </div>

              {/* Reconciliation Status */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-slate-900 uppercase">Audit Status: Ready</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">Q3 reconciliations are complete and verified.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
