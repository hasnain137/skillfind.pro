'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CreateCategoryButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleCreate() {
        const name = prompt('Enter category name (English):');
        if (!name) return;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const icon = prompt('Enter emoji icon:', '📁');

        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nameEn: name, slug, icon }),
            });

            if (!res.ok) throw new Error('Failed to create category');
            router.refresh();
        } catch (error) {
            alert('Error creating category');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : '+ New Category'}
        </Button>
    );
}
