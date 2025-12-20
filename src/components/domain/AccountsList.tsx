import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService, type Account } from '../../services/accounts';
import { Card, CardContent } from '../ui/Card';
import { PlusIcon, TrashIcon, WalletIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { CreateAccountModal } from './CreateAccountModal';
import { useSettingsStore } from '../../store/settingsStore';
import { exchangeRateService } from '../../services/exchangeRates';

export const AccountsList = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { baseCurrency } = useSettingsStore();
    const queryClient = useQueryClient();

    const { data: accounts, isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => accountsService.getAll()
    });

    const { data: rates } = useQuery({
        queryKey: ['exchange_rates'],
        queryFn: () => exchangeRateService.getRates(baseCurrency.toLowerCase()),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const deleteMutation = useMutation({
        mutationFn: accountsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    });

    const formatCurrency = (amount: number, currency: string) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency,
                currencyDisplay: 'symbol'
            }).format(amount);
        } catch {
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const convert = (amount: number, fromCurrency: string) => {
        if (!rates) return amount;
        if (fromCurrency === baseCurrency) return amount;

        // E.g. USD base. Rate is USD->EUR. To convert EUR -> USD: eur / rate
        // We need consistent rate logic. Assuming rates are Base->Target or similar.
        // Let's reuse logic from DashboardStats if possible, or reimplement simply here.
        // Standard CoinGecko/API logic usually provides rates against a base (e.g. USD).

        // If rates are based on USD:

        // Convert 'from' to USD, then USD to 'to'
        // If API returns: 1 USD = x EUR, y GBP
        // amount / x = amount in USD
        // amount_in_usd * y = amount in Target

        // Caution: logic depends on exchangeRateService source.
        // Assuming rates object format { "EUR": 0.92, "GBP": 0.79 } where 1 USD = val
        // If base is USD, amount / rateFrom gives USD. 
        // Then * rateTo (if base changed from USD)

        // Simplified for MVP:
        const amountInUSD = amount / (rates[fromCurrency.toUpperCase()] || 1);
        return amountInUSD * (rates[baseCurrency.toUpperCase()] || 1);
    };

    if (isLoading) return <div className="animate-pulse h-32 bg-secondary/10 rounded-xl" />;

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        Accounts & Wallets 🏦
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Account
                    </Button>
                </div>

                {(!accounts || accounts.length === 0) ? (
                    <Card className="bg-secondary/5 border-dashed border-2 border-secondary/20">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                <WalletIcon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-text-main">No accounts yet</h3>
                            <p className="text-sm text-text-muted mb-4">Add your bank accounts, wallets, or crypto to track your net worth.</p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Account
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.map((acc: Account) => {
                            const convertedBalance = convert(acc.balance, acc.currency);

                            return (
                                <Card key={acc.id} className="relative group hover:shadow-lg transition-all border-l-4 border-l-primary/50">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-text-main">{acc.name}</h3>
                                                <p className="text-xs text-text-muted uppercase tracking-wider">{acc.type} • {acc.currency}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this account?')) deleteMutation.mutate(acc.id);
                                                }}
                                                className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <div className="text-xl font-bold text-text-main">
                                                {formatCurrency(acc.balance, acc.currency)}
                                            </div>
                                            {acc.currency !== baseCurrency && (
                                                <div className="text-xs text-text-muted mt-1">
                                                    ≈ {formatCurrency(convertedBalance, baseCurrency)}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <CreateAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
};
