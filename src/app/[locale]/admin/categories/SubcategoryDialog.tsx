'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Modal';

interface SubcategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
    subcategory?: {
        id: string;
        nameEn: string;
    } | null;
}

export default function SubcategoryDialog({ isOpen, onClose, categoryId, subcategory }: SubcategoryDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (subcategory) {
                setName(subcategory.nameEn);
            } else {
                setName('');
            }
        }
    }, [isOpen, subcategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = subcategory ? undefined : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const url = subcategory
                ? `/api/admin/subcategories/${subcategory.id}`
                : '/api/admin/subcategories';
            const method = subcategory ? 'PUT' : 'POST';

            const payload = {
                nameEn: name,
                categoryId: categoryId,
                ...(slug && { slug }),
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save subcategory');
            }

            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{subcategory ? 'Edit Subcategory' : 'New Subcategory'}</DialogTitle>
                    <DialogDescription>
                        {subcategory ? 'Update subcategory details.' : 'Add a new subcategory to this group.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="sub-name">Name (English)</Label>
                        <Input
                            id="sub-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Roof Repair"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Subcategory'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
