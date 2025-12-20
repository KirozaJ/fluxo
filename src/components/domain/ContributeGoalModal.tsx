import { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { XIcon, PlusIcon, MinusIcon } from 'lucide-react';
import { savingsService } from '../../services/savings';
import { useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '../../store/settingsStore';

interface ContributeGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: string | null;
    goalName: string;
    mode: 'deposit' | 'withdraw';
}

export const ContributeGoalModal = ({ isOpen, onClose, goalId, goalName, mode }: ContributeGoalModalProps) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const { baseCurrency } = useSettingsStore();

    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    if (!isOpen || !goalId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const numAmount = Number(amount);
            const finalAmount = mode === 'withdraw' ? -numAmount : numAmount;

            await savingsService.contribute(goalId, finalAmount);
            await queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
            onClose();
        } catch (error) {
            console.error('Failed to update pot:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const PRESET_AMOUNTS = [10, 20, 50, 100];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-sm bg-background border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                        {mode === 'deposit' ? (
                            <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                                <PlusIcon className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="p-2 bg-red-500/10 rounded-full text-red-500">
                                <MinusIcon className="w-5 h-5" />
                            </div>
                        )}
                        {mode === 'deposit' ? 'Add to' : 'Withdraw from'} {goalName}
                    </CardTitle>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg font-medium">
                                    {baseCurrency === 'USD' ? '$' : baseCurrency}
                                </span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-center bg-secondary/5 border-2 border-secondary/20 rounded-xl text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted/30"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {PRESET_AMOUNTS.map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setAmount(amt.toString())}
                                    className="py-2 px-1 text-sm font-medium rounded-lg bg-secondary/10 text-text-muted hover:bg-secondary/20 hover:text-text-main transition-colors"
                                >
                                    +{amt}
                                </button>
                            ))}
                        </div>

                        <div className="pt-2 flex gap-3">
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
                                disabled={isLoading || !amount || Number(amount) <= 0}
                            >
                                {isLoading ? 'Processing...' : (mode === 'deposit' ? 'Add Money' : 'Withdraw')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
