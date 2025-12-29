'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2, Check, X, Edit, Trash, Save, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface ApiKeyConfig {
    key: string;
    maskedValue: string;
    source: 'DB' | 'ENV' | 'MISSING';
    isConfigured: boolean;
}

export default function ApiKeyManagementPage() {
    const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showValue, setShowValue] = useState(false);
    const [savingdx, setSavingIdx] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    async function fetchKeys() {
        try {
            const res = await fetch('/api/admin/system-settings');
            if (res.ok) {
                const { data } = await res.json();
                setKeys(data);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(key: string) {
        if (!editValue.trim()) {
            toast.error('Value cannot be empty');
            return;
        }

        setSavingIdx(key);
        try {
            const res = await fetch('/api/admin/system-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: editValue.trim() })
            });

            if (res.ok) {
                toast.success(`Updated ${key}`);
                setEditingKey(null);
                setEditValue('');
                fetchKeys(); // Reload
            } else {
                toast.error('Failed to update');
            }
        } catch (e) {
            toast.error('Error saving key');
        } finally {
            setSavingIdx(null);
        }
    }

    async function handleDelete(key: string) {
        if (!confirm('Are you sure? This will revert the key to use the Environment Variable value (if present).')) {
            return;
        }

        setSavingIdx(key);
        try {
            const res = await fetch(`/api/admin/system-settings?key=${key}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success(`Reset ${key} to default`);
                fetchKeys();
            } else {
                toast.error('Failed to reset');
            }
        } catch (e) {
            toast.error('Error resetting key');
        } finally {
            setSavingIdx(null);
        }
    }

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="System"
                title="API Key Management"
                description="Manage critical service integrations. Database overrides Environment variables."
            />

            <div className="grid gap-4 max-w-4xl">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    keys.map((config) => (
                        <Card key={config.key} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 truncate" title={config.key}>{config.key}</h3>
                                    {config.source === 'DB' && (
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                                            Database Override
                                        </span>
                                    )}
                                    {config.source === 'ENV' && (
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                                            Env Var
                                        </span>
                                    )}
                                    {config.source === 'MISSING' && (
                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium border border-red-200">
                                            Missing
                                        </span>
                                    )}
                                </div>

                                {editingKey === config.key ? (
                                    <div className="flex gap-2 max-w-md mt-2">
                                        <div className="relative flex-1">
                                            <input
                                                type={showValue ? "text" : "password"}
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                className="w-full text-sm border rounded-md px-2 py-1.5 pr-8 font-mono"
                                                placeholder="sk-..."
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowValue(!showValue)}
                                                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave(config.key)}
                                            disabled={savingdx === config.key}
                                        >
                                            {savingdx === config.key ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => { setEditingKey(null); setEditValue(''); }}
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm font-mono text-gray-500 truncate">
                                        {config.maskedValue || 'Not Configured'}
                                    </p>
                                )}
                            </div>

                            {editingKey !== config.key && (
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingKey(config.key);
                                            setEditValue(''); // Don't allow editing existing value for security, only overwrite
                                            setShowValue(false);
                                        }}
                                    >
                                        <Edit size={14} className="mr-2" />
                                        Edit
                                    </Button>

                                    {config.source === 'DB' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(config.key)}
                                            disabled={savingdx === config.key}
                                        >
                                            {savingdx === config.key ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} className="mr-2" />}
                                            Reset to Default
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-1">Security Note</p>
                <p>Values entered here are stored in the database and override <code>.env</code> file variables. Ensure these keys are restricted to Admin access only.</p>
            </div>
        </div>
    );
}
