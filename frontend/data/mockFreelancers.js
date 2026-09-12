// Mock data standing in for a future GET /api/v1/freelancers endpoint.
// Shape is deliberately close to what the jobs/categories tables already
// suggest (category_name, etc.) so swapping in a real fetch later is a
// drop-in replacement for this export.

export const categories = [
  { id: 'design', label: 'Design', count: 15 },
  { id: 'programming', label: 'Programming', count: 21 },
  { id: 'video', label: 'Video & Animation', count: 14 },
  { id: 'marketing', label: 'Marketing', count: 25 },
  { id: 'writing', label: 'Copywriting', count: 9 },
];

export const skillOptions = [
  'Wireframes',
  'Figma',
  'Illustration',
  'Adobe Photoshop',
  'Adobe After Effects',
  'Spline',
];

export const freelancers = [
  {
    id: 'jason-holls',
    name: 'Jason Holls',
    role: 'UI/UX Designer',
    category: 'design',
    initials: 'JH',
    hue: 210,
    rating: 4.9,
    reviews: 21,
    serviceTitle: 'Landing page design',
    price: 130,
    experienceYears: 2,
    workType: 'Project work',
    description:
      "I'm creating high-quality landing pages quickly and professionally. I'll be happy to help you with your project.",
    skills: ['Wireframes', 'Figma'],
    costOfService: 130,
    revisions: 'Unlimited',
    deadline: '2-6 days',
  },
  {
    id: 'alice-murphy',
    name: 'Alice Murphy',
    role: 'Graphic Designer',
    category: 'design',
    initials: 'AM',
    hue: 35,
    rating: 4.8,
    reviews: 67,
    serviceTitle: 'Animated landing page design',
    price: 55,
    experienceYears: 4,
    workType: 'Part-Time',
    description:
      "As a freelance graphic designer, I offer everything from logo design and brand identity to marketing materials like flyers, packaging, and album art.",
    skills: ['Illustration', 'Adobe Photoshop', 'Adobe After Effects'],
    costOfService: 80,
    revisions: 'Unlimited',
    deadline: '2-6 days',
    portfolio: [
      { id: 1, label: 'Midnight Drive', hue: 6 },
      { id: 2, label: 'Rather / Lie', hue: 0 },
      { id: 3, label: 'Blythe Heart', hue: 18 },
      { id: 4, label: 'Feral the Cat', hue: 140 },
    ],
  },
  {
    id: 'dianne-russell',
    name: 'Dianne Russell',
    role: 'Web Designer',
    category: 'design',
    initials: 'DR',
    hue: 340,
    rating: 5.0,
    reviews: 21,
    serviceTitle: 'Landing page design',
    price: 130,
    experienceYears: 2,
    workType: 'Project work',
    description:
      'Transform user experiences into engaging, intuitive journeys. I specialize in UI/UX design for web and mobile apps, focusing on clarity and conversion.',
    skills: ['Figma', 'Wireframes'],
    costOfService: 130,
    revisions: '3 rounds',
    deadline: '3-5 days',
  },
  {
    id: 'jenny-wilson',
    name: 'Jenny Wilson',
    role: 'UI/UX Designer',
    category: 'design',
    initials: 'JW',
    hue: 45,
    rating: 4.9,
    reviews: 14,
    serviceTitle: 'Landing page design',
    price: 130,
    experienceYears: 2,
    workType: 'Project work',
    description:
      'I craft clean, conversion-focused landing pages that combine strategic layout, persuasive copy, and compelling visuals.',
    skills: ['Figma', 'Wireframes', 'Illustration'],
    costOfService: 120,
    revisions: 'Unlimited',
    deadline: '2-4 days',
  },
];

export function getFreelancerById(id) {
  return freelancers.find((f) => f.id === id);
}
