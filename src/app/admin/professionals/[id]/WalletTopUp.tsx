'use client';

import { useState } from 'react';
import { addManualCredit } from '@/app/actions/admin-wallet';
import { Button } from '@/components/ui/Button';

export default function WalletTopUp({ professionalId }: { professionalId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const numAmount = parseFloat(amount);
        const result = await addManualCredit(professionalId, numAmount, note);

        setLoading(false);

        if (result.success) {
            setIsOpen(false);
            setAmount('');
            setNote('');
            alert('Credit added successfully!');
        } else {
            alert(result.error);
        }
    }

    return (
        <>
            <Button variant="outline" className="w-full text-xs mt-2" onClick={() => setIsOpen(true)}>
                + Manually Add Credit
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#333333]">Add Manual Credit</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#333333]">Amount (€)</label>
                                <input
                                    type="number"
                                    min="0.10"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="10.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#333333]">Admin Note</label>
                                <textarea
                                    required
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="Reason for adjustment..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setIsOpen(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Credit'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
