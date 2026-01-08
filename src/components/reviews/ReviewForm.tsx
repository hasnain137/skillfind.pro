'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

type ReviewFormProps = {
    jobId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default function ReviewForm({ jobId, onSuccess, onCancel }: ReviewFormProps) {
    const t = useTranslations('Reviews');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState('');
    const [wouldRecommend, setWouldRecommend] = useState(true);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (rating === 0) {
            toast.error(t('selectRating'));
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    rating,
                    content,
                    wouldRecommend,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.error?.message || data.error || data.message || t('error');
                throw new Error(errorMessage);
            }

            toast.success(t('success'));
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-[#333333]">{t('title')}</h3>
                <p className="text-sm text-[#7C7373]">
                    {t('desc')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <span
                                className={
                                    star <= (hoverRating || rating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-200'
                                }
                            >
                                ★
                            </span>
                        </button>
                    ))}
                </div>
                <div className="text-center text-sm font-medium text-[#2563EB]">
                    {rating > 0 && (
                        <span>
                            {t(`ratings.${rating}` as any)}
                        </span>
                    )}
                </div>

                {/* Feedback */}
                <div>
                    <label className="block text-sm font-medium text-[#333333] mb-1">
                        {t('label')}
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full rounded-xl border border-[#E5E7EB] p-3 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all"
                        placeholder={t('placeholder')}
                    />
                </div>

                {/* Recommendation Toggle */}
                <div className="flex items-center gap-3 bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E7EB]">
                    <input
                        type="checkbox"
                        id="recommend"
                        checked={wouldRecommend}
                        onChange={(e) => setWouldRecommend(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <label htmlFor="recommend" className="text-sm font-medium text-[#333333]">
                        {t('recommend')}
                    </label>
                </div>

                <div className="flex gap-3">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1 bg-white border border-[#E5E7EB] text-[#333333] hover:bg-[#F3F4F6]"
                        >
                            {t('cancel')}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
                    >
                        {loading ? t('submitting') : t('submit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
