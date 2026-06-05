'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import OverviewView from '../components/OverviewView';
import CardsView from '../components/CardsView';
import TransactionsView from '../components/TransactionsView';
import TreasuryView from '../components/TreasuryView';
import SettingsView from '../components/SettingsView';
import SpecsView from '../components/SpecsView';
import { IssueCardModal, RecordTransactionModal } from '../components/Modals';
import { Card, Transaction } from '../types';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lookbackDays, setLookbackDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal open controllers
  const [issueCardModalOpen, setIssueCardModalOpen] = useState<boolean>(false);
  const [recordTransactionModalOpen, setRecordTransactionModalOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (message: string) => {
        const isImplemented = 
          message.startsWith("Success:") || 
          message.startsWith("Declined:") || 
          message.startsWith("Failed") || 
          message.startsWith("Network") || 
          message.startsWith("Error");

        if (isImplemented) {
          setToast(message);
        } else {
          setToast(`⏳ Feature Sandbox (Coming Soon)\n${message}`);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const cardsRes = await fetch(`${apiBaseUrl}/api/cards`);
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData);
      }

      const txsRes = await fetch(`${apiBaseUrl}/api/transactions`);
      if (txsRes.ok) {
        const txsData = await txsRes.json();
        setTransactions(txsData);
      }
    } catch (error) {
      console.error("Failed to connect to Nova Treasury API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Operation Actions
  const handleIssueCard = async (newCard: Card) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holder: newCard.holder,
          limit: newCard.limit,
          cardType: newCard.cardType,
          relativeBg: newCard.relativeBg
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Declined: ${errorData.detail || 'Failed to issue card.'}`);
        return;
      }

      await fetchData(); // Refresh data from backend
      setIssueCardModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Network error connecting to Treasury API.');
    }
  };

  const handleRecordTransaction = async (newTx: Transaction) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newTx.description,
          amount: newTx.amount,
          cardLast4: newTx.cardLast4,
          category: newTx.category,
          entity: newTx.entity,
          date: new Date()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Declined: ${errorData.detail || 'Failed to record transaction.'}`);
        return;
      }

      await fetchData(); // Refresh data from backend
      setRecordTransactionModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Network error connecting to Treasury API.');
    }
  };

  const handleUpdateCardLimit = async (cardId: string, newLimit: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/cards/${cardId}/limit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLimit)
      });

      if (!response.ok) {
        alert('Failed to update card limit.');
        return;
      }

      await fetchData(); // Refresh data from backend
    } catch (err) {
      console.error(err);
      alert('Network error updating card limit.');
    }
  };

  const handleToggleCardStatus = async (cardId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/cards/${cardId}/toggle-status`, {
        method: 'POST'
      });

      if (!response.ok) {
        alert('Failed to update card status.');
        return;
      }

      await fetchData(); // Refresh data from backend
    } catch (err) {
      console.error(err);
      alert('Network error updating card status.');
    }
  };

  const handleUpdateLookbackDays = (days: number) => {
    setLookbackDays(days);
  };

  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Connecting to Goldman Liquidity Hub...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewView 
            cards={cards} 
            transactions={transactions} 
            onNavigateToTab={setActiveTab}
            onOpenNewTransfer={() => setRecordTransactionModalOpen(true)}
          />
        );
      case 'cards':
        return (
          <CardsView 
            cards={cards} 
            transactions={transactions} 
            onUpdateCardLimit={handleUpdateCardLimit}
            onToggleCardStatus={handleToggleCardStatus}
            onOpenIssueModal={() => setIssueCardModalOpen(true)}
            onRecordTransactionClick={() => setRecordTransactionModalOpen(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionsView 
            transactions={transactions} 
            onOpenRecordModal={() => setRecordTransactionModalOpen(true)}
          />
        );
      case 'treasury':
        return (
          <TreasuryView 
            cards={cards} 
          />
        );
      case 'settings':
        return (
          <SettingsView 
            lookbackDays={lookbackDays} 
            onUpdateLookbackDays={handleUpdateLookbackDays}
          />
        );
      case 'specs':
        return (
          <SpecsView />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500 font-semibold">
            View selection error. Tab identifier not recognized.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex font-sans select-none antialiased">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenIssueModal={() => setIssueCardModalOpen(true)}
      />

      {/* Main content viewport space */}
      <div className="flex-1 flex flex-col pl-[280px] min-h-screen">
        
        {/* Top common search & profile header */}
        <Header activeTab={activeTab} />

        {/* Content Wrapper */}
        <main className="flex-grow p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderActiveView()}
        </main>

      </div>

      {/* Issuing New Card Overlay Modal */}
      <IssueCardModal 
        isOpen={issueCardModalOpen} 
        onClose={() => setIssueCardModalOpen(false)} 
        onIssueCard={handleIssueCard}
      />

      {/* Record Ledger purchase Overlay Modal */}
      <RecordTransactionModal 
        isOpen={recordTransactionModalOpen} 
        onClose={() => setRecordTransactionModalOpen(false)} 
        cards={cards} 
        onRecordTransaction={handleRecordTransaction}
      />

      {/* Custom Global Toast System */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700/80 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in max-w-sm transition-all duration-300 transform translate-y-0 opacity-100">
          <div className="p-1 bg-white/10 rounded-lg shrink-0">
            <Sparkles className="w-4 h-4 text-tertiary-fixed-dim animate-pulse" />
          </div>
          <p className="text-xs font-semibold whitespace-pre-line leading-relaxed text-slate-200">
            {toast}
          </p>
        </div>
      )}

    </div>
  );
}
