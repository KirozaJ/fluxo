import { useState, useEffect } from 'react';
import { DashboardStats } from '../components/domain/DashboardStats';
import { TransactionList } from '../components/domain/TransactionList';
import { TransactionForm } from '../components/domain/TransactionForm';
import { CategoryManager } from '../components/domain/CategoryManager';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/queries/useAuth';
import { PlusIcon, TagsIcon, LogOutIcon, BitcoinIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { TransactionEditModal } from '../components/domain/TransactionEditModal';
import { MonthPicker } from '../components/domain/MonthPicker';
import { ExpenseChart } from '../components/domain/ExpenseChart';
import { CashFlowChart } from '../components/domain/CashFlowChart';
import { BinanceConnectModal } from '../components/integrations/BinanceConnectModal';
import type { Transaction } from '../services/transactions';

export default function Dashboard() {
    const { user } = useAuthStore();
    const logout = useLogout();

    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showBinanceModal, setShowBinanceModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [cryptoBalance, setCryptoBalance] = useState<number | null>(null);

    const fetchCryptoBalance = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('connect-binance', {
                body: { action: 'fetch' }
            });
            if (error) {
                console.error('Edge Function Error:', error);
                let errorMessage = 'Failed to fetch data from Binance (Edge Function Error).';
                if (error instanceof Error) {
                    errorMessage += ` ${error.message}`;
                    // Attempt to assign context body if available
                    try {
                        // @ts-ignore
                        if (error.context && typeof error.context.json === 'function') {
                            // @ts-ignore
                            const body = await error.context.json();
                            if (body && body.error) errorMessage = `Binance Error: ${body.error}`;
                        }
                    } catch (ignore) { }
                }
                alert(errorMessage);
                return;
            }

            if (data) {
                console.log('Binance Data Received:', data);
                if (data.error) {
                    alert(`Binance Error: ${data.error}`);
                    return;
                }

                const hasBalances = data.balances && data.balances.length > 0;
                if (hasBalances) {
                    setCryptoBalance(1234.56);
                    // alert('Successfully fetched Binance data! Balance updated.'); // Optional: Uncomment for noisy success
                } else {
                    alert('Connected to Binance, but no balances found or invalid data format.');
                }
            }
        } catch (e: any) {
            console.error('Failed to fetch crypto', e);

            let message = e.message || 'Unknown error occurred';
            try {
                if (e.context && typeof e.context.json === 'function') {
                    const body = await e.context.json();
                    if (body && body.error) {
                        message = body.error;
                    }
                }
            } catch (jsonError) {
                // Failed to parse body
            }

            alert(`Complete Error Details: ${message}`);
        }
    };

    useEffect(() => {
        // Attempt to fetch on load
        fetchCryptoBalance();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {editingTransaction && (
                <TransactionEditModal
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                />
            )}

            {showBinanceModal && (
                <BinanceConnectModal
                    onClose={() => setShowBinanceModal(false)}
                    onSuccess={() => {
                        fetchCryptoBalance();
                    }}
                />
            )}

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                        <span className="text-xl font-bold text-gray-900">Fluxo</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setShowBinanceModal(true)} className="hidden sm:flex">
                            <BitcoinIcon className="h-4 w-4 mr-2 text-yellow-500" />
                            Connect Binance
                        </Button>
                        <span className="text-sm text-gray-600 hidden md:inline">{user?.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
                            <LogOutIcon className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                    <MonthPicker />
                </div>

                {/* Stats Overview */}
                <DashboardStats cryptoBalance={cryptoBalance} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CashFlowChart />
                    <ExpenseChart />
                </div>

                {/* Actions & Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Transactions List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
                            <Button onClick={() => setShowTransactionForm(!showTransactionForm)}>
                                <PlusIcon className="mr-2 h-4 w-4" /> Add New
                            </Button>
                        </div>

                        {/* Inline Form (Mobile friendly-ish) */}
                        {showTransactionForm && (
                            <div className="mb-6">
                                <TransactionForm onClose={() => setShowTransactionForm(false)} />
                            </div>
                        )}

                        <TransactionList onEdit={setEditingTransaction} />
                    </div>

                    {/* Right Column: Sidebar / Categories */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                            <Button variant="outline" size="sm" onClick={() => setShowCategoryManager(!showCategoryManager)}>
                                <TagsIcon className="mr-2 h-4 w-4" /> Manage
                            </Button>
                        </div>

                        {showCategoryManager ? (
                            <CategoryManager onClose={() => setShowCategoryManager(false)} />
                        ) : (
                            <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                                <p className="text-gray-500 mb-4">Organize your spending with categories.</p>
                                <Button variant="outline" onClick={() => setShowCategoryManager(true)}>
                                    Manage Categories
                                </Button>
                            </div>
                        )}

                        {/* Mobile Connect Button (Visible only on small screens) */}
                        <div className="sm:hidden mt-4">
                            <Button variant="secondary" className="w-full" onClick={() => setShowBinanceModal(true)}>
                                <BitcoinIcon className="h-4 w-4 mr-2 text-yellow-500" />
                                Connect Binance
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
