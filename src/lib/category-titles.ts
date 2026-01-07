export const categoryToTitleMap: Record<string, string> = {
    // Development
    'Web Development': 'Web Developer',
    'Mobile App Development': 'Mobile App Developer',
    'Software Development': 'Software Engineer',
    'Game Development': 'Game Developer',
    'DevOps & Cloud': 'DevOps Engineer',

    // Design
    'Graphic Design': 'Graphic Designer',
    'UI/UX Design': 'UI/UX Designer',
    'Logo Design': 'Logo Designer',
    'Illustration': 'Illustrator',
    'Video Editing': 'Video Editor',
    'Animation': 'Animator',

    // Marketing
    'Digital Marketing': 'Digital Marketer',
    'SEO': 'SEO Specialist',
    'Social Media Marketing': 'Social Media Manager',
    'Content Writing': 'Content Writer',
    'Copywriting': 'Copywriter',

    // Home Services
    'Plumbing': 'Plumber',
    'Electrical': 'Electrician',
    'Cleaning': 'Cleaner',
    'Painting': 'Painter',
    'Carpentry': 'Carpenter',
    'Landscaping': 'Landscaper',
    'Roofing': 'Roofer',
    'HVAC': 'HVAC Technician',

    // Business
    'Accounting': 'Accountant',
    'Legal Services': 'Legal Consultant',
    'Virtual Assistant': 'Virtual Assistant',
    'Project Management': 'Project Manager',

    // Education
    'Tutoring': 'Tutor',
    'Language Teaching': 'Language Teacher',

    // Health
    'Personal Training': 'Personal Trainer',
    'Nutrition': 'Nutritionist',
    'Yoga': 'Yoga Instructor',
};

export function getProfessionalTitle(categoryName: string): string {
    return categoryToTitleMap[categoryName] || categoryName;
}
