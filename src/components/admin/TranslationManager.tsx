
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Search, Plus, Filter, Save } from "lucide-react";

interface Translation {
    key: string;
    locale: string;
    value: string;
    namespace: string;
}

interface TranslationManagerProps {
    initialLocales: string[];
}

export default function TranslationManager({ initialLocales = ['en', 'fr'] }: TranslationManagerProps) {
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [filter, setFilter] = useState("all"); // 'all', 'missing'
    const [searchTerm, setSearchTerm] = useState("");
    const [supportedLocales, setSupportedLocales] = useState(initialLocales);
    const [selectedNamespace, setSelectedNamespace] = useState<string>("all");

    // Fetch translations on mount
    useEffect(() => {
        fetchTranslations();
    }, []);

    const handlePublish = async () => {
        try {
            setPublishing(true);
            const res = await fetch("/api/admin/translations/publish", {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to publish");
            const data = await res.json();
            toast.success(data.message || "Translations published successfully!");
        } catch (error) {
            toast.error("Failed to publish translations");
            console.error(error);
        } finally {
            setPublishing(false);
        }
    };

    const fetchTranslations = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/translations");
            if (!res.ok) throw new Error("Failed to search translations");
            const data = await res.json();
            setTranslations(data.translations || []);
            // Extract unique namespaces
        } catch (error) {
            toast.error("Failed to load translations");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Group translations by Key (each key has multiple locales)
    // We need a map of Key -> { en: "...", fr: "...", namespace: "..." }
    const groupedTranslations = translations.reduce((acc, t) => {
        if (!acc[t.key]) {
            acc[t.key] = { key: t.key, namespace: t.namespace, values: {} };
        }
        acc[t.key].values[t.locale] = t.value;
        return acc;
    }, {} as Record<string, { key: string; namespace: string; values: Record<string, string> }>);

    const getFilteredKeys = () => {
        return Object.values(groupedTranslations).filter((item) => {
            // 1. Search Filter
            const matchesSearch = item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                Object.values(item.values).some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!matchesSearch) return false;

            // 2. Namespace Filter
            if (selectedNamespace !== "all" && item.namespace !== selectedNamespace) return false;

            // 3. Status Filter (Missing)
            if (filter === "missing") {
                const missingLocales = supportedLocales.some(locale => !item.values[locale]);
                if (!missingLocales) return false;
            }

            return true;
        });
    };

    const handleSave = async (key: string, locale: string, value: string, namespace: string) => {
        // Optimistic update
        setTranslations(prev => {
            const exists = prev.find(t => t.key === key && t.locale === locale);
            if (exists) {
                return prev.map(t => (t.key === key && t.locale === locale) ? { ...t, value } : t);
            } else {
                return [...prev, { key, locale, value, namespace }];
            }
        });

        try {
            const res = await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, locale, value, namespace }),
            });
            if (!res.ok) throw new Error("Failed to save");
            toast.success("Saved!");
        } catch (error) {
            toast.error("Failed to save translation");
            // Revert? (Not implemented for simplicity, but recommended)
        }
    };

    // AI Functionality Removed


    const uniqueNamespaces = Array.from(new Set(translations.map(t => t.namespace))).sort();

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    const displayKeys = getFilteredKeys();

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search text..."
                        className="pl-9 w-full border rounded-md px-3 py-2 text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        className="border rounded-md px-3 py-2 text-sm"
                        value={selectedNamespace}
                        onChange={e => setSelectedNamespace(e.target.value)}
                    >
                        <option value="all">All Sections</option>
                        {uniqueNamespaces.map(ns => (
                            <option key={ns} value={ns}>{ns}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setFilter(filter === 'all' ? 'missing' : 'all')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm border ${filter === 'missing' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white'}`}
                    >
                        <Filter className="h-4 w-4" />
                        {filter === 'missing' ? 'Showing Missing' : 'Show Missing Only'}
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-black text-white hover:bg-gray-800">
                        <Plus className="h-4 w-4" />
                        Add Language
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {publishing ? 'Publishing...' : 'Publish Changes'}
                    </button>
                </div>
            </div>

            {/* Stats / Progress */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {supportedLocales.map(loc => {
                    const total = Object.keys(groupedTranslations).length;
                    const filled = translations.filter(t => t.locale === loc).length;
                    const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
                    return (
                        <div key={loc} className="bg-white p-4 rounded-lg border">
                            <div className="flex justify-between mb-2">
                                <span className="font-medium uppercase">{loc}</span>
                                <span className="text-sm text-gray-500">{percent}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                        <tr>
                            <th className="px-4 py-3 w-1/4">Key / Context</th>
                            {supportedLocales.map(loc => (
                                <th key={loc} className="px-4 py-3 uppercase">
                                    <div className="flex items-center gap-2">
                                        {loc}
                                        {/* Magic Wand Removed */}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {displayKeys.map(({ key, namespace, values }) => (
                            <tr key={key} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                    <div className="font-semibold text-gray-900 mb-1">{key.split('.').pop()}</div>
                                    <div className="text-xs bg-gray-100 inline-block px-1 rounded">{namespace}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{key}</div>
                                </td>
                                {supportedLocales.map(loc => (
                                    <td key={loc} className="px-4 py-3 relative group align-top">
                                        <textarea
                                            className="w-full bg-transparent border-transparent hover:border-gray-200 focus:border-blue-500 rounded px-2 py-1 text-gray-900 resize-none min-h-[60px]"
                                            defaultValue={values[loc] || ""}
                                            placeholder={`No translation for ${loc}...`}
                                            onBlur={(e) => {
                                                if (e.target.value !== values[loc]) {
                                                    handleSave(key, loc, e.target.value, namespace);
                                                }
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
