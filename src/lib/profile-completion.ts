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
};

export function calculateProfessionalCompletion(professional: ProfessionalWithRelations) {
  const steps: ProfileStep[] = [
    {
      id: 'title',
      label: 'Add Professional Title',
      isComplete: Boolean(professional.title && professional.title.length > 0),
      weight: 15,
      actionUrl: '/pro/profile'
    },
    {
      id: 'bio',
      label: 'Add Bio',
      isComplete: Boolean(professional.bio && professional.bio.length > 30),
      weight: 15,
      actionUrl: '/pro/profile'
    },
    {
      id: 'location',
      label: 'Set Location',
      isComplete: Boolean(professional.city && professional.country),
      weight: 15,
      actionUrl: '/pro/profile'
    },
    {
      id: 'services',
      label: 'Add at least one Service',
      isComplete: professional.services.length > 0,
      weight: 25,
      actionUrl: '/pro/profile?activeTab=services'
    },
    {
      id: 'qualifications',
      label: 'Upload Qualifications',
      isComplete: professional.qualificationVerified,
      weight: 15,
      actionUrl: '/pro/profile?activeTab=qualifications'
    },
    {
      id: 'verification',
      label: 'Complete Identity Verification',
      isComplete: professional.isVerified,
      weight: 15,
      actionUrl: '/pro/profile?activeTab=verification'
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
      id: 'name',
      label: 'Complete Name',
      isComplete: Boolean(user.firstName && user.lastName),
      weight: 25,
      actionUrl: '/client/profile'
    },
    {
      id: 'location',
      label: 'Set Location',
      isComplete: Boolean(client?.city || client?.region),
      weight: 25,
      actionUrl: '/client/profile'
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      isComplete: Boolean(user.dateOfBirth),
      weight: 25,
      actionUrl: '/client/profile'
    },
    {
      id: 'preferences',
      label: 'Set Language Preference',
      isComplete: Boolean(client?.preferredLanguage),
      weight: 25,
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
