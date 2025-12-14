import { useState, useEffect } from 'react';
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/queries/useTransactions';
import { useCategories } from '../../hooks/queries/useCategories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusIcon, SaveIcon, XIcon } from 'lucide-react';
import { z } from 'zod';
import type { Transaction } from '../../services/transactions';

const transactionSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().optional(),
    type: z.enum(['income', 'expense']),
    category_id: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

interface TransactionFormProps {
    onClose?: () => void;
    initialData?: Transaction | null;
}

export const TransactionForm = ({ onClose, initialData }: TransactionFormProps) => {
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const { data: categories } = useCategories();

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setAmount(String(initialData.amount));
            setDescription(initialData.description || '');
            setType(initialData.type);
            setCategoryId(initialData.category_id || '');
            setDate(initialData.date);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            amount: parseFloat(amount),
            description,
            type,
            category_id: categoryId || undefined,
            date
        };

        const result = transactionSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                newErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(newErrors);
            return;
        }

        setErrors({});

        if (initialData) {
            updateMutation.mutate({
                id: initialData.id,
                ...formData
            }, {
                onSuccess: () => {
                    if (onClose) onClose();
                }
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    setAmount('');
                    setDescription('');
                    if (onClose) onClose();
                }
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{initialData ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <XIcon className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={type === 'expense' ? 'primary' : 'outline'}
                            className={`flex-1 ${type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            onClick={() => setType('expense')}
                        >
                            Expense
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'income' ? 'primary' : 'outline'}
                            className={`flex-1 ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={() => setType('income')}
                        >
                            Income
                        </Button>
                    </div>

                    <Input
                        label="Amount"
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        error={errors.amount}
                    />

                    <Input
                        label="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Grocery, Salary, etc."
                        error={errors.description}
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select
                            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {categories?.filter(c => c.type === type).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Date"
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        error={errors.date}
                    />

                    <Button type="submit" className="w-full" isLoading={isPending}>
                        {initialData ? <SaveIcon className="mr-2 h-4 w-4" /> : <PlusIcon className="mr-2 h-4 w-4" />}
                        {initialData ? 'Save Changes' : 'Add Transaction'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
