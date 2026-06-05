'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Landmark, 
  RefreshCw, 
  Coins, 
  ArrowRight, 
  Copy, 
  Check, 
  FileJson, 
  Globe, 
  Cpu 
} from 'lucide-react';
import { Card } from '../types';

interface TreasuryViewProps {
  cards: Card[];
}

interface BalanceData {
  cardId: string;
  holder: string;
  last4: string;
  limit: number;
  spentUsd: number;
  availableBalanceUsd: number;
  targetCurrency: string;
  exchangeRateUsed: number;
  convertedAvailableBalance: number;
}

export default function TreasuryView({ cards }: TreasuryViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('EUR');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Oct 24, 2023, 14:24 UT');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

  const selectedCard = useMemo(() => {
    return cards.find(c => c.id === selectedCardId) || cards[0];
  }, [cards, selectedCardId]);

  // Set initial selected card id when cards load
  useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  // Fetch converted balance details
  const fetchConvertedBalance = async () => {
    if (!selectedCardId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/cards/${selectedCardId}/balance?currency=${selectedCurrencyCode}`);
      if (res.ok) {
        const data = await res.json();
        setBalanceData(data);
      }
    } catch (err) {
      console.error("Failed to fetch converted balance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConvertedBalance();
  }, [selectedCardId, selectedCurrencyCode]);

  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'CA$',
    'AUD': 'A$'
  };

  const currentSymbol = currencySymbols[selectedCurrencyCode] || '$';

  // Live conversion calculations from API data
  const spentInUSD = balanceData?.spentUsd ?? (selectedCard?.spent ?? 0);
  const limitInUSD = balanceData?.limit ?? (selectedCard?.limit ?? 0);
  const availableInUSD = balanceData?.availableBalanceUsd ?? (limitInUSD - spentInUSD);

  const exchangeRate = balanceData?.exchangeRateUsed ?? 1.0;
  const convertedSpent = spentInUSD * exchangeRate;
  const convertedLimit = limitInUSD * exchangeRate;
  const convertedAvailable = balanceData?.convertedAvailableBalance ?? (availableInUSD * exchangeRate);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(async () => {
      await fetchConvertedBalance();
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(now.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UT');
      alert('Sovereign institutional feed refreshed: Sync exchange rates and sandbox balances with Goldman Sachs Liquidity Hub.');
    }, 1100);
  };

  const handleCopyJSON = () => {
    const rawData = {
      timestamp: new Date().toISOString(),
      account_uuid: `NOVA-8821-${selectedCard?.last4 || '4412'}`,
      card_holder: selectedCard?.holder || 'Unknown',
      base_currency: 'USD',
      converted_currency: selectedCurrencyCode,
      exchange_rate: exchangeRate,
      balances: {
        spent_usd: spentInUSD,
        spent_converted: Number(convertedSpent.toFixed(2)),
        limit_usd: limitInUSD,
        limit_converted: Number(convertedLimit.toFixed(2)),
        available_usd: availableInUSD,
        available_converted: Number(convertedAvailable.toFixed(2))
      }
    };

    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-on-surface">Treasury Insights</h2>
          <p className="text-on-surface-variant font-medium text-sm mt-1">Multi-currency balance tools, Goldman exchange rates, and developer integrations.</p>
        </div>
        <button 
          onClick={handleTriggerSync}
          disabled={isSyncing || isLoading}
          className="px-4 py-2 border border-outline-variant bg-white text-on-surface text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-on-surface-variant ${isSyncing ? 'animate-spin text-secondary' : ''}`} />
          <span>Sync Liquidity Hub</span>
        </button>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side: Controls & Converter card (8 Columns) */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Main Card Conversion Engine */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <Coins className="w-5 h-5 text-secondary" />
              <span>Sovereign balance calculator</span>
            </h3>

            {/* Input Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Select Corporate Card */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">
                  Select Corporate Card
                </label>
                <select 
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full border border-outline bg-white px-4 py-3 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                >
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.holder} (*{card.last4}) — Spent: ${card.spent.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Target Currency */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">
                  Target conversion currency
                </label>
                <div className="flex gap-2">
                  <select 
                    value={selectedCurrencyCode}
                    onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                    className="flex-1 border border-outline bg-white px-4 py-3 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                  >
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="JPY">JPY — Japanese Yen</option>
                    <option value="CAD">CAD — Canadian Dollar</option>
                    <option value="AUD">AUD — Australia Dollar</option>
                  </select>
                  <div className="w-12 rounded-lg bg-slate-50 border border-outline flex items-center justify-center font-mono font-bold text-slate-800 text-sm">
                    {currentSymbol}
                  </div>
                </div>
              </div>

            </div>

            {/* Conversion Result Block */}
            <div className="bg-slate-50 rounded-xl p-6 border border-outline-variant/60 relative overflow-hidden">
              <div className="absolute right-4 top-4 font-mono font-extrabold text-7xl text-slate-200/40 select-none">
                {selectedCurrencyCode}
              </div>

              {/* Math Display math-equation */}
              {isLoading ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-on-surface-variant/80 tracking-widest uppercase block">
                    Interactive ledger conversion readout
                  </span>
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <div className="text-3xl font-mono text-slate-900 font-bold">
                      ${spentInUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </div>
                    <ArrowRight className="w-4 h-4 text-on-surface-variant/70 self-center hidden md:block" />
                    <div className="text-3xl font-mono text-secondary font-bold">
                      {currentSymbol}{convertedSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedCurrencyCode}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 max-w-lg">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Equation: <span className="font-mono text-slate-900 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        Spent Amount (${spentInUSD.toLocaleString()}) * Rate ({exchangeRate.toFixed(4)}) = Converted Value ({currentSymbol}{convertedSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Balance Conversion Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Converted Total Credit Limit</p>
                <p className="text-xl font-mono font-extrabold text-slate-900 mt-1">
                  {currentSymbol}{convertedLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedCurrencyCode}
                </p>
                <p className="text-[10px] text-on-surface-variant/80 mt-1">
                  Base USD: ${limitInUSD.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-outline-variant rounded-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Converted Available Liquidity</p>
                <p className="text-xl font-mono font-extrabold text-emerald-700 mt-1">
                  {currentSymbol}{convertedAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedCurrencyCode}
                </p>
                <p className="text-[10px] text-on-surface-variant/80 mt-1">
                  Base USD: ${availableInUSD.toLocaleString()}
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* Right Side: Developer JSON and Synchronizer details (4 Columns) */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Sandbox Live API Information */}
          <div className="bg-[#0b1c30] text-white rounded-xl p-6 shadow-sm space-y-4 border border-white/5 relative overflow-hidden">
            <div className="absolute right-3 top-3 animate-pulse">
              <Cpu className="w-14 h-14 text-white/5" />
            </div>

            <div className="flex items-center gap-2 text-tertiary-fixed-dim font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>API Gateway Status</span>
            </div>
            
            <h3 className="font-bold text-lg text-white">Goldman Sachs Node</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Synchronizing corporate credit spent ledger items natively using standard OAuth REST integrations.
            </p>

            <div className="border-t border-white/10 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Last Sync Hub:</span>
              <span className="font-mono font-bold text-slate-200">{lastSyncTime}</span>
            </div>
          </div>

          {/* Quick Action JSON Exporter */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-slate-550" />
                <span>API JSON Payloads</span>
              </h3>
              
              <button 
                onClick={handleCopyJSON}
                className="p-1 px-2.5 bg-slate-50 border border-outline-variant rounded hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Export standard JSON structured payloads directly synchronized with target system ledgers.
            </p>

            {/* Code markup payload */}
            <div className="bg-slate-900 text-slate-300 rounded-lg p-4 font-mono text-[10px] space-y-1.5 overflow-x-auto select-text scrollbar-hide max-h-56">
              <p className="text-sky-400">{"{"}</p>
              <p className="pl-4"><span className="text-yellow-300">"timestamp"</span>: <span className="text-emerald-400">"{new Date().toISOString()}"</span>,</p>
              <p className="pl-4"><span className="text-yellow-300">"account_uuid"</span>: <span className="text-emerald-400">"NOVA-8821-{selectedCard?.last4 || '4412'}"</span>,</p>
              <p className="pl-4"><span className="text-yellow-300">"card_holder"</span>: <span className="text-emerald-400">"{selectedCard?.holder || 'Unknown'}"</span>,</p>
              <p className="pl-4"><span className="text-yellow-300">"base_currency"</span>: <span className="text-emerald-400">"USD"</span>,</p>
              <p className="pl-4"><span className="text-exchange">"exchange"</span>: <span className="text-sky-400">{"{"}</span></p>
              <p className="pl-8"><span className="text-yellow-300">"rate"</span>: <span className="text-amber-400">{exchangeRate.toFixed(4)}</span>,</p>
              <p className="pl-8"><span className="text-yellow-300">"target_code"</span>: <span className="text-emerald-400">"{selectedCurrencyCode}"</span></p>
              <p className="pl-4"><span className="text-sky-400">{"}"}</span>,</p>
              <p className="pl-4"><span className="text-yellow-300">"balances_usd"</span>: <span className="text-sky-400">{"{"}</span></p>
              <p className="pl-8"><span className="text-yellow-300">"spent"</span>: <span className="text-amber-400">{spentInUSD}</span>,</p>
              <p className="pl-8"><span className="text-yellow-300">"available"</span>: <span className="text-amber-400">{availableInUSD}</span></p>
              <p className="pl-4"><span className="text-sky-400">{"}"}</span></p>
              <p className="text-sky-400">{"}"}</p>
            </div>
            
          </div>

        </section>

      </div>
    </div>
  );
}
