'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  
  const [formData, setFormData] = useState({
    role: '',
    dateOfBirth: '',
    phoneNumber: '',
    city: '',
    country: 'FR',
    termsAccepted: false,
  });

  // Check if user already has a profile - just stop checking, don't redirect
  useEffect(() => {
    if (isLoaded && user) {
      setChecking(false);
    }
  }, [user, isLoaded]);

  const handleRoleSelect = (role: 'CLIENT' | 'PROFESSIONAL') => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('API Error:', data);
        // Extract error message from API response structure
        const errorMessage = data.error?.message || data.message || 'Failed to complete profile';
        throw new Error(errorMessage);
      }

      // Redirect based on role
      if (formData.role === 'CLIENT') {
        router.push('/client');
      } else {
        router.push('/pro');
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#2563EB]"></div>
          <p className="text-sm text-[#7C7373]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ClientNavbar />
      <main className="flex-1 bg-[#FAFAFA] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
                Complete Your Profile
              </h1>
              <p className="mt-2 text-sm text-[#7C7373]">
                {step === 1 ? 'Choose how you want to use SkillFind' : 'Tell us a bit more about yourself'}
              </p>
            </div>

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => handleRoleSelect('CLIENT')}
                  className="group rounded-2xl border-2 border-[#E5E7EB] bg-white p-8 text-left transition-all hover:border-[#2563EB] hover:shadow-lg"
                >
                  <div className="mb-4 text-4xl">🔍</div>
                  <h3 className="mb-2 text-lg font-semibold text-[#333333]">
                    I'm a Client
                  </h3>
                  <p className="text-sm text-[#7C7373]">
                    I'm looking to hire professionals for services I need
                  </p>
                </button>

                <button
                  onClick={() => handleRoleSelect('PROFESSIONAL')}
                  className="group rounded-2xl border-2 border-[#E5E7EB] bg-white p-8 text-left transition-all hover:border-[#2563EB] hover:shadow-lg"
                >
                  <div className="mb-4 text-4xl">💼</div>
                  <h3 className="mb-2 text-lg font-semibold text-[#333333]">
                    I'm a Professional
                  </h3>
                  <p className="text-sm text-[#7C7373]">
                    I want to offer my services and find clients
                  </p>
                </button>
              </div>
            )}

            {/* Step 2: Profile Details */}
            {step === 2 && (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dob" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                      Date of Birth (Must be 18+)
                    </label>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                      Country
                    </label>
                    <select
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                    >
                      <option value="FR">France</option>
                      <option value="BE">Belgium</option>
                      <option value="CH">Switzerland</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MC">Monaco</option>
                    </select>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-[#E5E7EB] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                    <label htmlFor="terms" className="text-sm text-[#7C7373]">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" className="text-[#2563EB] hover:underline">
                        Terms of Service
                      </a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" className="text-[#2563EB] hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Creating profile...' : 'Complete Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
