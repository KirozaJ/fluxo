import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService, type SavingsGoal } from '../../services/savings';
import { Card, CardContent } from '../ui/Card';
import { PlusIcon, TrashIcon, TrendingUpIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { CreateGoalModal } from './CreateGoalModal';
import { ContributeGoalModal } from './ContributeGoalModal';
import { useSettingsStore } from '../../store/settingsStore';

export const SavingsGoalsList = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [contributeModalConfig, setContributeModalConfig] = useState<{
        isOpen: boolean;
        goalId: string | null;
        goalName: string;
        mode: 'deposit' | 'withdraw';
    }>({
        isOpen: false,
        goalId: null,
        goalName: '',
        mode: 'deposit'
    });

    const { baseCurrency } = useSettingsStore(); // Assuming this store exists from previous context
    const queryClient = useQueryClient();

    const { data: goals, isLoading } = useQuery({
        queryKey: ['savings_goals'],
        queryFn: savingsService.getAll
    });


    const deleteMutation = useMutation({
        mutationFn: savingsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
        }
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: baseCurrency || 'USD',
        }).format(amount);
    };

    if (isLoading) return <div className="animate-pulse h-48 bg-secondary/10 rounded-xl" />;

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        Savings Pots 🍯
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <PlusIcon className="w-4 h-4 mr-1" /> New Pot
                    </Button>
                </div>

                {(!goals || goals.length === 0) ? (
                    <Card className="bg-secondary/5 border-dashed border-2 border-secondary/20">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                <TrendingUpIcon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-text-main">No savings goals yet</h3>
                            <p className="text-sm text-text-muted mb-4">Create a pot to start tracking your savings!</p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Create your first Pot
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.map((goal: SavingsGoal) => {
                            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

                            return (
                                <Card key={goal.id} className="relative group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-xl">
                                                    {goal.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-text-main">{goal.name}</h3>
                                                    <p className="text-xs text-text-muted">Target: {formatCurrency(goal.target_amount)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this savings pot?')) deleteMutation.mutate(goal.id);
                                                }}
                                                className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-text-main">{formatCurrency(goal.current_amount)}</span>
                                                <span className="text-text-muted">{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 bg-primary`} // Defaulting to primary for simplicity, or map color
                                                    style={{ width: `${progress}%`, backgroundColor: `var(--color-${goal.color})` }}
                                                />
                                                {/* Fallback inline style for color if CSS vars aren't set up for it specifically */}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs h-8"
                                                onClick={() => {
                                                    setContributeModalConfig({ isOpen: true, goalId: goal.id, goalName: goal.name, mode: 'deposit' });
                                                }}
                                            >
                                                + Add
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs h-8"
                                                onClick={() => {
                                                    setContributeModalConfig({ isOpen: true, goalId: goal.id, goalName: goal.name, mode: 'withdraw' });
                                                }}
                                            >
                                                - Withdraw
                                            </Button>
                                        </div>
                                    </CardContent>
                                    {/* Background decorative gradient */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${goal.color} opacity-5 blur-2xl rounded-bl-full pointer-events-none`} />
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <CreateGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <ContributeGoalModal // New modal component
                isOpen={contributeModalConfig.isOpen}
                onClose={() => setContributeModalConfig(prev => ({ ...prev, isOpen: false }))}
                goalId={contributeModalConfig.goalId}
                goalName={contributeModalConfig.goalName}
                mode={contributeModalConfig.mode}
            />
        </>
    );
};
