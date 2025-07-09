export interface ParsedResumeData {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
  };
  professionalSummary?: string;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  location?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  gpa?: string;
  achievements: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface ResumeParsingResult {
  success: boolean;
  data?: ParsedResumeData;
  error?: string;
  confidence: number;
  warnings: string[];
}