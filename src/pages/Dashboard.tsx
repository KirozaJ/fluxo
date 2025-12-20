import { useState } from 'react';
import { DashboardStats } from '../components/domain/DashboardStats';
import { ExportMenu } from '../components/domain/ExportMenu';
import { TransactionList } from '../components/domain/TransactionList';
import { TransactionForm } from '../components/domain/TransactionForm';
import { CategoryManager } from '../components/domain/CategoryManager';
import { BudgetProgress } from '../components/domain/BudgetProgress';
import { SubscriptionList } from '../components/domain/SubscriptionList';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/queries/useAuth';
import { PlusIcon, LogOutIcon, SettingsIcon } from 'lucide-react';

import { SmartInsightCard } from '../components/domain/SmartInsightCard';
import { TransactionEditModal } from '../components/domain/TransactionEditModal';
import { SettingsModal } from '../components/domain/SettingsModal';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { SavingsGoalsList } from '../components/domain/SavingsGoalsList';
import { AccountsList } from '../components/domain/AccountsList';
import { AIChatWidget } from '../components/domain/AIChatWidget';
import { MonthPicker } from '../components/domain/MonthPicker';
import { ExpenseChart } from '../components/domain/ExpenseChart';
import { CashFlowChart } from '../components/domain/CashFlowChart';
import type { Transaction } from '../services/transactions';

export default function Dashboard() {
    const { user } = useAuthStore();
    const logout = useLogout();

    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] transition-colors duration-300">
            <AIChatWidget />
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            {editingTransaction && (
                <TransactionEditModal
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                />
            )}


            {/* Header */}
            <header className="bg-white/70 dark:bg-black/30 backdrop-blur-md border-b border-white/20 dark:border-white/10 sticky top-0 z-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.ico" alt="Fluxo" className="w-10 h-10 rounded-xl drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] dark:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] object-cover" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">Fluxo</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeSwitcher />
                        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-text-muted hover:text-text-main">
                            <SettingsIcon className="w-5 h-5" />
                        </Button>
                        <span className="text-sm text-text-muted hidden md:inline border-l pl-4 border-gray-300 dark:border-gray-700 h-6 flex items-center">{user?.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
                            <LogOutIcon className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-text-main">Overview</h2>
                    <div className="flex gap-2">
                        <ExportMenu />
                        <MonthPicker />
                    </div>
                </div>

                {/* Stats Overview */}
                <DashboardStats />

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CashFlowChart />
                    <ExpenseChart />
                </div>

                {/* Actions & Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Accounts & Transactions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-text-main">Transactions</h2>
                            <Button onClick={() => setShowTransactionForm(!showTransactionForm)}>
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Transaction
                            </Button>
                        </div>

                        {/* Inline Form (Mobile friendly-ish) */}
                        {showTransactionForm && (
                            <div className="mb-6">
                                <TransactionForm onClose={() => setShowTransactionForm(false)} />
                            </div>
                        )}

                        {/* Accounts List at top of main area */}
                        <AccountsList />

                        <div className="space-y-6">
                            <TransactionList onEdit={setEditingTransaction} />
                        </div>
                    </div>

                    {/* Right Column: Insights, Budget, Subscriptions, Savings, Categories */}
                    <div className="space-y-6">
                        <SmartInsightCard />
                        <BudgetProgress />
                        <SubscriptionList />
                        <SavingsGoalsList />

                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-text-main">Categories</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCategoryManager(true)}
                            >
                                Manage
                            </Button>
                        </div>
                        {showCategoryManager && <CategoryManager onClose={() => setShowCategoryManager(false)} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
