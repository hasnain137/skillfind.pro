// src/components/ui/StatusBanner.tsx
'use client';

import { HTMLAttributes } from "react";
import { Card, CardContent } from "./Card";

export type StatusType = "info" | "warning" | "error" | "success" | "pending";

interface StatusBannerProps extends HTMLAttributes<HTMLDivElement> {
    status: StatusType;
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

const STATUS_CONFIG: Record<StatusType, {
    icon: string;
    borderColor: string;
    bgColor: string;
    titleColor: string;
    textColor: string;
}> = {
    info: {
        icon: "ℹ️",
        borderColor: "border-l-primary-500",
        bgColor: "bg-primary-50",
        titleColor: "text-primary-800",
        textColor: "text-primary-700",
    },
    warning: {
        icon: "⚠️",
        borderColor: "border-l-warning",
        bgColor: "bg-warning-light",
        titleColor: "text-warning-dark",
        textColor: "text-amber-700",
    },
    error: {
        icon: "❌",
        borderColor: "border-l-error",
        bgColor: "bg-error-light",
        titleColor: "text-error-dark",
        textColor: "text-red-700",
    },
    success: {
        icon: "✅",
        borderColor: "border-l-success",
        bgColor: "bg-success-light",
        titleColor: "text-success-dark",
        textColor: "text-green-700",
    },
    pending: {
        icon: "⏳",
        borderColor: "border-l-amber-400",
        bgColor: "bg-amber-50",
        titleColor: "text-amber-800",
        textColor: "text-amber-700",
    },
};

export function StatusBanner({
    status,
    title,
    description,
    icon,
    action,
    className = "",
    ...props
}: StatusBannerProps) {
    const config = STATUS_CONFIG[status];

    return (
        <Card
            level={1}
            className={`
        border-l-4 ${config.borderColor} ${config.bgColor}
        animate-fade-in-up
        ${className}
      `.trim().replace(/\s+/g, ' ')}
            {...props}
        >
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="text-2xl shrink-0">
                        {icon || config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-bold ${config.titleColor}`}>
                            {title}
                        </h3>
                        <p className={`mt-1 text-sm ${config.textColor}`}>
                            {description}
                        </p>
                        {action && (
                            <div className="mt-3">
                                {action.href ? (
                                    <a
                                        href={action.href}
                                        className={`
                        inline-flex items-center text-sm font-semibold ${config.titleColor}
                        hover:underline transition-all
                    `}
                                    >
                                        {action.label} →
                                    </a>
                                ) : (
                                    <button
                                        onClick={action.onClick}
                                        className={`
                        inline-flex items-center text-sm font-semibold ${config.titleColor}
                        hover:underline transition-all
                    `}
                                    >
                                        {action.label} →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper function to map professional status to banner props
export function getProfessionalStatusBanner(status: string): {
    status: StatusType;
    title: string;
    description: string;
} | null {
    switch (status) {
        case 'PENDING_REVIEW':
            return {
                status: 'pending',
                title: 'Account Under Review',
                description: "Your profile is currently being reviewed by our team. You can browse and update your profile, but cannot send offers yet.",
            };
        case 'SUSPENDED':
            return {
                status: 'error',
                title: 'Account Suspended',
                description: "Your account has been suspended. Please contact support to resolve this issue.",
            };
        case 'BANNED':
            return {
                status: 'error',
                title: 'Account Banned',
                description: "Your account has been deactivated. Please contact support for more information.",
            };
        case 'INCOMPLETE':
            return {
                status: 'info',
                title: 'Complete Your Profile',
                description: "Please complete your profile details to get verified and start receiving requests.",
            };
        default:
            return null;
    }
}

export default StatusBanner;
