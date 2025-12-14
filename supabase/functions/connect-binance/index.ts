import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) throw new Error('Unauthorized')

        // Create Admin Client for bypassing RLS
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        )

        // Handle different actions: 'connect' (save keys) or 'fetch' (get balance)
        const { action, apiKey, apiSecret } = await req.json()
        const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY')

        if (!ENCRYPTION_KEY) throw new Error('Server misconfiguration: Missing encryption key')

        if (action === 'connect') {
            if (!apiKey || !apiSecret) throw new Error('Missing keys')

            // Simple manual encryption simulation for MVP (AES-GCM recommended for prod)
            // In a real prod environment, use a robust library or Supabase Vault.
            // Here we will just assume the keys are passed to be saved.
            // SECURITY NOTICE: For this demo, we will store them. 
            // In production, implement AES encryption here using the ENCRYPTION_KEY.

            // Let's assume we have an `encrypt` function (mocked here for clarity, needs implementation)
            const encryptedKey = await encrypt(apiKey, ENCRYPTION_KEY);
            const encryptedSecret = await encrypt(apiSecret, ENCRYPTION_KEY);

            const { error } = await supabaseAdmin
                .from('user_integrations')
                .upsert({
                    user_id: user.id,
                    provider: 'binance',
                    encrypted_api_key: encryptedKey,
                    encrypted_api_secret: encryptedSecret
                }, { onConflict: 'user_id, provider' })

            if (error) throw error
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'fetch') {
            // 1. Get encrypted keys
            const { data: integration } = await supabaseAdmin
                .from('user_integrations')
                .select('encrypted_api_key, encrypted_api_secret')
                .eq('user_id', user.id)
                .eq('provider', 'binance')
                .single()

            if (!integration) throw new Error('No Binance connection found')

            // 2. Decrypt
            const apiKey = await decrypt(integration.encrypted_api_key, ENCRYPTION_KEY); // Mock decrypt
            const apiSecret = await decrypt(integration.encrypted_api_secret, ENCRYPTION_KEY); // Mock decrypt

            // 3. Call Binance
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = await hmacSha256(apiSecret, queryString);

            const response = await fetch(`https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`, {
                headers: { 'X-MBX-APIKEY': apiKey }
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Binance API Error: ${err}`);
            }

            const data = await response.json();
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        throw new Error('Invalid action')

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

// --- Crypto Helpers (Web Crypto API) ---

async function encrypt(text: string, secretKey: string): Promise<string> {
    const key = await importKey(secretKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

    // Return IV + Ciphertext as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
}

async function decrypt(encryptedText: string, secretKey: string): Promise<string> {
    const key = await importKey(secretKey);
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
}

async function importKey(secret: string): Promise<CryptoKey> {
    // Hash the secret to ensure it's 256-bit
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const hash = await crypto.subtle.digest("SHA-256", keyData);
    return crypto.subtle.importKey("raw", hash, "AES-GCM", true, ["encrypt", "decrypt"]);
}

async function hmacSha256(key: string, message: string) {
    const enc = new TextEncoder();
    const algorithm = { name: "HMAC", hash: "SHA-256" };
    const keyAb = await crypto.subtle.importKey("raw", enc.encode(key), algorithm, false, ["sign", "verify"]);
    const signature = await crypto.subtle.sign(algorithm.name, keyAb, enc.encode(message));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}
