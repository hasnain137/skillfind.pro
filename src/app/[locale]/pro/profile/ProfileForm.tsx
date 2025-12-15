'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    title: string | null;
    bio: string | null;
    yearsOfExperience: number | null;
    city: string | null;
    country: string | null;
    isAvailable: boolean;
    remoteAvailability: 'YES_AND_ONSITE' | 'ONLY_REMOTE' | 'NO_REMOTE';
    services: Service[];
    user?: {
        dateOfBirth: Date | string | null;
        phoneNumber: string | null;
    };
};

type ProfileFormProps = {
    initialProfile: Profile;
    categories: Category[];
};

export default function ProfileForm({ initialProfile, categories }: ProfileFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info' | 'services'>('info');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

            if (!profileResponse.ok) throw new Error('Failed to update profile');

            // Update personal information (user table fields)
            const userResponse = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personalData),
            });

            if (!userResponse.ok) throw new Error('Failed to update personal information');

            setSuccess('Profile updated successfully');
            router.refresh();
        } catch (err) {
            setError('Failed to update profile');
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
                throw new Error(data.message || data.error?.message || 'Failed to add service');
            }

            setSuccess('Service added successfully');
            setIsAddingService(false);
            setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to add service');
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
                throw new Error(data.message || data.error?.message || 'Failed to update service');
            }

            setSuccess('Service updated successfully');
            setIsAddingService(false);
            setEditingServiceId(null);
            setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to update service');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteService(serviceId: string) {
        if (!confirm('Are you sure you want to delete this service?')) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/professionals/services/${serviceId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete service');

            setSuccess('Service deleted successfully');
            router.refresh();
        } catch (err) {
            setError('Failed to delete service');
        } finally {
            setLoading(false);
        }
    }

    const startEditing = (service: Service) => {
        setEditingServiceId(service.id);
        setNewService({
            categoryId: service.subcategory.category.nameEn, // Note: This is just for display/logic, strict ID might be needed if we allowed changing category
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
                    Profile Info
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'services'
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#7C7373] hover:text-[#333333]'
                        }`}
                >
                    Services ({initialProfile.services.length})
                </button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            {success && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>
            )}

            {activeTab === 'info' ? (
                <form onSubmit={handleProfileUpdate}>
                    <Card padding="lg" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Professional Title</label>
                                <input
                                    type="text"
                                    value={profileData.title}
                                    onChange={e => setProfileData({ ...profileData, title: e.target.value })}
                                    className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                    placeholder="e.g. Senior Math Tutor"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Years of Experience</label>
                                <input
                                    type="number"
                                    value={profileData.yearsOfExperience}
                                    onChange={e => setProfileData({ ...profileData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                    className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Bio</label>
                            <textarea
                                rows={4}
                                value={profileData.bio}
                                onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                placeholder="Describe your expertise..."
                            />
                        </div>

                        {/* Personal Information Section */}
                        <div className="border-t border-[#E5E7EB] pt-6 mt-6">
                            <h4 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                                <span>👤</span> Personal Information
                            </h4>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="dob" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
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
                                <span>📍</span> Location & Availability
                            </h4>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">City</label>
                                    <input
                                        type="text"
                                        placeholder="Paris"
                                        value={profileData.city}
                                        onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Country</label>
                                    <select
                                        value={profileData.country}
                                        onChange={e => setProfileData({ ...profileData, country: e.target.value })}
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

                            <div className="grid gap-4 md:grid-cols-2 mt-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-[#333333]">
                                        <input
                                            type="checkbox"
                                            checked={profileData.isAvailable}
                                            onChange={e => setProfileData({ ...profileData, isAvailable: e.target.checked })}
                                            className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                                        />
                                        Available for work
                                    </label>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Remote Work</label>
                                    <select
                                        value={profileData.remoteAvailability}
                                        onChange={e => setProfileData({ ...profileData, remoteAvailability: e.target.value as 'YES_AND_ONSITE' | 'ONLY_REMOTE' | 'NO_REMOTE' })}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                    >
                                        <option value="YES_AND_ONSITE">Remote and on-site</option>
                                        <option value="ONLY_REMOTE">Remote only</option>
                                        <option value="NO_REMOTE">On-site only</option>
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
            ) : (
                <div className="space-y-4">
                    {!isAddingService ? (
                        <Button onClick={() => {
                            setEditingServiceId(null);
                            setNewService({ categoryId: '', subcategoryId: '', priceFrom: '', description: '' });
                            setIsAddingService(true);
                        }}>Add New Service</Button>
                    ) : (
                        <Card padding="lg" className="space-y-4 border-[#2563EB]">
                            <h3 className="font-semibold text-[#333333]">
                                {editingServiceId ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <form onSubmit={editingServiceId ? handleUpdateService : handleAddService} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Category</label>
                                        <select
                                            value={newService.categoryId}
                                            onChange={e => setNewService({ ...newService, categoryId: e.target.value, subcategoryId: '' })}
                                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                                            required
                                            disabled={!!editingServiceId} // Cannot change category when editing
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.nameEn}</option>
                                            ))}
                                            {/* Fallback for editing if category not in list (edge case) */}
                                            {editingServiceId && !categories.find(c => c.id === newService.categoryId) && (
                                                <option value={newService.categoryId}>{newService.categoryId}</option>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Subcategory</label>
                                        <select
                                            value={newService.subcategoryId}
                                            onChange={e => setNewService({ ...newService, subcategoryId: e.target.value })}
                                            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                                            disabled={!newService.categoryId || !!editingServiceId} // Cannot change subcategory when editing
                                            required
                                        >
                                            <option value="">Select Subcategory</option>
                                            {selectedCategory?.subcategories.map(s => (
                                                <option key={s.id} value={s.id}>{s.nameEn}</option>
                                            ))}
                                            {/* Fallback for editing */}
                                            {editingServiceId && !selectedCategory?.subcategories.find(s => s.id === newService.subcategoryId) && (
                                                <option value={newService.subcategoryId}>Current Subcategory</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Starting Price (€)</label>
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
                                    <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">Description</label>
                                    <textarea
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                        className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                                        placeholder="Describe what you offer..."
                                        rows={3}
                                    />
                                    <p className="mt-1 text-xs text-[#B0B0B0]">min 50 characters</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={loading}>
                                        {editingServiceId ? 'Update Service' : 'Add Service'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>
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
                                        Starts from €{service.priceFrom}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => startEditing(service)}
                                        className="text-xs px-2 py-1 h-auto"
                                    >
                                        ✏️ Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDeleteService(service.id)}
                                        className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        🗑️ Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {initialProfile.services.length === 0 && (
                            <p className="text-center text-sm text-[#7C7373] py-8">
                                No services added yet. Add a service to start receiving requests.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
