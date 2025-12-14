import { supabase } from '../lib/supabase';

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    created_at: string;
}

export interface CreateCategoryParams {
    name: string;
    type: 'income' | 'expense';
}

export const categoryService = {
    async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Category[];
    },

    async create(params: CreateCategoryParams) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({
                ...params,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
