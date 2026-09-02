export interface Project {
  id: string;
  titlePlaceholder: string;
  subtitlePlaceholder: string;
  descriptionPlaceholder: string;
  longDescriptionPlaceholder: string;
  categoryPlaceholder: string;
  yearPlaceholder: string;
  techStack: string[];
  imagePlaceholder: string;
  links: {
    github?: string;
    live?: string;
    caseStudy?: string;
  };
}

export interface ExperienceItem {
  id: string;
  rolePlaceholder: string;
  companyPlaceholder: string;
  periodPlaceholder: string;
  descriptionPlaceholder: string;
  technologies: string[];
}

export interface SkillCategory {
  categoryName: string;
  skills: string[];
}

export interface EducationItem {
  id: string;
  degreePlaceholder: string;
  institutionPlaceholder: string;
  periodPlaceholder: string;
  descriptionPlaceholder: string;
}

export interface LeadershipItem {
  id: string;
  rolePlaceholder: string;
  organizationPlaceholder: string;
  periodPlaceholder: string;
  descriptionPlaceholder: string;
}

export interface SocialLink {
  platform: string;
  urlPlaceholder: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  description: string;
  verifyUrl: string;
  securityCode: string;
  bgGrad: string;
}
