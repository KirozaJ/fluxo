import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { CameraIcon, Loader2Icon, XIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface ReceiptUploaderProps {
    onScanComplete: (data: { amount?: number; date?: string; description?: string }) => void;
}

export const ReceiptUploader = ({ onScanComplete }: ReceiptUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        processImage(file);
    };

    const processImage = async (file: File) => {
        setIsScanning(true);
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            console.log("Scanned Text:", text); // Debugging

            // Simple Regex Heuristics
            // Amount: Look for numbers with decimals, often preceded by $ or TOTAL
            // Date: Look for YYYY-MM-DD, DD/MM/YYYY, etc.

            const extractedData: { amount?: number; date?: string; description?: string } = {};

            // 1. Extract Amount (largest amount usually, or line with TOTAL)
            const amountMatches = text.match(/[\d,]+\.\d{2}/g);
            if (amountMatches) {
                // Heuristic: Get the largest number found, assuming it's the total
                const amounts = amountMatches.map(m => parseFloat(m.replace(/,/g, ''))).filter(n => !isNaN(n));
                if (amounts.length > 0) {
                    extractedData.amount = Math.max(...amounts);
                }
            }

            // 2. Extract Date (simple patterns)
            // YYYY-MM-DD
            const dateMatchISO = text.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatchISO) extractedData.date = dateMatchISO[0];

            // DD/MM/YYYY
            const dateMatchSlash = text.match(/\d{2}\/\d{2}\/\d{4}/);
            // Need to convert to YYYY-MM-DD for input
            if (!extractedData.date && dateMatchSlash) {
                const [d, m, y] = dateMatchSlash[0].split('/');
                extractedData.date = `${y} -${m} -${d} `;
            }

            // 3. Extract Description (First line or merchant name guess)
            // Just taking first non-empty line for now
            const lines = text.split('\n').filter(l => l.trim().length > 3);
            if (lines.length > 0) {
                extractedData.description = lines[0].substring(0, 50); // truncated
            }

            onScanComplete(extractedData);

        } catch (error) {
            console.error("OCR Error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const clearPreview = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full mb-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            {!previewUrl ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 py-8 bg-surface hover:bg-secondary/10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                >
                    <div className="flex flex-col items-center gap-2 text-text-muted">
                        <CameraIcon className="w-6 h-6" />
                        <span>Scan Receipt (Beta)</span>
                    </div>
                </Button>
            ) : (
                <div className="relative rounded-lg overflow-hidden border border-white/20 bg-black/50">
                    <img src={previewUrl} alt="Receipt Preview" className="h-32 w-full object-cover opacity-50" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        {isScanning ? (
                            <div className="text-white text-center">
                                <Loader2Icon className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                                <span className="font-bold text-sm">Scanning... {progress}%</span>
                            </div>
                        ) : (
                            <div className="absolute top-2 right-2">
                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-black/50 text-white hover:bg-red-500" onClick={clearPreview}>
                                    <XIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                        {!isScanning && (
                            <div className="absolute bottom-2 left-2 right-2 bg-green-500/90 text-white text-xs p-2 rounded text-center">
                                Scan Complete! Check fields.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
