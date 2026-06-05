'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Settings, 
  ReceiptText, 
  Plus, 
  Download, 
  Database, 
  Plane, 
  Coins, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction, TransactionCategory, TransactionStatus } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenRecordModal: () => void;
}

export default function TransactionsView({ transactions, onOpenRecordModal }: TransactionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state for sidebar filters
  const [selectedCategories, setSelectedCategories] = useState<TransactionCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TransactionStatus[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');

  // Available categories for ticking
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

  // Available statuses for ticking
  const statusesList: TransactionStatus[] = ['Cleared', 'Pending', 'Flagged', 'Success'];

  const getTransactionIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('aws') || desc.includes('cloud') || desc.includes('software')) return <Database className="w-4 h-4 text-slate-600" />;
    if (desc.includes('united') || desc.includes('air') || desc.includes('travel')) return <Plane className="w-4 h-4 text-blue-600" />;
    if (desc.includes('goldman') || desc.includes('treasury') || desc.includes('transfer')) return <Coins className="w-4 h-4 text-emerald-600 animate-pulse" />;
    return <ReceiptText className="w-4 h-4 text-purple-600" />;
  };

  const handleCategoryToggle = (category: TransactionCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleStatusToggle = (status: TransactionStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedFlow('ALL');
    setSearchTerm('');
  };

  // Filter computation
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search text match
      const mathSearch = 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!mathSearch) return false;

      // Category filter match
      if (selectedCategories.length > 0 && !selectedCategories.includes(tx.category)) {
        return false;
      }

      // Status filter match
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(tx.status)) {
        return false;
      }

      // Money flow match
      if (selectedFlow === 'INFLOW' && tx.amount < 0) return false;
      if (selectedFlow === 'OUTFLOW' && tx.amount > 0) return false;

      return true;
    });
  }, [transactions, searchTerm, selectedCategories, selectedStatuses, selectedFlow]);

  // Aggregate stats of filtered transactions
  const aggregates = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalPendingCount = 0;

    filteredTransactions.forEach(tx => {
      if (tx.amount > 0) {
        totalInflow += tx.amount;
      } else {
        totalOutflow += Math.abs(tx.amount);
      }
      if (tx.status === 'Pending') {
        totalPendingCount++;
      }
    });

    return { totalInflow, totalOutflow, totalPendingCount };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-sans tracking-tight text-on-surface">Transactions Ledger</h2>
          <p className="text-on-surface-variant font-medium text-sm mt-1">Audit, edit, and record manual or api corporate treasury movements.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert(`Exporting corporate ledger (${filteredTransactions.length} records) to CSV.`)}
            className="px-4 py-2 border border-outline-variant bg-white text-on-surface text-sm font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={onOpenRecordModal}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Record New Purchase</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl">
          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Total Ledger Inflows</span>
          <p className="text-xl font-mono text-emerald-700 font-extrabold mt-1">
            +${aggregates.totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl">
          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Total Ledger Outflows</span>
          <p className="text-xl font-mono text-slate-800 font-extrabold mt-1">
            -${aggregates.totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-50 border border-outline-variant p-4 rounded-xl">
          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Pending Transactions Queue</span>
          <p className="text-xl font-mono text-amber-600 font-extrabold mt-1">
            {aggregates.totalPendingCount} Operations
          </p>
        </div>
      </div>

      {/* Primary Workspace Split */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Filters Sidebar (4 Columns) */}
        <section className="col-span-12 lg:col-span-3 bg-white border border-outline-variant rounded-xl p-5 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-secondary font-semibold hover:underline cursor-pointer"
            >
              Reset all
            </button>
          </div>

          {/* Money Flow option */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-on-surface-variant tracking-wider uppercase">Transactions Flow</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-1 text-xs font-semibold text-center select-none">
              <div 
                onClick={() => setSelectedFlow('ALL')}
                className={`py-1.5 rounded-md cursor-pointer transition-all ${selectedFlow === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-on-surface-variant hover:text-slate-900'}`}
              >
                All
              </div>
              <div 
                onClick={() => setSelectedFlow('INFLOW')}
                className={`py-1.5 rounded-md cursor-pointer transition-all ${selectedFlow === 'INFLOW' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-on-surface-variant hover:text-emerald-700'}`}
              >
                Inflow
              </div>
              <div 
                onClick={() => setSelectedFlow('OUTFLOW')}
                className={`py-1.5 rounded-md cursor-pointer transition-all ${selectedFlow === 'OUTFLOW' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-on-surface-variant hover:text-slate-900'}`}
              >
                Outflow
              </div>
            </div>
          </div>

          {/* Status filter checklist */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-extrabold text-on-surface-variant tracking-wider uppercase">Post-Status Checks</span>
            <div className="space-y-1.5 text-xs font-medium">
              {statusesList.map(status => (
                <label key={status} className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-slate-900 text-on-surface-variant">
                  <input 
                    type="checkbox" 
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4 border-outline rounded text-slate-900 focus:ring-0"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category checklist */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-extrabold text-on-surface-variant tracking-wider uppercase">Operational Categories</span>
            <div className="space-y-1.5 text-xs font-medium max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {categoriesList.map(cat => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-slate-900 text-on-surface-variant">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 border-outline rounded text-slate-900 focus:ring-0"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Ledger Table Section (9 Columns) */}
        <section className="col-span-12 lg:col-span-9 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          
          {/* Main ledger search bar */}
          <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/30">
            <div className="relative w-full max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <Search className="w-4.5 h-4.5 opacity-70" />
              </span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ledger description or entity..."
                className="w-full bg-white border border-outline-variant rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 outline-none placeholder:text-on-surface-variant/70 text-slate-900"
              />
            </div>
            
            {/* Summary details */}
            <span className="ml-auto text-xs font-semibold text-on-surface-variant bg-slate-100 px-2.5 py-1 rounded-full">
              Found {filteredTransactions.length} of {transactions.length} records
            </span>
          </div>

          {/* Master Ledger List */}
          <div className="overflow-x-auto scrollbar-hide">
            {filteredTransactions.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant/60">
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Transaction / UUID</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Subsidiary / Entity</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Corporate Card</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant/85 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-sm">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                            {getTransactionIcon(tx.description)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{tx.description}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono font-medium">{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface-variant">{tx.entity}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-xs font-semibold rounded text-slate-800">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-on-surface-variant">
                        * {tx.cardLast4}
                      </td>
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
                      <td className={`px-6 py-4 text-right font-mono font-bold ${tx.amount < 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-on-surface-variant">
                <FileSpreadsheet className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
                <p className="font-bold text-sm">No transaction matches your select filter targets.</p>
                <p className="text-xs text-on-surface-variant/70 mt-1 mb-4">Reset searches or filter lists to see other matches.</p>
                <button 
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-outline bg-white text-on-surface text-xs font-semibold rounded hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
