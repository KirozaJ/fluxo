import { useState } from 'react';
import { DownloadIcon, FileTextIcon, TableIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTransactions } from '../../hooks/queries/useTransactions';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const ExportMenu = () => {
    const { data: transactions } = useTransactions();
    const [isOpen, setIsOpen] = useState(false);

    const handleExportCSV = () => {
        if (!transactions) return;

        const csvData = transactions.map(t => ({
            Date: format(new Date(t.date), 'yyyy-MM-dd'),
            Description: t.description || '',
            Category: t.categories?.name || 'Uncategorized',
            Type: t.type,
            Amount: t.amount,
            Currency: t.currency || 'USD' // Fallback for now
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `fluxo_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOpen(false);
    };

    const handleExportPDF = () => {
        if (!transactions) return;

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Fluxo Transaction Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on ${format(new Date(), 'PPpp')}`, 14, 30);

        const tableData = transactions.map(t => [
            format(new Date(t.date), 'yyyy-MM-dd'),
            t.description || '',
            t.categories?.name || 'Uncategorized',
            t.type,
            `${t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [139, 92, 246] }, // Violet-500
        });

        doc.save(`fluxo_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2"
            >
                <DownloadIcon className="h-4 w-4" />
                Export
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/20 bg-surface shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
                        <button
                            onClick={handleExportCSV}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-main hover:bg-secondary/10 transition-colors"
                        >
                            <TableIcon className="h-4 w-4 text-green-500" />
                            Export CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-main hover:bg-secondary/10 transition-colors"
                        >
                            <FileTextIcon className="h-4 w-4 text-red-500" />
                            Export PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
