// src/app/client/requests/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function NewClientRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; nameEn: string }>>([]);
  
  const [formData, setFormData] = useState({
    categoryId: '',
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Map form data to API schema
      const requestData = {
        categoryId: formData.categoryId,
        subcategoryId: formData.categoryId, // TODO: Add subcategory selection to form
        title: formData.title,
        description: formData.description,
        budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
        locationType: formData.preferredFormat === 'ONLINE' ? 'REMOTE' : 'ON_SITE',
        city: formData.location,
        country: 'FR', // Default country
        urgency: formData.timing === 'URGENT' ? 'URGENT' : formData.timing === 'SOON' ? 'SOON' : 'FLEXIBLE',
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to requests list
        router.push('/client/requests');
      } else {
        setError(data.message || data.error?.message || 'Failed to create request');
        console.error('API Error:', data);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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

        <Card className="space-y-3" padding="lg">
          <SectionHeading
            variant="section"
            title="Timing"
            description="Let professionals know when you'd like to start or any time preferences."
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
              When do you need this?
            </label>
            <input
              type="text"
              value={formData.timing}
              onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="e.g. Evenings, weekends, this week, next month"
            />
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

