// src/app/client/requests/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CollapsibleTips } from "@/components/ui/CollapsibleTips";
import { FormField, FormInput, FormTextarea, FormSelect } from "@/components/ui/FormField";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

export default function NewClientRequestPage() {
  const t = useTranslations('RequestForm');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Array<{
    id: string;
    nameEn: string;
    subcategories: Array<{ id: string; nameEn: string }>;
  }>>([]);

  const [suggestion, setSuggestion] = useState<{
    categoryId: string;
    subcategoryId: string;
    categoryName: string;
    subcategoryName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    location: '',
    country: 'FR',
    preferredFormat: 'ONLINE_OR_OFFLINE',
    timing: '',
    preferredStartDate: '',
    budgetMin: '',
    budgetMax: '',
  });

  // AI Suggestion Debounce
  useEffect(() => {
    const text = formData.description;

    // Only suggest if we have text and NO category selected yet
    if (!text || text.length < 15 || formData.categoryId) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/categories/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.suggested) {
            setSuggestion(data.suggested);
          }
        }
      } catch (e) {
        // Ignore errors (graceful degradation)
        console.error(e);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [formData.description, formData.categoryId]);

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

  // Field validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'categoryId':
        return !value ? 'Please select a category' : '';
      case 'subcategoryId':
        return !value ? 'Please select a subcategory' : '';
      case 'title':
        if (!value) return 'Title is required';
        if (value.length < 10) return 'Title must be at least 10 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        return '';
      case 'description':
        if (!value) return 'Description is required';
        if (value.length < 30) return 'Description must be at least 30 characters';
        return '';
      case 'location':
        return !value ? 'Location is required' : '';
      case 'timing':
        return !value ? 'Please select urgency' : '';
      case 'preferredStartDate':
        if (formData.timing === 'SCHEDULED' && !value) {
          return 'Please select a date';
        }
        return '';
      default:
        return '';
    }
  };

  // Handle field blur (mark as touched)
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, formData[name as keyof typeof formData]);
    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    ['categoryId', 'subcategoryId', 'title', 'description', 'location', 'timing', 'preferredStartDate'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    setTouched({
      categoryId: true,
      subcategoryId: true,
      title: true,
      description: true,
      location: true,
      timing: true,
      preferredStartDate: true
    });
    return isValid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields first
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

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
        country: formData.country, // Dynamic country
        urgency: formData.timing === 'URGENT' ? 'URGENT' : formData.timing === 'SOON' ? 'SOON' : 'FLEXIBLE',
      };

      if (formData.timing === 'SCHEDULED' && formData.preferredStartDate) {
        requestData.preferredStartDate = new Date(formData.preferredStartDate);
      }

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

          {/* AI Suggestion Block */}
          {suggestion && (
            <div className="animate-in fade-in slide-in-from-top-2 mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-blue-600 mt-1">
                <Sparkles size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Recommendation
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Based on your description, we think you're looking for: <br />
                  <span className="font-medium">
                    {suggestion.categoryName} {' > '} {suggestion.subcategoryName}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        categoryId: suggestion.categoryId,
                        subcategoryId: suggestion.subcategoryId
                      }));
                      setSuggestion(null); // Dismiss after applying
                      toast.success("Category applied!");
                    }}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-blue-700 transition"
                  >
                    Apply Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestion(null)}
                    className="text-xs bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md font-medium hover:bg-gray-50 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              label={t('fields.category')}
              required
              error={touched.categoryId ? fieldErrors.categoryId : undefined}
            >
              <FormSelect
                required
                value={formData.categoryId}
                hasError={touched.categoryId && !!fieldErrors.categoryId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    categoryId: e.target.value,
                    subcategoryId: '' // Reset subcategory when category changes
                  });
                  if (touched.categoryId) {
                    setFieldErrors(prev => ({ ...prev, categoryId: validateField('categoryId', e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('categoryId')}
              >
                <option value="">{t('fields.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField
              label={t('fields.subcategory')}
              required
              error={touched.subcategoryId ? fieldErrors.subcategoryId : undefined}
            >
              <FormSelect
                required
                value={formData.subcategoryId}
                hasError={touched.subcategoryId && !!fieldErrors.subcategoryId}
                onChange={(e) => {
                  setFormData({ ...formData, subcategoryId: e.target.value });
                  if (touched.subcategoryId) {
                    setFieldErrors(prev => ({ ...prev, subcategoryId: validateField('subcategoryId', e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('subcategoryId')}
                disabled={!formData.categoryId}
              >
                <option value="">{t('fields.selectSubcategory')}</option>
                {activeSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameEn}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField
              label={t('fields.title')}
              required
              error={touched.title ? fieldErrors.title : undefined}
              className="md:col-span-2"
            >
              <FormInput
                type="text"
                required
                value={formData.title}
                hasError={touched.title && !!fieldErrors.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (touched.title) {
                    setFieldErrors(prev => ({ ...prev, title: validateField('title', e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('title')}
                placeholder={t('fields.titlePlaceholder')}
              />
            </FormField>
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.details.title')}
            description={t('sections.details.desc')}
          />
          <FormField
            label={t('fields.description')}
            required
            error={touched.description ? fieldErrors.description : undefined}
            hint={!touched.description || !fieldErrors.description ? t('fields.noContactInfo') : undefined}
          >
            <FormTextarea
              rows={4}
              required
              value={formData.description}
              hasError={touched.description && !!fieldErrors.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (touched.description) {
                  setFieldErrors(prev => ({ ...prev, description: validateField('description', e.target.value) }));
                }
              }}
              onBlur={() => handleBlur('description')}
              placeholder={t('fields.descriptionPlaceholder')}
            />
          </FormField>
        </Card>

        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title={t('sections.location.title')}
            description={t('sections.location.desc')}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <LocationSelector
                countryCode={formData.country}
                cityName={formData.location}
                onCountryChange={(code) => setFormData(prev => ({ ...prev, country: code }))}
                onCityChange={(city) => {
                  setFormData(prev => ({ ...prev, location: city }));
                  if (touched.location) {
                    setFieldErrors(prev => ({ ...prev, location: validateField('location', city) }));
                  }
                }}
                countryError={!formData.country ? 'Country is required' : undefined}
                cityError={touched.location ? fieldErrors.location : undefined}
                required
              />
            </div>
            <FormField label={t('fields.format')}>
              <FormSelect
                value={formData.preferredFormat}
                onChange={(e) => setFormData({ ...formData, preferredFormat: e.target.value })}
              >
                <option value="ONLINE_OR_OFFLINE">
                  {t('fields.formats.ONLINE_OR_OFFLINE')}
                </option>
                <option value="ONLINE_ONLY">{t('fields.formats.ONLINE_ONLY')}</option>
                <option value="IN_PERSON_ONLY">{t('fields.formats.IN_PERSON_ONLY')}</option>
              </FormSelect>
            </FormField>
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

          {formData.timing === 'SCHEDULED' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <FormField
                label={t('fields.preferredDate')}
                required
                error={touched.preferredStartDate ? fieldErrors.preferredStartDate : undefined}
              >
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.preferredStartDate}
                  onChange={(e) => {
                    setFormData({ ...formData, preferredStartDate: e.target.value });
                    if (touched.preferredStartDate) {
                      setFieldErrors(prev => ({
                        ...prev,
                        preferredStartDate: validateField('preferredStartDate', e.target.value)
                      }));
                    }
                  }}
                  onBlur={() => handleBlur('preferredStartDate')}
                  className={`
                    w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#333333] 
                    placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15
                    ${touched.preferredStartDate && fieldErrors.preferredStartDate
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-[#E5E7EB] focus:border-[#2563EB]'
                    }
                  `}
                />
              </FormField>
            </div>
          )}
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
