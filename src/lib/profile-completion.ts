import { User, Professional, ProfessionalService, ProfessionalProfile, Wallet, Client } from '@prisma/client';

export interface ProfileStep {
  id: string;
  label: string;
  isComplete: boolean;
  weight: number;
  actionUrl?: string;
}

export type ProfessionalWithRelations = Professional & {
  user: User;
  services: ProfessionalService[];
  profile: ProfessionalProfile | null;
  wallet: Wallet | null;
  documents?: any[];
};

export function calculateProfessionalCompletion(professional: ProfessionalWithRelations) {
  const steps: ProfileStep[] = [
    {
      id: 'email',
      label: 'Verify Email',
      isComplete: professional.user.emailVerified,
      weight: 10,
      actionUrl: '/settings/account'
    },
    {
      id: 'phone',
      label: 'Verify Phone Number',
      isComplete: Boolean(professional.user.phoneNumber && professional.user.phoneVerified),
      weight: 10,
      actionUrl: '/settings/account'
    },
    {
      id: 'avatar',
      label: 'Upload Profile Photo',
      isComplete: Boolean(professional.user.avatar),
      weight: 10,
      actionUrl: '/pro/profile'
    },
    {
      id: 'location',
      label: 'Set Location',
      isComplete: Boolean(professional.city && professional.country),
      weight: 10,
      actionUrl: '/pro/profile'
    },
    {
      id: 'bio',
      label: 'Add Bio',
      isComplete: Boolean(professional.bio && professional.bio.length > 50),
      weight: 10,
      actionUrl: '/pro/profile'
    },
    {
      id: 'services',
      label: 'Add Services',
      isComplete: professional.services.length > 0,
      weight: 20,
      actionUrl: '/pro/profile'
    },
    {
      id: 'pricing',
      label: 'Set Hourly Rate',
      isComplete: Boolean(professional.profile?.hourlyRateMin),
      weight: 10,
      actionUrl: '/pro/profile'
    },
    {
      id: 'verification',
      label: 'Verify Identity',
      isComplete: Boolean(professional.isVerified || (professional.documents && professional.documents.length > 0)),
      weight: 15,
      actionUrl: '/pro/profile'
    }
  ];

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const completedWeight = steps.reduce((sum, step) => step.isComplete ? sum + step.weight : sum, 0);
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    percentage,
    steps,
    missingSteps: steps.filter(s => !s.isComplete)
  };
}

export function calculateClientCompletion(user: User, client: Client | null) {
  const steps: ProfileStep[] = [
    {
      id: 'email',
      label: 'Verify Email',
      isComplete: user.emailVerified,
      weight: 20,
      actionUrl: '/settings/account'
    },
    {
      id: 'phone',
      label: 'Verify Phone Number',
      isComplete: Boolean(user.phoneNumber && user.phoneVerified),
      weight: 20,
      actionUrl: '/settings/account'
    },
    {
      id: 'name',
      label: 'Complete Name',
      isComplete: Boolean(user.firstName && user.lastName),
      weight: 20,
      actionUrl: '/client/profile'
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      isComplete: Boolean(user.dateOfBirth),
      weight: 20,
      actionUrl: '/client/profile'
    },
    {
      id: 'location',
      label: 'Set City',
      isComplete: Boolean(client?.city),
      weight: 20,
      actionUrl: '/client/profile'
    }
  ];

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const completedWeight = steps.reduce((sum, step) => step.isComplete ? sum + step.weight : sum, 0);
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    percentage,
    steps,
    missingSteps: steps.filter(s => !s.isComplete)
  };
}
