import { supabase } from '../lib/supabase';
// Imports removed

// Define strict email/password types to avoid union issues with Phone auth
interface AuthCredentials {
    email: string;
    password: string;
}

export const authService = {
    async signUp({ email, password }: AuthCredentials) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async signIn({ email, password }: AuthCredentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    }
};
