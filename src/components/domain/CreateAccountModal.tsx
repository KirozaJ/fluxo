import { useState } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { XIcon } from 'lucide-react';
import { accountsService } from '../../services/accounts';
import { useQueryClient } from '@tanstack/react-query';
// import { useSettingsStore } from '../../store/settingsStore';

interface CreateAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ACCOUNT_TYPES = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment' },
    { value: 'crypto', label: 'Crypto Wallet' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BRL', 'ARS', 'JPY', 'BTC', 'ETH'];

export const CreateAccountModal = ({ isOpen, onClose }: CreateAccountModalProps) => {
    const [name, setName] = useState('');
    const [type, setType] = useState(ACCOUNT_TYPES[0].value);
    const [currency, setCurrency] = useState('USD');
    const [balance, setBalance] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const queryClient = useQueryClient();
    // const { baseCurrency } = useSettingsStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await accountsService.create({
                name,
                type,
                currency,
                balance: Number(balance),
                color: 'blue', // Default
                icon: 'wallet' // Default
            });
            await queryClient.invalidateQueries({ queryKey: ['accounts'] });
            onClose();
            setName('');
            setBalance('');
        } catch (error) {
            console.error('Failed to create account:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-background border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <CardTitle>Add New Account</CardTitle>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                Account Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Main Bank, Travel Wallet"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                Account Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {ACCOUNT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">
                                    Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">
                                    Initial Balance
                                </label>
                                <input
                                    type="number"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="0.00"
                                    step="any"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
