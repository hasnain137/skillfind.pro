'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type OnboardingStep = 'loading' | 'select-role' | 'complete-profile' | 'redirecting';

/**
 * Intelligent onboarding orchestrator
 * Handles role selection and profile completion in a single seamless flow
 */
export default function AuthRedirectPage() {
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'PROFESSIONAL' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [redirectMessage, setRedirectMessage] = useState('Taking you to your dashboard...');

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    phoneNumber: '',
    city: '',
    country: 'FR',
  });

  // Determine which step to show based on user state
  useEffect(() => {
    async function determineStep() {
      // Wait for Clerk to fully load before making any decisions
      if (!isLoaded) {
        return;
      }

      // If loaded but no user, they're not authenticated - redirect to login
      if (!user) {
        console.log('No authenticated user found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      const role = user.publicMetadata?.role as string | undefined;

      // If user already has a role, check if they have a complete profile in the database
      if (role) {
        try {
          // Use the check-profile endpoint that doesn't require database user
          const response = await fetch('/api/auth/check-profile', {
            credentials: 'include',
          });

          if (response.status === 401) {
            console.log('Session not synced yet (401), scheduling retry...');
            // Wait 1s and try again (simple recursion or state trigger)
            setTimeout(determineStep, 1000);
            return;
          }

          if (response.ok) {
            const data = await response.json();
            const profileData = data.data || data;

            console.log('Profile check result:', profileData);

            if (profileData.exists && profileData.hasProfile) {
              // Profile complete, redirect to dashboard
              const dashboardUrl = role === 'CLIENT' ? '/client' :
                role === 'PROFESSIONAL' ? '/pro' :
                  role === 'ADMIN' ? '/admin' : '/';
              window.location.href = dashboardUrl;
              return;
            } else {
              // User needs to complete profile - show profile form
              console.log('User needs to complete profile');
              console.log('Missing fields:', profileData.missingFields);
              setSelectedRole(role as 'CLIENT' | 'PROFESSIONAL');

              // Pre-fill form with existing data if available
              if (profileData.user) {
                // We'll pre-fill what we have, user only needs to fill missing fields
              }

              setStep('complete-profile');
            }
          } else {
            // Error occurred - show profile form to be safe
            console.error('Profile check failed:', response.status);
            setSelectedRole(role as 'CLIENT' | 'PROFESSIONAL');
            setStep('complete-profile');
          }
        } catch (error) {
          // Network error - show profile form
          console.error('Network error during profile check:', error);
          setSelectedRole(role as 'CLIENT' | 'PROFESSIONAL');
          setStep('complete-profile');
        }
      } else {
        // No role selected yet - show role selection
        setStep('select-role');
      }
    }

    determineStep();
  }, [user, isLoaded]);

  // Validate international phone number format (E.164)
  const validatePhoneNumber = (phone: string): boolean => {
    // E.164 format: +[country code][number] (max 15 digits total)
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  // Helper function to handle dashboard redirect with retry logic
  const redirectToDashboard = async (role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN', delay: number = 1000, allowIncomplete: boolean = false) => {
    const dashboardUrl = role === 'CLIENT' ? '/client' :
      role === 'PROFESSIONAL' ? '/pro' :
        role === 'ADMIN' ? '/admin' : '/';

    console.log(`🔄 Preparing to redirect to ${dashboardUrl}...`);
    setStep('redirecting');
    setRedirectMessage('Syncing your account...');

    // Wait for Clerk session to sync the new role
    let attempts = 0;
    const maxAttempts = 20; // Increased from 10 to 20

    const checkProfileAndRedirect = async () => {
      attempts++;

      try {
        console.log(`🔍 Attempt ${attempts}/${maxAttempts}: Checking if backend profile is ready...`);
        setRedirectMessage(`Syncing your account... (${attempts}/${maxAttempts})`);

        // Check the backend API to see if profile is complete
        const response = await fetch('/api/auth/check-profile', {
          cache: 'no-store',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const profileData = data.data || data;

          console.log(`📋 Backend says: exists=${profileData.exists}, hasProfile=${profileData.hasProfile}, role=${profileData.role}`);

          // Profile must exist in DB and have matching role.
          // If allowIncomplete is true, we don't require hasProfile (full completeness) to be true
          if (profileData.exists && profileData.role === role && (profileData.hasProfile || allowIncomplete)) {
            console.log(`✅ Backend confirms profile is ready!`);

            // Also check client session has the role
            await user?.reload();
            const clientRole = user?.publicMetadata?.role;
            console.log(`🔍 Client session role: ${clientRole}`);

            if (clientRole === role) {
              console.log(`🎉 BOTH backend AND client session are synced! Redirecting...`);
              setRedirectMessage('Perfect! Taking you to your dashboard...');

              // Force a full page reload to ensure middleware sees the updated session
              setTimeout(() => {
                window.location.href = dashboardUrl;
              }, 1500);
              return;
            } else {
              console.log(`⏳ Backend ready but client session not synced yet (client: ${clientRole}, expected: ${role})`);
            }
          } else {
            console.log(`⏳ Backend not ready yet`);
          }
        } else {
          console.log(`⏳ Profile check returned ${response.status}`);
        }

        // Retry if not maxed out
        if (attempts < maxAttempts) {
          setTimeout(checkProfileAndRedirect, 1500); // 1.5 seconds between attempts
        } else {
          console.warn(`⚠️ Timed out after ${maxAttempts} attempts (${maxAttempts * 1.5} seconds)`);
          console.warn(`⚠️ Attempting redirect anyway - middleware should handle it`);
          setRedirectMessage('Taking a bit longer... trying anyway...');
          setTimeout(() => {
            window.location.href = dashboardUrl;
          }, 2000);
        }
      } catch (error) {
        console.error(`❌ Error on attempt ${attempts}:`, error);

        // Retry on error
        if (attempts < maxAttempts) {
          setTimeout(checkProfileAndRedirect, 1500);
        } else {
          console.log('❌ Max attempts reached with errors. Trying redirect...');
          window.location.href = dashboardUrl;
        }
      }
    };

    // Start polling after initial delay
    setTimeout(checkProfileAndRedirect, delay);
  };

  // Handle role selection
  const handleRoleSelect = async (role: 'CLIENT' | 'PROFESSIONAL') => {
    setLoading(true);
    setError('');

    try {
      console.log(`👤 User selected role: ${role}`);

      // Save role to Clerk metadata
      const response = await fetch('/api/auth/save-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Failed to save role:', data);
        throw new Error(data.error?.message || data.message || 'Failed to save role');
      }

      const result = await response.json();
      console.log('✅ Role saved:', result);

      // Update user object to refresh session data
      if (user) {
        await user.reload();
        console.log('🔄 User session refreshed');
      }

      // Move to profile completion step
      setSelectedRole(role);
      setStep('complete-profile');
    } catch (err: any) {
      console.error('❌ Error saving role:', err);
      setError(err.message || 'Failed to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle skip - create account with minimal info and redirect
  const handleSkip = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('⏭️ Skipping profile completion, creating base account...');

      if (selectedRole) {
        // Create the account in DB with minimal info (just the role)
        // This ensures the user exists in DB so middleware won't redirect them back
        const response = await fetch('/api/auth/complete-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: selectedRole,
            // Don't send other fields, let them be null/optional
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error('❌ Failed to create base account during skip:', data);
          throw new Error(data.message || 'Failed to create account');
        }

        console.log('✅ Base account created. Redirecting...');

        // Use the robust redirect handler that waits for DB consistency
        // PASS TRUE to allow incomplete profile (since we just skipped)
        await redirectToDashboard(selectedRole, 500, true);
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('❌ Error during skip:', err);
      setError(err.message || 'Failed to skip. Please try again.');
      setLoading(false);
    }
  };

  // Handle complete profile submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPhoneError('');

    console.log('📝 Submitting profile completion form...');

    // Validate phone number if provided
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      setPhoneError('Please enter phone in international format: +[country code][number] (e.g., +33612345678)');
      setLoading(false);
      return;
    }

    try {
      // Prepare payload - only include non-empty values
      const payload = {
        role: selectedRole,
        dateOfBirth: formData.dateOfBirth || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        city: formData.city || undefined,
        country: formData.country || 'FR',
      };

      console.log('📤 Sending payload:', { ...payload, dateOfBirth: payload.dateOfBirth ? '[PROVIDED]' : '[EMPTY]' });

      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Profile completion failed:', data);
        throw new Error(data.error?.message || data.message || 'Failed to complete profile');
      }

      const result = await response.json();
      console.log('✅ Profile completed successfully:', result);

      // Redirect to dashboard
      if (selectedRole) {
        await redirectToDashboard(selectedRole, 1000, false);
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('❌ Error during profile completion:', err);
      setError(err.message || 'Failed to complete profile. Please try again.');
      setLoading(false);
    }
  };

  // Loading state
  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent mx-auto"></div>
          <p className="text-sm text-[#7C7373]">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Redirecting state
  if (step === 'redirecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center max-w-md px-4">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent mx-auto"></div>
          <p className="text-base font-medium text-[#333333] mb-2">{redirectMessage}</p>
          <p className="text-xs text-[#B0B0B0]">
            This may take a few moments as we set up your account...
          </p>
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
                {step === 'select-role' ? 'Welcome to SkillFind' : 'Complete Your Profile'}
              </h1>
              <p className="mt-2 text-sm text-[#7C7373]">
                {step === 'select-role'
                  ? 'Choose how you want to use SkillFind'
                  : 'Tell us a bit about yourself (or skip for now)'}
              </p>
            </div>

            {/* Step 1: Role Selection */}
            {step === 'select-role' && (
              <div>
                {error && (
                  <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-600 text-lg">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 mb-1">Unable to save role</p>
                        <p className="text-sm text-red-600">{error}</p>
                        {retryCount > 0 && (
                          <p className="text-xs text-red-500 mt-1">Retry attempt: {retryCount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => handleRoleSelect('CLIENT')}
                    disabled={loading}
                    className="group rounded-2xl border-2 border-[#E5E7EB] bg-white p-8 text-left transition-all hover:border-[#2563EB] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loading}
                    className="group rounded-2xl border-2 border-[#E5E7EB] bg-white p-8 text-left transition-all hover:border-[#2563EB] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            )}

            {/* Step 2: Profile Completion */}
            {step === 'complete-profile' && (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
                {/* Info banner */}
                <div className="mb-5 rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-lg">ℹ️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Complete Your Profile</p>
                      <p className="text-sm text-blue-700">
                        Fill in your basic information to get the best experience. You can also skip for now and complete it later from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-red-600 text-lg">⚠️</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800 mb-1">Profile Creation Failed</p>
                          <p className="text-sm text-red-600">{error}</p>
                          {retryCount > 0 && (
                            <p className="text-xs text-red-500 mt-1">Retry attempt: {retryCount}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setError('');
                              setRetryCount(0);
                            }}
                            className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dob" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                      Date of Birth <span className="text-[#B0B0B0]">(Must be 18+)</span>
                    </label>
                    <input
                      id="dob"
                      type="date"
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
                      placeholder="+33612345678"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, phoneNumber: e.target.value });
                        setPhoneError('');
                      }}
                      className={`w-full rounded-xl border ${phoneError ? 'border-red-300' : 'border-[#E5E7EB]'} bg-white px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15`}
                    />
                    {phoneError ? (
                      <p className="mt-1.5 text-xs text-red-600">{phoneError}</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-[#B0B0B0]">
                        International format: +[country code][number] (e.g., +33612345678, +1234567890)
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="mb-1.5 block text-xs font-medium text-[#7C7373]">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
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
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                    >
                      <option value="FR">France</option>
                      <option value="BE">Belgium</option>
                      <option value="CH">Switzerland</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MC">Monaco</option>
                      <option value="DE">Germany</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                      disabled={loading}
                      className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Skip for Now
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      {loading ? 'Saving...' : 'Complete Profile'}
                    </Button>
                  </div>

                  {/* Helper text */}
                  <p className="text-center text-xs text-[#B0B0B0]">
                    You can complete your full profile later from your dashboard
                  </p>
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
