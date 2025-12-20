import { supabase } from '../lib/supabase';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: string;
    currency: string;
    balance: number;
    color: string;
    icon: string;
    created_at: string;
}

export interface CreateAccountParams {
    name: string;
    type: string;
    currency: string;
    balance: number;
    color?: string;
    icon?: string;
}

export interface UpdateAccountParams extends Partial<CreateAccountParams> {
    id: string;
}

export const accountsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Account[];
    },

    async create(params: CreateAccountParams) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('accounts')
            .insert({
                ...params,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data as Account;
    },

    async update({ id, ...updates }: UpdateAccountParams) {
        const { data, error } = await supabase
            .from('accounts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Account;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
