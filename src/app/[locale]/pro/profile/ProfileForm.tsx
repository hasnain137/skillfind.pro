'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FormField, FormInput, FormTextarea, FormSelect } from '@/components/ui/FormField';

import { VerificationStatus } from '@/components/professional/verification/VerificationStatus';
import { StripeVerification } from '@/components/professional/verification/StripeVerification';
import { QualificationsTab } from '@/components/profile/QualificationsTab';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { LocationSelector } from '@/components/ui/LocationSelector';

type Category = {
    id: string;
    nameEn: string;
    subcategories: {
        id: string;
        nameEn: string;
    }[];
};

type Service = {
    id: string;
    subcategory: {
        id: string;
        nameEn: string;
        category: {
            nameEn: string;
        };
    };
    priceFrom: number | null;
    priceTo: number | null;
    description: string | null;
};

type Profile = {
    id: string;
    status: 'ACTIVE' | 'PENDING_REVIEW' | 'SUSPENDED';
    title: string | null;
    bio: string | null;
    yearsOfExperience: number | null;
    city: string | null;
    country: string | null;
    isAvailable: boolean;
    remoteAvailability: 'YES_AND_ONSITE' | 'ONLY_REMOTE' | 'NO_REMOTE';
    services: Service[];
    isVerified: boolean;
    verificationMethod: string;
    documents?: any[];
    user?: {
        dateOfBirth: Date | string | null;
        phoneNumber: string | null;
    };
};

type ProfileFormProps = {
    initialProfile: Profile;
    categories: Category[];
    documents: any[];
};

export default function ProfileForm({ initialProfile, categories, documents }: ProfileFormProps) {
    const t = useTranslations('ProProfile');
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('activeTab') === 'verification' ? 'verification'
        : searchParams.get('activeTab') === 'qualifications' ? 'qualifications'
            : 'info';

    const [activeTab, setActiveTab] = useState<'info' | 'services' | 'qualifications' | 'verification'>(initialTab);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Field validation
    const getFieldError = (name: string, value: string): string => {
        switch (name) {
            case 'title':
                if (!value) return 'Professional title is required';
                if (value.length < 5) return 'Title must be at least 5 characters';
                return '';
            case 'bio':
                if (!value) return 'Bio is required';
                if (value.length < 10) return 'Bio must be at least 10 characters';
                return '';
            case 'city':
                if (!value) return 'City is required';
                return '';
            default:
                return '';
        }
    };

    const handleBlur = (name: string, value: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // Profile State
    const [profileData, setProfileData] = useState({
        title: initialProfile.title || '',
        bio: initialProfile.bio || '',
        yearsOfExperience: initialProfile.yearsOfExperience || 0,
        city: initialProfile.city || '',
        country: initialProfile.country || 'FR',
        isAvailable: initialProfile.isAvailable,
        remoteAvailability: initialProfile.remoteAvailability || 'YES_AND_ONSITE',
    });

    // Get errors based on touched state
    const titleError = touched.title ? getFieldError('title', profileData.title) : '';
    const bioError = touched.bio ? getFieldError('bio', profileData.bio) : '';
    const cityError = touched.city ? getFieldError('city', profileData.city) : '';

    // Personal Information State (User table fields)
    const [personalData, setPersonalData] = useState({
        dateOfBirth: initialProfile.user?.dateOfBirth
            ? (typeof initialProfile.user.dateOfBirth === 'string'
                ? initialProfile.user.dateOfBirth.split('T')[0]
                : new Date(initialProfile.user.dateOfBirth).toISOString().split('T')[0])
            : '',
        phoneNumber: initialProfile.user?.phoneNumber || '',
    });

    // Service State
    const [isAddingService, setIsAddingService] = useState(false);
    const [newService, setNewService] = useState({
        categoryId: '',
        subcategoryId: '',
        priceFrom: '',
        description: '',
    });

    async function handleProfileUpdate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update professional profile
            const profileResponse = await fetch('/api/professionals/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            if (!profileResponse.ok) throw new Error(t('error'));

            // Update personal information (user table fields)
            const userResponse = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personalData),
            });

            if (!userResponse.ok) throw new Error(t('error'));

            setSuccess(t('success'));
            router.refresh();
        } catch (err) {
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    }

    async function handleAddService(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/professionals/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subcategoryId: newService.subcategoryId,
                    priceFrom: parseFloat(newService.priceFrom),
                    description: newService.description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle structured validation errors
                if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
                    const validationMessages = data.error.details
                        .map((d: any) => d.message)
                        .join('. ');
                    throw new Error(validationMessages);
                }

                // Handle generic API errors
                throw new Error(data.message || data.error?.message || t('serviceError'));
            }

            setSuccess(t('serviceAdded'));
            setIsAddingService(false);
            setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
            router.refresh();
        } catch (err: any) {
            setError(err.message || t('serviceError'));
        } finally {
            setLoading(false);
        }
    }

    // Edit Service State
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

    async function handleUpdateService(e: React.FormEvent) {
        e.preventDefault();
        if (!editingServiceId) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/professionals/services/${editingServiceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceFrom: parseFloat(newService.priceFrom),
                    description: newService.description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
                    const validationMessages = data.error.details
                        .map((d: any) => d.message)
                        .join('. ');
                    throw new Error(validationMessages);
                }
                throw new Error(data.message || data.error?.message || t('error'));
            }

            setSuccess(t('serviceUpdated'));
            setIsAddingService(false);
            setEditingServiceId(null);
            setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
            router.refresh();
        } catch (err: any) {
            setError(err.message || t('error'));
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteService(serviceId: string) {
        if (!confirm(t('services.confirmDelete'))) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/professionals/services/${serviceId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error(t('deleteError'));

            setSuccess(t('serviceDeleted'));
            router.refresh();
        } catch (err) {
            setError(t('deleteError'));
        } finally {
            setLoading(false);
        }
    }

    const startEditing = (service: Service) => {
        setEditingServiceId(service.id);
        setNewService({
            categoryId: service.subcategory.category.nameEn,
            subcategoryId: service.subcategory.id,
            priceFrom: service.priceFrom?.toString() || '',
            description: service.description || '',
        });
        setIsAddingService(true);
    };

    const cancelEdit = () => {
        setIsAddingService(false);
        setEditingServiceId(null);
        setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
    };

    const selectedCategory = categories.find(c => c.id === newService.categoryId);

    const handleUploadSuccess = () => {
        router.refresh();
        setSuccess('Document uploaded successfully');
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-[#E5E7EB]">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#7C7373] hover:text-[#333333]'
                        }`}
                >
                    {t('tabs.info')}
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'services'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#7C7373] hover:text-[#333333]'
                        }`}
                >
                    {t('tabs.services')}
                </button>
                <button
                    onClick={() => setActiveTab('qualifications')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'qualifications'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#7C7373] hover:text-[#333333]'
                        }`}
                >
                    {t('tabs.qualifications')}
                </button>
                <button
                    onClick={() => setActiveTab('verification')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'verification'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#7C7373] hover:text-[#333333]'
                        }`}
                >
                    {t('tabs.verification')}
                    {initialProfile.isVerified && <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-200">✓</Badge>}
                </button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            {success && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>
            )}

            {activeTab === 'info' && (
                <form onSubmit={handleProfileUpdate}>
                    <Card padding="lg" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField label={t('info.titleLabel')} required error={titleError}>
                                <FormInput
                                    type="text"
                                    value={profileData.title}
                                    hasError={!!titleError}
                                    onChange={e => setProfileData({ ...profileData, title: e.target.value })}
                                    onBlur={() => handleBlur('title', profileData.title)}
                                    placeholder={t('info.titlePlaceholder')}
                                />
                            </FormField>
                            <FormField label={t('info.yearsLabel')}>
                                <FormInput
                                    type="number"
                                    value={profileData.yearsOfExperience}
                                    onChange={e => setProfileData({ ...profileData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                />
                            </FormField>
                        </div>

                        <FormField label={t('info.bioLabel')} required error={bioError}>
                            <FormTextarea
                                rows={4}
                                value={profileData.bio}
                                hasError={!!bioError}
                                onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                onBlur={() => handleBlur('bio', profileData.bio)}
                                placeholder={t('info.bioPlaceholder')}
                            />
                        </FormField>

                        {/* Personal Information Section */}
                        <div className="border-t border-[#E5E7EB] pt-6 mt-6">
                            <h4 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                                <span>👤</span> {t('info.personal')}
                            </h4>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="dob" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                                        {/* Using static fallback until translation keys are fully synced if needed */}
                                        Date of Birth
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
                                        Phone Number
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
                                        International format: +[country code][number]
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location & Availability Section */}
                        <div className="border-t border-[#E5E7EB] pt-6 mt-6">
                            <h4 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                                <span>📍</span> {t('info.location')}
                            </h4>

                            <div className="mt-4">
                                <LocationSelector
                                    countryCode={profileData.country || ''}
                                    cityName={profileData.city || ''}
                                    onCountryChange={(code) => setProfileData(prev => ({ ...prev, country: code }))}
                                    onCityChange={(city) => setProfileData(prev => ({ ...prev, city: city }))}
                                    countryError={!!cityError && !profileData.country ? 'Country is required' : undefined}
                                    cityError={cityError}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-[#333333]">
                                        <input
                                            type="checkbox"
                                            checked={profileData.isAvailable}
                                            onChange={e => setProfileData({ ...profileData, isAvailable: e.target.checked })}
                                            className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                                        />
                                        {t('info.isAvailable')}
                                    </label>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('info.remoteLabel')}</label>
                                    <select
                                        value={profileData.remoteAvailability}
                                        onChange={e => setProfileData({ ...profileData, remoteAvailability: e.target.value as 'YES_AND_ONSITE' | 'ONLY_REMOTE' | 'NO_REMOTE' })}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                    >
                                        <option value="YES_AND_ONSITE">{t('info.remoteOptions.YES_AND_ONSITE')}</option>
                                        <option value="ONLY_REMOTE">{t('info.remoteOptions.ONLY_REMOTE')}</option>
                                        <option value="NO_REMOTE">{t('info.remoteOptions.NO_REMOTE')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </form>
            )}

            {activeTab === 'services' && (
                <div className="space-y-4">
                    {!isAddingService ? (
                        <Button onClick={() => {
                            setEditingServiceId(null);
                            setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
                            setIsAddingService(true);
                        }}>{t('services.add')}</Button>
                    ) : (
                        <Card padding="lg" className="space-y-4 border-[#2563EB]">
                            <h3 className="font-semibold text-[#333333]">
                                {editingServiceId ? t('services.edit') : t('services.add')}
                            </h3>
                            <form onSubmit={editingServiceId ? handleUpdateService : handleAddService} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('services.fields.category')}</label>
                                        <select
                                            value={newService.categoryId}
                                            onChange={e => setNewService({ ...newService, categoryId: e.target.value, subcategoryId: '' })}
                                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                                            required
                                            disabled={!!editingServiceId}
                                        >
                                            <option value="">{t('services.fields.selectCategory')}</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.nameEn}</option>
                                            ))}
                                            {editingServiceId && !categories.find(c => c.id === newService.categoryId) && (
                                                <option value={newService.categoryId}>{newService.categoryId}</option>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('services.fields.subcategory')}</label>
                                        <select
                                            value={newService.subcategoryId}
                                            onChange={e => setNewService({ ...newService, subcategoryId: e.target.value })}
                                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                                            disabled={!newService.categoryId || !!editingServiceId}
                                            required
                                        >
                                            <option value="">{t('services.fields.selectSubcategory')}</option>
                                            {selectedCategory?.subcategories.map(s => (
                                                <option key={s.id} value={s.id}>{s.nameEn}</option>
                                            ))}
                                            {editingServiceId && !selectedCategory?.subcategories.find(s => s.id === newService.subcategoryId) && (
                                                <option value={newService.subcategoryId}>Current Subcategory</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('services.fields.price')}</label>
                                    <input
                                        type="number"
                                        value={newService.priceFrom}
                                        onChange={e => setNewService({ ...newService, priceFrom: e.target.value })}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                        placeholder="e.g. 50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">{t('services.fields.description')}</label>
                                    <textarea
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                        placeholder="Describe what you offer..."
                                        rows={3}
                                    />
                                    <p className="mt-1 text-xs text-[#B0B0B0]">{t('services.fields.descriptionHint')}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={loading}>
                                        {editingServiceId ? t('services.update') : t('services.add')}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={cancelEdit}>{t('services.fields.cancel') || 'Cancel'}</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {initialProfile.services.map(service => (
                            <Card key={service.id} padding="lg" className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-[#333333]">{service.subcategory.nameEn}</h4>
                                    <p className="text-xs text-[#7C7373]">{service.subcategory.category.nameEn}</p>
                                    <p className="mt-2 text-sm text-[#4B5563]">{service.description}</p>
                                    <p className="mt-1 text-sm font-medium text-[#2563EB]">
                                        {t('services.startsFrom', { price: service.priceFrom ?? 0 })}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => startEditing(service)}
                                        className="text-xs px-2 py-1 h-auto"
                                    >
                                        ✏️ {t('services.edit')}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDeleteService(service.id)}
                                        className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        🗑️ {t('services.delete')}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {initialProfile.services.length === 0 && (
                            <p className="text-center text-sm text-[#7C7373] py-8">
                                {t('services.empty')}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'qualifications' && (
                <QualificationsTab
                    professionalId={initialProfile.id}
                    documents={documents}
                />
            )}

            {activeTab === 'verification' && (
                <div className="space-y-6">
                    <VerificationStatus
                        status={initialProfile.status || 'PENDING_REVIEW'}
                        isVerified={initialProfile.isVerified}
                    />

                    {/* Stripe Identity Verification Section */}
                    <StripeVerification
                        isVerified={initialProfile.isVerified}
                        verificationMethod={initialProfile.verificationMethod}
                    />


                </div>
            )}
        </div>
    );
}
