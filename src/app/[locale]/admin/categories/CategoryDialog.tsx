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

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category?: {
        id: string;
        nameEn: string;
        icon?: string | null;
        slug: string;
    } | null;
}

export default function CategoryDialog({ isOpen, onClose, category }: CategoryDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setName(category.nameEn);
                setIcon(category.icon || '');
            } else {
                setName('');
                setIcon('');
            }
        }
    }, [isOpen, category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = category ? undefined : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const url = category
                ? `/api/admin/categories/${category.id}`
                : '/api/admin/categories';
            const method = category ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nameEn: name, icon, slug }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save category');
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
                    <DialogTitle>{category ? 'Edit Category' : 'New Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update category details here.' : 'Create a new service category.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name (English)</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Home Improvement"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="icon">Icon (Emoji or Image URL)</Label>
                        <div className="flex gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-slate-50 text-xl overflow-hidden">
                                {icon && (icon.startsWith('http') || icon.startsWith('/')) ? (
                                    <img src={icon} alt="Icon preview" className="h-full w-full object-contain p-1" />
                                ) : (
                                    icon || '❓'
                                )}
                            </div>
                            <Input
                                id="icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="Paste an emoji or image URL"
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
