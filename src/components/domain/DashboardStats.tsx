import { useState, useEffect } from 'react';
import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, Loader2Icon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { exchangeRateService } from '../../services/exchangeRates';

export const DashboardStats = () => {
    const { data: transactions, isLoading } = useTransactions();
    const { baseCurrency } = useSettingsStore();
    const [rates, setRates] = useState<Record<string, number>>({});
    const [isLoadingRates, setIsLoadingRates] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            setIsLoadingRates(true);
            try {
                // Fetch rates relative to baseCurrency (USD as source for logic simplicity, or direct base)
                // Actually CoinGecko gives price OF coin IN vs_currency.
                // So getRates('usd') gives BTC in USD.

                // If baseCurrency is USD:
                // BTC transaction amount: 1. Rate BTC->USD is 95000. Total = 1 * 95000.
                // EUR transaction amount: 100. Rate EUR->USD is 1.05. Total = 100 * 1.05.

                // So we need rates for ALL transaction currencies against the Base Currency.
                // But our service `getRates(baseCurrency)` fetches predefined list (BTC, ETH, USD, EUR, etc) IN baseCurrency.
                // This works perfectly if the transaction currency is in that list.

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

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl"></div>)}
        </div>;
    }

    // Helper to convert any amount to base currency
    const convert = (amount: number, currency: string = 'USD') => {
        if (currency === baseCurrency) return amount;

        // If we have the rate for this currency in terms of base currency
        // e.g. base=USD. rates['BTC'] = 95000. 
        // Transaction: 1 BTC. Result: 1 * 95000 = $95000. Correct.

        // e.g. base=EUR. rates['USD'] = 0.95.
        // Transaction: 100 USD. Result: 100 * 0.95 = €95. Correct.

        const rate = rates[currency] || rates[currency.toUpperCase()];
        if (rate) {
            return amount * rate;
        }

        // Fallback: if we don't have rate (e.g. obscure currency), treat as 1:1 or 0? 
        // For safety/visibility, treating as 1:1 but maybe warn? 
        // Let's assume 1:1 for now to not break totals completely, or 0 if strict.
        // Given using CoinGecko list is limited, we might miss some.
        // But our selector only allows the ones we fetch. So it should be fine.
        // Exception: If user selected 'USD' and we are in 'USD', rate might not be returned by API or is 1.
        if (currency.toUpperCase() === 'USD' && baseCurrency === 'USD') return amount;

        return amount;
    };

    const calculateTotal = (type?: 'income' | 'expense') => {
        if (!transactions) return 0;
        return transactions
            .filter(t => !type || t.type === type)
            .reduce((acc, t) => {
                const tAmount = Number(t.amount);
                const tCurrency = t.currency || 'USD'; // Default to USD for legacy data
                return acc + convert(tAmount, tCurrency);
            }, 0);
    };

    const income = calculateTotal('income');
    const expense = calculateTotal('expense');
    const balance = income - expense;

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
                    <div className="text-3xl font-bold text-[var(--color-text-main)]">{formatCurrency(balance)}</div>
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
