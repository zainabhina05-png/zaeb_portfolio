// Central export file for all portfolio data
export { PROJECT_PLACEHOLDERS } from "./projects";
export { EXPERIENCE_PLACEHOLDERS, LEADERSHIP_PLACEHOLDERS, EXPERIENCE_BOOK_ENTRIES } from "./experience";
export { SKILL_CATEGORIES } from "../data.ts"; // From root data.ts (explicit .ts extension to avoid circular import with index.ts)
export { EDUCATION_PLACEHOLDERS } from "./education";
export { CERTIFICATION_PLACEHOLDERS } from "./certifications";
export { CONTACT_DETAILS, SOCIAL_LINKS } from "./contact";
export { IDE_FOLDERS, INITIAL_FILE } from "./ideStack";

// Re-export types
export type { StackFile, StackFolder } from "./ideStack";
