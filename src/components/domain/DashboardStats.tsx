import { useTransactions } from '../../hooks/queries/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, BitcoinIcon } from 'lucide-react';
interface DashboardStatsProps {
    cryptoBalance?: number | null;
}

export const DashboardStats = ({ cryptoBalance }: DashboardStatsProps) => {
    const { data: transactions, isLoading } = useTransactions();

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)}
        </div>;
    }

    const income = transactions
        ?.filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    const expense = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0) || 0;

    const balance = income - expense;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance (Fiat)</CardTitle>
                    <WalletIcon className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Income</CardTitle>
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">+${income.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">-${expense.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">Crypto Portfolio</CardTitle>
                    <BitcoinIcon className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-700">
                        {cryptoBalance !== null && cryptoBalance !== undefined
                            ? `$${cryptoBalance.toFixed(2)}`
                            : <span className="text-sm text-gray-400 font-normal">Not Connected</span>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
