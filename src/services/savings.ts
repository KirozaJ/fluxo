import { supabase } from '../lib/supabase';

export interface SavingsGoal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    color: string;
    icon: string;
    created_at: string;
}

export interface CreateGoalParams {
    name: string;
    target_amount: number;
    current_amount?: number;
    target_date?: string;
    color?: string;
    icon?: string;
}

export interface UpdateGoalParams extends Partial<CreateGoalParams> {
    id: string;
}

export const savingsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as SavingsGoal[];
    },

    async create(params: CreateGoalParams) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('savings_goals')
            .insert({
                ...params,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    },

    async update({ id, ...updates }: UpdateGoalParams) {
        const { data, error } = await supabase
            .from('savings_goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('savings_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async contribute(id: string, amount: number) {
        // We use a stored procedure or just simple read-modify-write for MVP
        // Since we don't have a transaction history for pots yet, read-modify-write is fine for now
        // Or we can use the 'rpc' if we had one. Let's do a safe fetch-update.

        const { data: goal, error: fetchError } = await supabase
            .from('savings_goals')
            .select('current_amount')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const newAmount = (goal.current_amount || 0) + amount;

        const { data, error } = await supabase
            .from('savings_goals')
            .update({ current_amount: newAmount })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as SavingsGoal;
    }
};
