// src/app/client/requests/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CollapsibleTips } from "@/components/ui/CollapsibleTips";
import { useTranslations } from 'next-intl';

export default function NewClientRequestPage() {
  const t = useTranslations('RequestForm');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Array<{
    id: string;
    nameEn: string;
    subcategories: Array<{ id: string; nameEn: string }>;
  }>>([]);

  const [formData, setFormData] = useState({
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    location: '',
    preferredFormat: 'ONLINE_OR_OFFLINE',
    timing: '',
    budgetMin: '',
    budgetMax: '',
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Get subcategories for selected category
  const activeSubcategories = categories.find(c => c.id === formData.categoryId)?.subcategories || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Map form data to API schema
      const requestData: any = {
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        title: formData.title,
        description: formData.description,
        locationType: formData.preferredFormat === 'ONLINE' ? 'REMOTE' : 'ON_SITE',
        city: formData.location,
        country: 'FR', // Default country
        urgency: formData.timing === 'URGENT' ? 'URGENT' : formData.timing === 'SOON' ? 'SOON' : 'FLEXIBLE',
      };

      // Only include budget fields if they have values
      if (formData.budgetMin) {
        requestData.budgetMin = parseInt(formData.budgetMin);
      }
      if (formData.budgetMax) {
        requestData.budgetMax = parseInt(formData.budgetMax);
      }

      console.log('Submitting request data:', requestData);

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Show toast and redirect
        toast.success(t('success.title'), {
          description: t('success.desc'),
        });
        router.push('/client/requests');
      } else {
        // Handle structured validation errors
        let errorMessage = data.message || data.error?.message || t('error.title');

        if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
          errorMessage = data.error.details
            .map((d: any) => d.message)
            .join('. ');
        }

        setError(errorMessage);
        toast.error(t('error.title'), {
          description: errorMessage,
        });
        console.error('API Error:', data);
      }
    } catch (err) {
      setError(t('error.generic'));
      toast.error(t('error.generic'), {
        description: 'Please try again.',
      });
      console.error('Error creating request:', err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      {/* Tips Card */}
      <CollapsibleTips
        title={t('tips.title')}
        tips={[
          { title: t('tips.specific.title'), description: t('tips.specific.desc') },
          { title: t('tips.budget.title'), description: t('tips.budget.desc') },
          { title: t('tips.timeline.title'), description: t('tips.timeline.desc') },
          { title: t('tips.context.title'), description: t('tips.context.desc') },
        ]}
      />

      {error && (
        <Card level={1} padding="lg" className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.basics.title')}
            description={t('sections.basics.desc')}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                {t('fields.category')} *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({
                  ...formData,
                  categoryId: e.target.value,
                  subcategoryId: '' // Reset subcategory when category changes
                })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              >
                <option value="">{t('fields.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                {t('fields.subcategory')} *
              </label>
              <select
                required
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                disabled={!formData.categoryId}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{t('fields.selectSubcategory')}</option>
                {activeSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                {t('fields.title')} *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder={t('fields.titlePlaceholder')}
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.details.title')}
            description={t('sections.details.desc')}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              {t('fields.description')} *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder={t('fields.descriptionPlaceholder')}
            />
            <p className="mt-1 text-[11px] text-[#7C7373]">
              {t('fields.noContactInfo')}
            </p>
          </div>
        </Card>

        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.location.title')}
            description={t('sections.location.desc')}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                {t('fields.location')} *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder={t('fields.locationPlaceholder')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                {t('fields.format')}
              </label>
              <select
                value={formData.preferredFormat}
                onChange={(e) => setFormData({ ...formData, preferredFormat: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              >
                <option value="ONLINE_OR_OFFLINE">
                  {t('fields.formats.ONLINE_OR_OFFLINE')}
                </option>
                <option value="ONLINE_ONLY">{t('fields.formats.ONLINE_ONLY')}</option>
                <option value="IN_PERSON_ONLY">{t('fields.formats.IN_PERSON_ONLY')}</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.timing.title')}
            description={t('sections.timing.desc')}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'URGENT', label: t('fields.timings.URGENT'), desc: t('fields.timings.URGENT_DESC') },
              { value: 'SOON', label: t('fields.timings.SOON'), desc: t('fields.timings.SOON_DESC') },
              { value: 'FLEXIBLE', label: t('fields.timings.FLEXIBLE'), desc: t('fields.timings.FLEXIBLE_DESC') },
              { value: 'SCHEDULED', label: t('fields.timings.SCHEDULED'), desc: t('fields.timings.SCHEDULED_DESC') },
            ].map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all
                  ${formData.timing === option.value
                    ? 'border-[#2563EB] bg-[#EEF2FF] shadow-sm'
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                  }
                `}
              >
                <input
                  type="radio"
                  name="timing"
                  value={option.value}
                  checked={formData.timing === option.value}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  className="mt-0.5 h-4 w-4 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#333333]">{option.label}</p>
                  <p className="text-xs text-[#7C7373]">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.budget.title')}
            description={t('sections.budget.desc')}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              step="0.01"
              value={formData.budgetMin}
              onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder={t('fields.budgetMin')}
            />
            <input
              type="number"
              step="0.01"
              value={formData.budgetMax}
              onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder={t('fields.budgetMax')}
            />
          </div>
          <p className="text-[11px] text-[#7C7373]">
            {t('fields.budgetHint')}
          </p>
        </Card>

        <Card level={1} className="text-center border-dashed" padding="lg">
          <Button className="w-full sm:w-auto" type="submit" disabled={loading}>
            {loading ? t('actions.publishing') : t('actions.publish')}
          </Button>
          <p className="mt-1 text-[11px] text-[#7C7373]">
            {t('actions.publishedDesc')}
          </p>
        </Card>
      </form>
    </div>
  );
}
