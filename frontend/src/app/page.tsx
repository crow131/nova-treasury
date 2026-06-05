'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import OverviewView from '../components/OverviewView';
import CardsView from '../components/CardsView';
import TransactionsView from '../components/TransactionsView';
import TreasuryView from '../components/TreasuryView';
import SettingsView from '../components/SettingsView';
import { IssueCardModal, RecordTransactionModal } from '../components/Modals';
import { Card, Transaction } from '../types';
import { INITIAL_CARDS, INITIAL_TRANSACTIONS } from '../data';

export default function Home() {
  // State elements
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [lookbackDays, setLookbackDays] = useState<number>(30);

  // Modal open controllers
  const [issueCardModalOpen, setIssueCardModalOpen] = useState<boolean>(false);
  const [recordTransactionModalOpen, setRecordTransactionModalOpen] = useState<boolean>(false);

  // Operation Actions
  const handleIssueCard = (newCard: Card) => {
    setCards([newCard, ...cards]);
  };

  const handleRecordTransaction = (newTx: Transaction) => {
    setTransactions([newTx, ...transactions]);
    
    // Dynamically update card spent balance to trace state update accurately!
    setCards(currentCards => 
      currentCards.map(card => {
        if (card.last4 === newTx.cardLast4) {
          return {
            ...card,
            spent: card.spent + Math.abs(newTx.amount)
          };
        }
        return card;
      })
    );
  };

  const handleUpdateCardLimit = (cardId: string, newLimit: number) => {
    setCards(currentCards => 
      currentCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            limit: newLimit
          };
        }
        return card;
      })
    );
  };

  const handleToggleCardStatus = (cardId: string) => {
    setCards(currentCards => 
      currentCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            status: card.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
          };
        }
        return card;
      })
    );
  };

  const handleUpdateLookbackDays = (days: number) => {
    setLookbackDays(days);
  };

  // Switch rendered pages dynamically based on active tab selection
  const renderActiveView = () => {
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
      
      {/* Sidebar Navigation (Fixed layout width) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenIssueModal={() => setIssueCardModalOpen(true)}
      />

      {/* Main content viewport space (Offset by sidebar width: 280px) */}
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

    </div>
  );
}
