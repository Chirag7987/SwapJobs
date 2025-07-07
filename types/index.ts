export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  matchPercentage: number;
  postedDate: string;
  deadline: string;
  logo: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  expectedSalary: string;
  bio: string;
  skills: Skill[];
  workExperience: WorkExperience[];
  education: Education[];
  profilePicture?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  endorsements: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  responsibilities: string[];
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  gpa?: string;
  achievements: string[];
}

export interface SavedJob extends Job {
  savedDate: string;
  applied: boolean;
}