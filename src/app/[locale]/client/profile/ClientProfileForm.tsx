'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormField, FormInput, FormSelect } from '@/components/ui/FormField';
import { useTranslations } from 'next-intl';

type ClientProfile = {
    id: string;
    city: string | null;
    region: string | null;
    country: string;
    preferredLanguage: string;
    user?: {
        dateOfBirth: Date | string | null;
        phoneNumber: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    };
};

type ClientProfileFormProps = {
    initialClient: ClientProfile;
};

export default function ClientProfileForm({ initialClient }: ClientProfileFormProps) {
    const t = useTranslations('ClientProfile');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Personal Information State (User table fields)
    const [personalData, setPersonalData] = useState({
        firstName: initialClient.user?.firstName || '',
        lastName: initialClient.user?.lastName || '',
        dateOfBirth: initialClient.user?.dateOfBirth
            ? (typeof initialClient.user.dateOfBirth === 'string'
                ? initialClient.user.dateOfBirth.split('T')[0]
                : new Date(initialClient.user.dateOfBirth).toISOString().split('T')[0])
            : '',
        phoneNumber: initialClient.user?.phoneNumber || '',
    });

    // Client-specific State
    const [clientData, setClientData] = useState({
        city: initialClient.city || '',
        region: initialClient.region || '',
        country: initialClient.country || 'FR',
        preferredLanguage: initialClient.preferredLanguage || 'en',
    });

    async function handleProfileUpdate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update client profile (location & preferences)
            const clientResponse = await fetch('/api/client/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData),
            });

            if (!clientResponse.ok) throw new Error('Failed to update client profile');

            // Update personal information (user table fields)
            const userResponse = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: personalData.firstName,
                    lastName: personalData.lastName,
                    dateOfBirth: personalData.dateOfBirth,
                    phoneNumber: personalData.phoneNumber,
                }),
            });

            if (!userResponse.ok) throw new Error(t('updateError'));

            setSuccess(t('success'));
            router.refresh();
        } catch (err) {
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
            {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                    {success}
                </div>
            )}

            {/* Basic Information Section */}
            <div>
                <h3 className="text-base font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <span>👤</span> {t('sections.basic')}
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField label={t('fields.firstName')}>
                        <FormInput
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={personalData.firstName}
                            onChange={e => setPersonalData({ ...personalData, firstName: e.target.value })}
                        />
                    </FormField>
                    <FormField label={t('fields.lastName')}>
                        <FormInput
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={personalData.lastName}
                            onChange={e => setPersonalData({ ...personalData, lastName: e.target.value })}
                        />
                    </FormField>
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            {t('fields.email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={initialClient.user?.email || ''}
                            disabled
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-[#B0B0B0]">
                            {t('fields.emailHint')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="border-t border-[#E5E7EB] pt-6">
                <h4 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <span>📋</span> {t('sections.personal')}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="dob" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            {t('fields.dob')}
                        </label>
                        <input
                            id="dob"
                            type="date"
                            value={personalData.dateOfBirth}
                            onChange={e => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            {t('fields.phone')}
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="+33612345678"
                            value={personalData.phoneNumber}
                            onChange={e => setPersonalData({ ...personalData, phoneNumber: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-[#B0B0B0]">
                            {t('fields.phoneHint')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Location Section */}
            <div className="border-t border-[#E5E7EB] pt-6">
                <h4 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <span>📍</span> {t('sections.location')}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('fields.city')}</label>
                        <input
                            type="text"
                            placeholder="Paris"
                            value={clientData.city}
                            onChange={e => setClientData({ ...clientData, city: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('fields.region')}</label>
                        <input
                            type="text"
                            placeholder="Île-de-France"
                            value={clientData.region}
                            onChange={e => setClientData({ ...clientData, region: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('fields.country')}</label>
                        <select
                            value={clientData.country}
                            onChange={e => setClientData({ ...clientData, country: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        >
                            <option value="FR">France</option>
                            <option value="DE">Germany</option>
                            <option value="ES">Spain</option>
                            <option value="IT">Italy</option>
                            <option value="GB">United Kingdom</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Preferences Section */}
            <div className="border-t border-[#E5E7EB] pt-6">
                <h4 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                    <span>⚙️</span> {t('sections.preferences')}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                            {t('fields.language')}
                        </label>
                        <select
                            value={clientData.preferredLanguage}
                            onChange={e => setClientData({ ...clientData, preferredLanguage: e.target.value })}
                            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        >
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="es">Español</option>
                        </select>
                        <p className="mt-1 text-xs text-[#B0B0B0]">
                            {t('fields.languageHint')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/client')}
                    disabled={loading}
                >
                    {t('actions.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? t('actions.saving') : t('actions.save')}
                </Button>
            </div>
        </form>
    );
}
