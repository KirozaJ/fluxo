import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { XIcon, LockIcon } from 'lucide-react';

interface BinanceConnectModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const BinanceConnectModal = ({ onClose, onSuccess }: BinanceConnectModalProps) => {
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.functions.invoke('connect-binance', {
                body: { action: 'connect', apiKey, apiSecret }
            });

            if (error) {
                // Try to parse the response body from the error if available
                // Supabase functions error might contain context
                console.error('Supabase Invoke Error:', error);
                if (error instanceof Error) throw error;
                throw new Error('An unknown error occurred connecting to the server.');
            }

            if (data?.error) throw new Error(data.error);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Connection failed:', err);
            // If it's a FunctionsHttpError, it might have a context with the body
            let message = err.message || 'Failed to connect.';

            // Check if it is a stringified JSON error from our backend
            try {
                const body = await err.context?.json();
                if (body?.error) message = body.error;
            } catch (e) {
                // ignore
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-1 bg-yellow-400 rounded-full"><LockIcon className="w-3 h-3 text-black" /></div>
                            Connect Binance
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-800 border border-yellow-200">
                                <strong>Security Notice:</strong> Your keys are encrypted before storage.
                                We only require "Read-Only" permissions. Please ensure your API Key does NOT have withdrawal permissions.
                            </div>

                            <Input
                                label="API Key"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder="Binance API Key"
                                required
                            />
                            <Input
                                label="API Secret"
                                type="password"
                                value={apiSecret}
                                onChange={e => setApiSecret(e.target.value)}
                                placeholder="Binance API Secret"
                                required
                            />

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <Button type="submit" className="w-full bg-[#FCD535] text-black hover:bg-[#F0CA30]" isLoading={isLoading}>
                                Secure Connect
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
