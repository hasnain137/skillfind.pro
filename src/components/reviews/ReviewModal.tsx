'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Modal';
import ReviewForm from './ReviewForm';
import { useTranslations } from 'next-intl';

type ReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    onSuccess?: () => void;
};

export default function ReviewModal({ isOpen, onClose, jobId, onSuccess }: ReviewModalProps) {
    const t = useTranslations('Reviews');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('modalTitle')}</DialogTitle>
                </DialogHeader>
                <ReviewForm
                    jobId={jobId}
                    onSuccess={() => {
                        if (onSuccess) onSuccess();
                        onClose();
                    }}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
