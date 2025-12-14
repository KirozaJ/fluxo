import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    description: string | null;
    date: string;
    category_id: string | null;
    type: 'income' | 'expense';
    created_at: string;
    // Joined fields
    categories?: {
        name: string;
    } | null;
}

export interface CreateTransactionParams {
    amount: number;
    description?: string;
    date: string;
    category_id?: string;
    type: 'income' | 'expense';
}

export interface UpdateTransactionParams extends Partial<CreateTransactionParams> {
    id: string;
}

export const transactionService = {
    async getAll() {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        categories (
          name
        )
      `)
            .order('date', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    },

    async create(params: CreateTransactionParams) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(params)
            .select()
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async update({ id, ...updates }: UpdateTransactionParams) {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Transaction;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getBalance() {
        // This is a calculated query. 
        // For specific dashboard stats, we might want to use a database function or aggregate here.
        // For now, fetching all and calculating locally or using Supabase summary queries.
        // Let's implement a simple summary calculation on the client side for Phase 1 to keep it simple,
        // or we can add a specific RPC later.
        // Returning getAll for now as the hook will handle selection/filtering.
        return this.getAll();
    }
};
