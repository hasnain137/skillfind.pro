// src/app/client/requests/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function NewClientRequestPage() {
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
        toast.success('Request published!', {
          description: 'Matching professionals will start sending you offers.',
        });
        router.push('/client/requests');
      } else {
        // Handle structured validation errors
        let errorMessage = data.message || data.error?.message || 'Failed to create request';

        if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
          errorMessage = data.error.details
            .map((d: any) => d.message)
            .join('. ');
        }

        setError(errorMessage);
        toast.error('Failed to create request', {
          description: errorMessage,
        });
        console.error('API Error:', data);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error('Something went wrong', {
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
        eyebrow="New request"
        title="Describe what you need"
        description="Share enough detail so professionals can respond with accurate offers. You can edit the request later if anything changes."
      />

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
        <h3 className="text-base font-bold text-[#333333] flex items-center gap-2 mb-3">
          <span>💡</span> Tips for Great Requests
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 text-sm text-[#7C7373]">
          <p>• <strong>Be specific:</strong> Detail what you need done</p>
          <p>• <strong>Set budget:</strong> Helps pros send accurate offers</p>
          <p>• <strong>Add timeline:</strong> When do you need it completed?</p>
          <p>• <strong>Include context:</strong> Share any relevant background</p>
        </div>
      </Card>

      {error && (
        <Card variant="muted" padding="lg" className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title="Task basics"
            description="Pick the best matching category and give your request a clear title."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Category *
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
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Subcategory *
              </label>
              <select
                required
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                disabled={!formData.categoryId}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Select a subcategory</option>
                {activeSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                What exactly do you need? *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="e.g. Math tutor for 10th grade algebra"
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title="Details"
            description="Add context, goals, expectations or anything else that helps a pro understand the job."
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              Describe your task *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Add any details that will help professionals understand what you need, your expectations, and any important context."
            />
            <p className="mt-1 text-[11px] text-[#7C7373]">
              Avoid sharing phone numbers or email here. You can exchange
              contacts once you choose a professional.
            </p>
          </div>
        </Card>

        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title="Location and format"
            description="Tell us where you are and whether online sessions work."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Location (city) *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                placeholder="e.g. Berlin, Vienna, online only"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                Preferred format
              </label>
              <select
                value={formData.preferredFormat}
                onChange={(e) => setFormData({ ...formData, preferredFormat: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              >
                <option value="ONLINE_OR_OFFLINE">
                  Online or in person is fine
                </option>
                <option value="ONLINE_ONLY">Online only</option>
                <option value="IN_PERSON_ONLY">In person only</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="space-y-4" padding="lg">
          <SectionHeading
            variant="section"
            title="Timing"
            description="How urgently do you need this completed?"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'URGENT', label: '🔥 Urgent', desc: 'Within 24-48 hours' },
              { value: 'SOON', label: '⚡ Soon', desc: 'Within a week' },
              { value: 'FLEXIBLE', label: '📅 Flexible', desc: 'No rush, take your time' },
              { value: 'SCHEDULED', label: '🗓️ Specific date', desc: 'I have a deadline' },
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
            title="Budget (optional)"
            description="Optional, but helpful for professionals to tailor their offer."
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              step="0.01"
              value={formData.budgetMin}
              onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Min budget (EUR)"
            />
            <input
              type="number"
              step="0.01"
              value={formData.budgetMax}
              onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Max budget (EUR)"
            />
          </div>
          <p className="text-[11px] text-[#7C7373]">
            Leave blank if you prefer professionals to suggest a price.
          </p>
        </Card>

        <Card variant="dashed" className="text-center" padding="lg">
          <Button className="w-full sm:w-auto" type="submit" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish request'}
          </Button>
          <p className="mt-1 text-[11px] text-[#7C7373]">
            Once published, matching professionals will start receiving your
            request.
          </p>
        </Card>
      </form>
    </div>
  );
}

