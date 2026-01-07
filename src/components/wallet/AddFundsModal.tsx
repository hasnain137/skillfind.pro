"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

const PRESET_AMOUNTS = [10, 20, 50, 100];

export function AddFundsModal({ children }: { children: React.ReactNode }) {
    const t = useTranslations('Wallet');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [amount, setAmount] = useState<number>(20); // Default to 20
    const [customAmount, setCustomAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkTransaction = async (txId: string) => {
            const toastId = toast.loading(t('messages.verifyingDeposit'));
            try {
                const res = await fetch('/api/wallet/verify-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId: txId })
                });

                if (res.ok) {
                    toast.success(t('messages.depositSuccess'), { id: toastId });
                    router.refresh();
                } else {
                    // It might be pending or failed
                    toast.error(t('errors.depositVerificationFailed'), { id: toastId });
                }
            } catch (error) {
                console.error("Verification error", error);
                toast.error(t('errors.depositVerificationFailed'), { id: toastId });
            }
            // cleanup params
            router.replace('/pro/wallet');
        };

        const txId = searchParams.get('transactionId');
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');

        if (success === 'true' && txId) {
            checkTransaction(txId);
        } else if (success === 'true') {
            // Fallback for old sessions or missing ID
            toast.success(t('messages.depositSuccess'));
            router.replace('/pro/wallet');
        } else if (canceled === 'true') {
            toast.info(t('messages.depositCanceled'));
            router.replace('/pro/wallet');
        }
    }, [searchParams, router, t]);

    const handleAmountSelect = (value: number) => {
        setAmount(value);
        setCustomAmount("");
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomAmount(val);
        if (val && !isNaN(parseFloat(val))) {
            setAmount(parseFloat(val));
        }
    };

    const handleDeposit = async () => {
        if (!amount || amount < 5) {
            toast.error(t('errors.minAmount', { amount: '€5.00' }));
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch('/api/wallet/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    paymentMethod: 'STRIPE',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create deposit session');
            }

            // Redirect to Stripe Checkout
            if (data.data && data.data.deposit && data.data.deposit.paymentUrl) {
                window.location.href = data.data.deposit.paymentUrl;
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('Deposit error:', error);
            toast.error(t('errors.depositFailed'));
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('addFunds.title')}</DialogTitle>
                    <DialogDescription>
                        {t('addFunds.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {PRESET_AMOUNTS.map((val) => (
                            <Button
                                key={val}
                                variant={amount === val && !customAmount ? "default" : "outline"}
                                className={cn(
                                    "w-full",
                                    amount === val && !customAmount && "border-primary bg-primary text-primary-foreground"
                                )}
                                onClick={() => handleAmountSelect(val)}
                            >
                                €{val}
                            </Button>
                        ))}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="custom-amount">{t('addFunds.customAmount')}</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                            <Input
                                id="custom-amount"
                                type="number"
                                min="5"
                                step="1"
                                placeholder="0.00"
                                className="pl-8"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('addFunds.minAmount', { amount: '€5.00' })}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleDeposit} disabled={isLoading || amount < 5}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('addFunds.confirm', { amount: amount.toFixed(2) })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
