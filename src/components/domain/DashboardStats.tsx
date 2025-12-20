import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, Loader2Icon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { exchangeRateService } from '../../services/exchangeRates';
import { accountsService } from '../../services/accounts';

export const DashboardStats = () => {
    const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
    const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: accountsService.getAll
    });

    const { baseCurrency } = useSettingsStore();
    const [rates, setRates] = useState<Record<string, number>>({});
    const [isLoadingRates, setIsLoadingRates] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            setIsLoadingRates(true);
            try {
                const fetchedRates = await exchangeRateService.getRates(baseCurrency.toLowerCase());
                setRates(fetchedRates);
            } catch (error) {
                console.error("Failed to load rates", error);
            } finally {
                setIsLoadingRates(false);
            }
        };

        fetchRates();
    }, [baseCurrency]);

    const isLoading = isLoadingTransactions || isLoadingAccounts;

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl"></div>)}
        </div>;
    }

    // Helper to convert any amount to base currency
    const convert = (amount: number, currency: string = 'USD') => {
        if (currency === baseCurrency) return amount;

        const rate = rates[currency] || rates[currency.toUpperCase()];
        if (rate) {
            return amount * rate;
        }

        if (currency.toUpperCase() === 'USD' && baseCurrency === 'USD') return amount;

        return amount;
    };

    // Total Balance = Sum of all Account balances
    const totalBalance = accounts?.reduce((acc, account) => {
        return acc + convert(account.balance, account.currency);
    }, 0) || 0;

    // Income/Expense = Flow from transactions
    const calculateFlow = (type: 'income' | 'expense') => {
        if (!transactions) return 0;
        return transactions
            .filter(t => t.type === type)
            .reduce((acc, t) => {
                const tAmount = Number(t.amount);
                const tCurrency = t.currency || 'USD'; // Default to USD for legacy data
                return acc + convert(tAmount, tCurrency);
            }, 0);
    };

    const income = calculateFlow('income');
    const expense = calculateFlow('expense');

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: baseCurrency,
                currencyDisplay: 'symbol'
            }).format(amount);
        } catch (e) {
            return `${baseCurrency} ${amount.toFixed(2)}`;
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-muted)]">
                        Total Balance {isLoadingRates && <Loader2Icon className="inline h-3 w-3 animate-spin ml-1" />}
                    </CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <WalletIcon className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-[var(--color-text-main)]">{formatCurrency(totalBalance)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-muted)]">Income</CardTitle>
                    <div className="p-2 bg-success/10 rounded-full">
                        <ArrowUpIcon className="h-4 w-4 text-success" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-success">+{formatCurrency(income)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text-muted)]">Expenses</CardTitle>
                    <div className="p-2 bg-error/10 rounded-full">
                        <ArrowDownIcon className="h-4 w-4 text-error" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-600">-{formatCurrency(expense)}</div>
                </CardContent>
            </Card>
        </div>
    );
};
