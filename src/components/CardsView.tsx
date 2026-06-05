'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Edit3, 
  Search, 
  Plus, 
  Info,
  CheckCircle2,
  AlertTriangle,
  History,
  X,
  CreditCard as BaseCardIcon
} from 'lucide-react';
import { Card, Transaction } from '../types';

interface CardsViewProps {
  cards: Card[];
  transactions: Transaction[];
  onUpdateCardLimit: (cardId: string, newLimit: number) => void;
  onToggleCardStatus: (cardId: string) => void;
  onOpenIssueModal: () => void;
  onRecordTransactionClick: () => void;
}

export default function CardsView({
  cards,
  transactions,
  onUpdateCardLimit,
  onToggleCardStatus,
  onOpenIssueModal,
  onRecordTransactionClick
}: CardsViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || 'card_001');
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'settings' | 'controls'>('transactions');

  // Find currently selected card
  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  // Specific transactions filtered for this card
  const cardTransactions = transactions.filter(t => t.cardLast4 === selectedCard?.last4);

  const handleEditLimit = () => {
    const rawValue = prompt(`Enter new credit limit in USD for ${selectedCard.holder}:`, selectedCard.limit.toString());
    if (rawValue === null) return;
    const value = parseFloat(rawValue);
    if (isNaN(value) || value <= 0) {
      alert('Please enter a valid positive number for the credit limit.');
      return;
    }
    onUpdateCardLimit(selectedCard.id, value);
    alert(`Success: Limit for ${selectedCard.holder} updated to $${value.toLocaleString()}`);
  };

  const handleToggleFreeze = () => {
    onToggleCardStatus(selectedCard.id);
    const action = selectedCard.status === 'ACTIVE' ? 'frozen/locked' : 're-activated';
    alert(`Success: Corporate card *${selectedCard.last4} has been ${action}.`);
  };

  return (
    <div className="flex border border-outline-variant rounded-xl overflow-hidden bg-white shadow-lg h-[calc(100vh-180px)]">
      
      {/* Left List Pane: Cards (1/3 Width) */}
      <section className="w-1/3 border-r border-outline-variant flex flex-col bg-surface-container-lowest">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">Active Portfolio</h2>
          <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-bold text-[10px] rounded-sm uppercase tracking-wide">
            {cards.length} Cards
          </span>
        </div>
        
        {/* Left card list scroll container */}
        <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-outline-variant/40">
          {cards.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <div 
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`p-5 cursor-pointer transition-all border-l-4 ${
                  isSelected 
                    ? 'bg-surface-container-low/70 border-secondary' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-10 h-6 rounded-sm flex items-center justify-center font-bold text-white text-[9px] ${
                    card.status === 'ACTIVE' ? 'bg-slate-900' : 'bg-slate-400'
                  }`}>
                    * {card.last4}
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    * {card.last4}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      card.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}></span>
                    <span className="text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-widest">
                      {card.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-on-surface-variant/70 uppercase font-bold">Holder</p>
                    <p className="font-semibold text-slate-900 text-sm truncate max-w-[130px]">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-on-surface-variant/70 uppercase font-bold">Limit</p>
                    <p className="font-mono text-slate-900 font-bold text-xs">
                      ${card.limit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Action Button: Footer Pane */}
        <div className="p-4 bg-slate-50 border-t border-outline-variant">
          <button 
            onClick={onOpenIssueModal}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-black active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Card</span>
          </button>
        </div>
      </section>

      {/* Right Pane: Detailed Viewer (2/3 Width) */}
      <section className="flex-1 flex flex-col bg-background p-6 overflow-y-auto custom-scrollbar">
        {selectedCard ? (
          <>
            {/* Header Toolbar */}
            <div className="flex justify-between items-start mb-6 border-b border-outline-variant/40 pb-4">
              <div>
                <nav className="flex gap-1.5 text-[9px] font-bold tracking-wider text-on-surface-variant/80 mb-1 uppercase">
                  <span>CARDS</span>
                  <span>/</span>
                  <span className="text-secondary">DETAILED VIEW</span>
                </nav>
                <h2 className="text-2xl font-bold text-slate-900">{selectedCard.holder}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-on-surface-variant font-mono font-medium tracking-tight">
                    UUID: NOVA-8821-{selectedCard.last4}-X
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    selectedCard.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {selectedCard.status}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleToggleFreeze}
                  className="px-4 py-2 border border-outline bg-white text-on-surface text-xs font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {selectedCard.status === 'ACTIVE' ? (
                    <>
                      <Lock className="w-4 h-4 text-red-600" />
                      <span>Freeze Card</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span>Unfreeze Card</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleEditLimit}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-950 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Limit</span>
                </button>
              </div>
            </div>

            {/* Visual Display Grid */}
            <div className="grid grid-cols-12 gap-6 mb-6">
              
              {/* Card visual rendering */}
              <div className="col-span-12 md:col-span-5">
                <div className="bg-[#0b1c30] rounded-2xl p-6 aspect-[1.58/1] flex flex-col justify-between text-white shadow-xl relative overflow-hidden ring-1 ring-white/10 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-8 bg-yellow-500/80 rounded-md border border-yellow-400 flex items-center justify-center p-1 font-mono text-[9px] font-bold">
                      CHIP
                    </div>
                    <span className="font-bold tracking-widest italic text-lg uppercase text-slate-300">NOVA</span>
                  </div>

                  <div className="space-y-4">
                    <p className="font-mono text-lg lg:text-xl tracking-[0.2em] font-semibold text-slate-100">
                      {selectedCard.fullNumber || '4412 8821 0092 4556'}
                    </p>
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <p className="text-[8px] uppercase text-on-primary-container/85 mb-0.5">Card Holder</p>
                        <p className="font-bold tracking-wider uppercase text-slate-200">{selectedCard.holder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase text-on-primary-container/85 mb-0.5">Expires</p>
                        <p className="font-mono font-bold text-slate-200">{selectedCard.expires}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistical balances */}
              <div className="col-span-12 md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Credit Limit</span>
                    <p className="text-xl lg:text-2xl font-mono text-slate-905 font-bold mt-1">
                      ${selectedCard.limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-secondary h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Math.round((selectedCard.spent / selectedCard.limit) * 100) || 0, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                      ${selectedCard.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })} spent this term
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Available Balance</span>
                    <p className="text-xl lg:text-2xl font-mono text-secondary font-bold mt-1">
                      ${(selectedCard.limit - selectedCard.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => alert(`Fee Schedule for Enterprise Account: $0 processing fees. $0 annual card fee under contract Nova-Core-2026.`)}
                    className="text-secondary text-xs font-bold mt-4 flex items-center gap-1.5 hover:underline text-left cursor-pointer"
                  >
                    <Info className="w-4 h-4 shrink-0" />
                    <span>View fee schedules</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="border-b border-outline-variant mb-4">
              <div className="flex gap-6">
                <button 
                  onClick={() => setActiveSubTab('transactions')}
                  className={`pb-3 font-semibold text-sm cursor-pointer border-b-2 transition-all ${
                    activeSubTab === 'transactions' ? 'border-slate-900 text-slate-900' : 'border-transparent text-on-surface-variant hover:text-slate-900'
                  }`}
                >
                  Transactions ({cardTransactions.length})
                </button>
                <button 
                  onClick={() => setActiveSubTab('settings')}
                  className={`pb-3 font-semibold text-sm cursor-pointer border-b-2 transition-all ${
                    activeSubTab === 'settings' ? 'border-slate-900 text-slate-900' : 'border-transparent text-on-surface-variant hover:text-slate-900'
                  }`}
                >
                  Card Settings
                </button>
                <button 
                  onClick={() => setActiveSubTab('controls')}
                  className={`pb-3 font-semibold text-sm cursor-pointer border-b-2 transition-all ${
                    activeSubTab === 'controls' ? 'border-slate-900 text-slate-900' : 'border-transparent text-on-surface-variant hover:text-slate-900'
                  }`}
                >
                  Compliance Controls
                </button>
              </div>
            </div>

            {/* Tab content renderer */}
            <div className="flex-grow">
              
              {/* Transactions Tab content */}
              {activeSubTab === 'transactions' && (
                <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                  {cardTransactions.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-outline-variant/60">
                        <tr>
                          <th className="px-6 py-3 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Merchant / Target</th>
                          <th className="px-6 py-3 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider text-right">Amount</th>
                          <th className="px-6 py-3 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/40 text-sm">
                        {cardTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3.5 text-on-surface-variant">{tx.date}</td>
                            <td className="px-6 py-3.5 font-semibold text-slate-900">
                              <div>
                                <p>{tx.description}</p>
                                <p className="text-[10px] text-on-surface-variant font-mono font-medium">{tx.id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="px-2.5 py-1 bg-surface-container text-xs font-bold rounded text-on-surface">
                                {tx.category}
                              </span>
                            </td>
                            <td className={`px-6 py-3.5 text-right font-mono font-bold ${tx.amount < 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                              {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  tx.status === 'Cleared' || tx.status === 'Success'
                                    ? 'bg-emerald-500'
                                    : tx.status === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}></span>
                                <span className="font-semibold text-xs text-on-surface-variant">{tx.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-on-surface-variant">
                      <History className="w-10 h-10 text-on-surface-variant/50 mx-auto mb-2" />
                      <p className="font-bold text-sm">No transaction ledger records registered yet.</p>
                      <p className="text-xs text-on-surface-variant/70 mt-1 mb-4">Register a manual ledger purchase to populate the feed.</p>
                      <button 
                        onClick={onRecordTransactionClick}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-black transition-all cursor-pointer inline-block"
                      >
                        Record first transaction
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Card Settings Tab */}
              {activeSubTab === 'settings' && (
                <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
                  <h4 className="font-bold text-base text-slate-950">Active Digital Wallet Configurations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-outline rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Apple Wallet Enablement</p>
                        <p className="text-xs text-on-surface-variant">Support immediate NFC dynamic authorizations</p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedCard.status === 'ACTIVE'}
                        disabled={selectedCard.status !== 'ACTIVE'}
                        className="w-4 h-4 text-secondary border-outline rounded cursor-pointer" 
                        onChange={() => alert('Secure element Apple Pay tokens updated successfully.')}
                      />
                    </div>
                    <div className="p-4 border border-outline rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Google Pay Synchronization</p>
                        <p className="text-xs text-on-surface-variant">Configure enterprise virtual account tokens</p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedCard.status === 'ACTIVE'}
                        disabled={selectedCard.status !== 'ACTIVE'}
                        className="w-4 h-4 text-secondary border-outline rounded cursor-pointer" 
                        onChange={() => alert('Android digital wallet cryptographic keys initialized.')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Controls Tab */}
              {activeSubTab === 'controls' && (
                <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
                  <h4 className="font-bold text-base text-slate-950">Regulatory Compliance Mandates</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Corporate credit cards adhere to standard Federal KYC/KYB limits. Modifying limits or statuses triggers a secondary security audit. See active rules below:
                  </p>
                  
                  <div className="divide-y divide-slate-100">
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Daily Transaction Caps</p>
                        <p className="text-xs text-on-surface-variant">Max single-purchase threshold triggers</p>
                      </div>
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-900">
                        ${(selectedCard.limit * 0.4).toLocaleString()} USD
                      </span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Merchant Category Code (MCC) Rules</p>
                        <p className="text-xs text-on-surface-variant">Infrastructure & Corporate Travel restricted mcc list</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-55 px-2 py-0.5 rounded border border-emerald-200">
                        COMPLIANT
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow p-12 text-on-surface-variant text-center">
            <BaseCardIcon className="w-16 h-16 text-slate-300 mb-2" />
            <p className="font-bold">No active cards found in your credentials portfolio.</p>
            <p className="text-xs text-on-surface-variant/70 mt-1 mb-4">Click below to generate a virtual developer account card.</p>
            <button 
              onClick={onOpenIssueModal}
              className="px-6 py-3 bg-slate-900 text-white rounded font-bold hover:bg-black transition-all cursor-pointer shadow"
            >
              Issue Virtual Sandbox Card
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
