import { useState, useEffect } from 'react';
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/queries/useTransactions';
import { useCategories } from '../../hooks/queries/useCategories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
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
    is_recurring: z.boolean().optional(),
    recurring_day: z.number().min(1).max(31).optional(),
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
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDay, setRecurringDay] = useState(new Date().getDate());
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setAmount(String(initialData.amount));
            setDescription(initialData.description || '');
            setType(initialData.type);
            setCategoryId(initialData.category_id || '');
            setDate(initialData.date);
            setIsRecurring(initialData.is_recurring || false);
            setRecurringDay(initialData.recurring_day || new Date(initialData.date).getDate());
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            amount: parseFloat(amount),
            description,
            type,
            category_id: categoryId || undefined,
            date,
            is_recurring: isRecurring,
            recurring_day: isRecurring ? recurringDay : undefined
        };

        const result = transactionSchema.safeParse({
            ...formData,
            // Strip extra fields for validation if schema not updated yet, 
            // or we need to update schema. Let's assume validation passes or is loose.
            // Actually I should update the schema in the file too.
        });

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

                    {type === 'expense' && (
                        <div className="bg-secondary/10 p-3 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-text-main">
                                    Monthly Subscription
                                </label>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isRecurring}
                                    onClick={() => setIsRecurring(!isRecurring)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isRecurring ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            {isRecurring && (
                                <div className="flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <label className="text-sm text-text-muted whitespace-nowrap">
                                        Renew on day:
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={recurringDay}
                                        onChange={e => setRecurringDay(parseInt(e.target.value))}
                                        className="w-16 h-8 rounded-md border border-white/20 bg-background text-text-main px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <Select
                        label="Category"
                        placeholder="Select Category"
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categories?.filter(c => c.type === type).map(c => ({
                            value: c.id,
                            label: c.name
                        })) || []}
                    />

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
