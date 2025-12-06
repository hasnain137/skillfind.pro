'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Modal';
import ReviewForm from './ReviewForm';

type ReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    onSuccess?: () => void;
};

export default function ReviewModal({ isOpen, onClose, jobId, onSuccess }: ReviewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
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
