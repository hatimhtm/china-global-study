export interface University {
  id: string;
  name: string;
  city: string;
  province: string;
  china_ranking: number | null;
  scholarship_percentage: number;
  instruction_languages: string[];
  intake_seasons: string[];
  is_featured: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  university_id: string;
  title: string;
  degree_level: string;
  field_of_study: string;
  tuition_cny: number;
  dorm_fee_cny: number;
  service_fee_cny: number;
  total_fee_cny: number;
  total_fee_mad: number;
  scholarship_percentage: number;
  duration_years: number;
  intake_season: string;
  status: 'Available' | 'Expired' | 'Full';
  requirements: string;
  created_at: string;
  // joined
  university?: University;
}

export interface Applicant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  passport_number: string;
  application_id: string;
  notes: string;
  created_at: string;
}

export type ApplicationStatus = 
  | 'Inquiry'
  | 'Documents Collecting'
  | 'Submitted'
  | 'Under Review'
  | 'Accepted'
  | 'Visa Processing'
  | 'Enrolled'
  | 'Rejected';

export interface Application {
  id: string;
  applicant_id: string;
  program_id: string | null;
  custom_university: string | null;
  custom_program: string | null;
  status: ApplicationStatus;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  created_at: string;
  // joined
  applicant?: Applicant;
  program?: Program & { university?: University };
}

export interface Document {
  id: string;
  application_id: string;
  document_type: string;
  label: string;
  status: 'Pending' | 'Received' | 'Verified' | 'Expired';
  notes: string;
  created_at: string;
}

export interface CityGuide {
  id: string;
  city_name: string;
  province: string;
  description: string;
  population: string;
  climate: string;
  cost_of_living: string;
  essential_apps: { name: string; description: string }[];
  accommodation_info: string;
  transportation: string;
  image_url: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  category: 'Pre-Departure' | 'Arrival' | 'Documentation' | 'General';
  priority: 'Low' | 'Medium' | 'High';
  due_date: string | null;
  applicant_tags: string[];
  sort_order: number;
  created_at: string;
}

export interface Settings {
  id: string;
  agent_name: string;
  agency_id: string;
  email: string;
  phone: string;
  bio: string;
  theme: string;
  mad_exchange_rate: number;
  created_at: string;
}
