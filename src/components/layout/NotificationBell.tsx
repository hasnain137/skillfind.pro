'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale || 'en';
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=10');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data?.notifications || []);
                setUnreadCount(data.data?.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark single notification as read
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
        setIsOpen(false);
    };

    // Get icon color based on notification type
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'NEW_OFFER':
            case 'OFFER_ACCEPTED':
                return 'bg-green-100 text-green-600';
            case 'OFFER_REJECTED':
                return 'bg-red-100 text-red-600';
            case 'JOB_STARTED':
            case 'JOB_COMPLETED':
                return 'bg-blue-100 text-blue-600';
            case 'NEW_REVIEW':
            case 'REVIEW_RESPONSE':
                return 'bg-yellow-100 text-yellow-600';
            case 'LOW_BALANCE':
                return 'bg-orange-100 text-orange-600';
            case 'MATCHING_REQUEST':
                return 'bg-purple-100 text-purple-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5 text-[#7C7373]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[#E5E7EB] bg-white shadow-lg z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
                        <h3 className="font-semibold text-[#333333]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-[#7C7373]">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-[#E5E7EB] last:border-b-0 ${!notification.isRead ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    {/* Type indicator */}
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                                        <Bell className="h-4 w-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-[#333333] truncate`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-[#7C7373] line-clamp-2 mt-0.5">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-[#B0B0B0] mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-[#E5E7EB] px-4 py-2">
                            <button
                                onClick={() => {
                                    router.push(`/${locale}/notifications`);
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-xs text-blue-600 hover:text-blue-700 py-1"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
