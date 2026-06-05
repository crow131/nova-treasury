'use client';

import React, { useState } from 'react';
import { X, CreditCard, Receipt, PlusCircle, Sparkles } from 'lucide-react';
import { Card, Transaction, CardType, TransactionCategory } from '../types';

interface IssueCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueCard: (card: Card) => void;
}

export function IssueCardModal({ isOpen, onClose, onIssueCard }: IssueCardModalProps) {
  const [holderName, setHolderName] = useState('');
  const [cardType, setCardType] = useState<CardType>('Virtual');
  const [limitValue, setLimitValue] = useState('10000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim()) {
      alert('Please fill in card holder specification name.');
      return;
    }
    const limit = parseFloat(limitValue);
    if (isNaN(limit) || limit <= 0) {
      alert('Credit limit must be a positive number.');
      return;
    }

    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const fullNumber = `${last4} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresMonth = Math.floor(1 + Math.random() * 11).toString().padStart(2, '0');
    const expiresYear = (new Date().getFullYear() % 100 + 3).toString();

    const newCard: Card = {
      id: `card_${Math.random().toString(36).substr(2, 9)}`,
      last4,
      fullNumber,
      holder: holderName,
      limit,
      spent: 0,
      expires: `${expiresMonth}/${expiresYear}`,
      status: 'ACTIVE',
      cardType,
      relativeBg: '#0b1c30'
    };

    onIssueCard(newCard);
    alert(`Success: Corporate ${cardType} card successfully generated for ${holderName}.`);
    // Reset state
    setHolderName('');
    setCardType('Virtual');
    setLimitValue('10000');
    onClose();
  };

  return (
    <div className="fixed inset-0 min-h-screen grid items-center justify-center bg-slate-900/60 backdrop-blur-xs z-50 p-4">
      <div className="bg-white border border-outline-variant w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-6">
        
        {/* Close Button Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-on-surface-variant hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
            <CreditCard className="w-5 h-5 text-tertiary-fixed-dim" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Issue Corporate Card</h3>
            <p className="text-xs text-on-surface-variant/90 font-medium">Create enterprise-grade cap restrictions instantly.</p>
          </div>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Holder Full Name</label>
            <input 
              type="text" 
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g. Neil Armstrong"
              className="w-full border border-outline bg-white px-3 py-2 text-sm outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Card Allocation Type</label>
            <select 
              value={cardType}
              onChange={(e) => setCardType(e.target.value as CardType)}
              className="w-full border border-outline bg-white px-3 py-2 text-sm outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="Virtual">Virtual Card (Instant Access)</option>
              <option value="Physical">Physical Card (Plastic Shipping)</option>
              <option value="Platinum">Sovereign Platinum Metallics</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Credit Limit Allocation (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">$</span>
              <input 
                type="number" 
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                className="w-full border border-outline bg-white pl-8 pr-4 py-2 text-sm outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant leading-normal">
              Note: This triggers lookbacks constraint checks automatic approvals on limits up to $100,000.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-1 px-4 border border-outline-variant hover:bg-slate-50 font-bold rounded text-slate-800 text-xs transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-black font-semibold rounded text-white text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-tertiary-fixed-dim" />
              <span>Issue New Card</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

interface RecordTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  onRecordTransaction: (tx: Transaction) => void;
}

export function RecordTransactionModal({ isOpen, onClose, cards, onRecordTransaction }: RecordTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amountValue, setAmountValue] = useState('150');
  const [category, setCategory] = useState<TransactionCategory>('Software');
  const [entityExchange, setEntityExchange] = useState('Proton North America');
  const [selectedCardLast4, setSelectedCardLast4] = useState<string>('');

  // Auto configure selectedCardLast4 on card loads
  React.useEffect(() => {
    if (cards.length > 0 && !selectedCardLast4) {
      setSelectedCardLast4(cards[0].last4);
    }
  }, [cards, selectedCardLast4]);

  if (!isOpen) return null;

  const categoriesList: TransactionCategory[] = [
    'Infrastructure',
    'Software',
    'Travel',
    'Meals',
    'Entertainment',
    'Software & SaaS',
    'Business Meals',
    'Travel & Lodging',
    'Marketing & Advertising',
    'Office Supplies'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !entityExchange.trim()) {
      alert('Please fill in operational merchant description and company entity details.');
      return;
    }
    const amt = parseFloat(amountValue);
    if (isNaN(amt) || amt <= 0) {
      alert('Purchase amount must be a positive code number.');
      return;
    }

    const randomID = `#TRX-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    // Negative amounts represent standard expenses
    const newTx: Transaction = {
      id: randomID,
      description,
      date: formattedDate,
      amount: -amt, // Expense is negative
      cardLast4: selectedCardLast4 || cards[0].last4,
      status: 'Pending',
      category,
      entity: entityExchange
    };

    onRecordTransaction(newTx);
    alert(`Success: Ledger record generated. ID: ${randomID}`);
    // Clear state
    setDescription('');
    setAmountValue('150');
    setCategory('Software');
    setEntityExchange('Proton North America');
    onClose();
  };

  return (
    <div className="fixed inset-0 min-h-screen grid items-center justify-center bg-slate-900/60 backdrop-blur-xs z-50 p-4 font-sans text-xs">
      <div className="bg-white border border-outline-variant w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-6">
        
        {/* Close Button button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-on-surface-variant hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full cursor-pointer md:top-5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal header details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
            <Receipt className="w-5 h-5 text-tertiary-fixed-dim" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Record Corporate Ledger Entry</h3>
            <p className="text-xs text-on-surface-variant/90 font-medium">Record purchases with sandbox compliance controls.</p>
          </div>
        </div>

        {/* Modal form items */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5 text-left">
            <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Purchase / Merchant Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. AWS Cloud Services, Slack Pro Sync"
              className="w-full border border-outline bg-white px-3 py-2 text-sm outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Expense Dollar Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">$</span>
              <input 
                type="number" 
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                className="w-full border border-outline bg-white pl-8 pr-4 py-2 text-sm outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Corporate Card last 4</label>
              <select 
                value={selectedCardLast4}
                onChange={(e) => setSelectedCardLast4(e.target.value)}
                className="w-full border border-outline bg-white px-3 py-2 text-xs outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {cards.map(c => (
                  <option key={c.id} value={c.last4}>
                    * {c.last4} ({c.holder})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Operational category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full border border-outline bg-white px-3 py-2 text-xs outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="font-extrabold text-on-surface-variant tracking-wider uppercase">Target Subsidiary Entity</label>
            <input 
              type="text" 
              value={entityExchange}
              onChange={(e) => setEntityExchange(e.target.value)}
              className="w-full border border-outline bg-white px-3 py-2 text-sm outline-none font-semibold text-slate-800 rounded focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Action button */}
          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-1 px-4 border border-outline-variant hover:bg-slate-50 font-bold rounded text-slate-800 text-xs transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-black font-semibold rounded text-white text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-tertiary-fixed-dim" />
              <span>Record entry</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
