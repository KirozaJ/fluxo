import { useState } from 'react';
import { DashboardStats } from '../components/domain/DashboardStats';
import { TransactionList } from '../components/domain/TransactionList';
import { TransactionForm } from '../components/domain/TransactionForm';
import { CategoryManager } from '../components/domain/CategoryManager';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/queries/useAuth';
import { PlusIcon, TagsIcon, LogOutIcon } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();
    const logout = useLogout();

    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                        <span className="text-xl font-bold text-gray-900">Fluxo</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden md:inline">{user?.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
                            <LogOutIcon className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Overview */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                    <DashboardStats />
                </section>

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

                        <TransactionList />
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
                    </div>
                </div>
            </main>
        </div>
    );
}
