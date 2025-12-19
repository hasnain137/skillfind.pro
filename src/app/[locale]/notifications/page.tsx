'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import {
    Bell,
    CheckCircle2,
    Clock,
    MessageSquare,
    Briefcase,
    AlertCircle,
    Check,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
    metadata?: any;
}

export default function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Notifications');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const [stats, setStats] = useState({ total: 0, unread: 0 });
    const [page, setPage] = useState(0);
    const LIMIT = 20;

    const dateLocale = locale === 'fr' ? fr : enUS;

    const fetchNotifications = async (offset = 0) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notifications?limit=${LIMIT}&offset=${offset}`);
            const data = await response.json();

            if (data.success) {
                if (offset === 0) {
                    setNotifications(data.notifications);
                } else {
                    setNotifications(prev => [...prev, ...data.notifications]);
                }
                setStats({
                    total: data.totalCount,
                    unread: data.unreadCount
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST'
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            setMarkingAll(true);
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST'
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setStats(prev => ({ ...prev, unread: 0 }));
                toast.success(t('markAllAsRead'));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        } finally {
            setMarkingAll(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'OFFER_RECEIVED':
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'JOB_STARTED':
                return <Briefcase className="w-5 h-5 text-green-500" />;
            case 'JOB_COMPLETED':
                return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
            case 'SYSTEM':
                return <Bell className="w-5 h-5 text-gray-500" />;
            default:
                return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    const groupNotifications = () => {
        const today: Notification[] = [];
        const yesterday: Notification[] = [];
        const earlier: Notification[] = [];

        const now = new Date();
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(now.getDate() - 1);

        // Safety check: ensure notifications is an array
        if (!notifications || !Array.isArray(notifications)) {
            return { today, yesterday, earlier };
        }

        notifications.forEach(n => {
            const date = new Date(n.createdAt);
            if (date.toDateString() === now.toDateString()) {
                today.push(n);
            } else if (date.toDateString() === yesterdayDate.toDateString()) {
                yesterday.push(n);
            } else {
                earlier.push(n);
            }
        });

        return { today, yesterday, earlier };
    };

    const { today, yesterday, earlier } = groupNotifications();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <SectionHeading
                    eyebrow={t('eyebrow')}
                    title={t('title')}
                    description={t('description')}
                />

                {stats.unread > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllRead}
                        disabled={markingAll}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {t('markAllAsRead')}
                    </Button>
                )}
            </div>

            {loading && (!notifications || notifications.length === 0) ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (!notifications || notifications.length === 0) ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center bg-gray-50/50 border-dashed">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('empty.title')}</h3>
                    <p className="text-gray-500 max-w-sm">{t('empty.desc')}</p>
                </Card>
            ) : (
                <div className="space-y-8">
                    {today.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1">
                                {t('today')}
                            </h3>
                            <div className="space-y-3">
                                {today.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={markAsRead}
                                        dateLocale={dateLocale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {yesterday.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1">
                                {t('yesterday')}
                            </h3>
                            <div className="space-y-3">
                                {yesterday.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={markAsRead}
                                        dateLocale={dateLocale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {earlier.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1">
                                {t('earlier')}
                            </h3>
                            <div className="space-y-3">
                                {earlier.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={markAsRead}
                                        dateLocale={dateLocale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {stats.total > (notifications?.length || 0) && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    const nextOffset = notifications?.length || 0;
                                    fetchNotifications(nextOffset);
                                }}
                                isLoading={loading}
                            >
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationItem({
    notification,
    onRead,
    dateLocale
}: {
    notification: Notification,
    onRead: (id: string) => void,
    dateLocale: any
}) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'OFFER_RECEIVED':
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'JOB_STARTED':
                return <Briefcase className="w-5 h-5 text-emerald-500" />;
            case 'JOB_COMPLETED':
                return <CheckCircle2 className="w-5 h-5 text-indigo-500" />;
            case 'REVIEW_RECEIVED':
                return <CheckCircle2 className="w-5 h-5 text-amber-500" />;
            default:
                return <Bell className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <Card
            className={`p-4 transition-all duration-200 border-l-4 ${notification.isRead
                ? 'border-transparent opacity-75'
                : 'border-blue-500 shadow-md bg-white'
                } hover:shadow-lg`}
        >
            <div className="flex gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-blue-50'
                    }`}>
                    {getIcon(notification.type)}
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-semibold text-gray-900 truncate ${!notification.isRead ? 'text-blue-900' : ''
                            }`}>
                            {notification.title}
                        </h4>
                        {!notification.isRead && (
                            <button
                                onClick={() => onRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                        {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: dateLocale
                            })}
                        </span>
                        {notification.link && (
                            <a
                                href={notification.link}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                View details →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
