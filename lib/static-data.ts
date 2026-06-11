import type { Database } from '@/lib/supabase/types'

type CourseRow = Database['public']['Tables']['courses']['Row']

export const STATIC_COURSES: CourseRow[] = [
  { id: '1', slug: 'bsc-nautical-science', name: 'B.Sc. Nautical Science', short_name: 'B.Sc. Nautical', department: 'deck', duration_months: 36, duration_display: '3 Years', cet_required: true, display_max_age: 25, salary_entry_min_usd: 400, salary_peak_max_usd: 15000, salary_display: '$400 – $15,000/month', description: 'The flagship deck officer training programme. A 3-year full-time degree that qualifies you to sail as a Deck Cadet and progress to Captain.', banner_color: '#1E3A5F', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '2', slug: 'dns-diploma-nautical-science', name: 'Diploma in Nautical Science (DNS)', short_name: 'DNS', department: 'deck', duration_months: 12, duration_display: '1 Year', cet_required: true, display_max_age: 25, salary_entry_min_usd: 400, salary_peak_max_usd: 15000, salary_display: '$400 – $15,000/month', description: 'A 1-year diploma course for deck cadets. Faster entry into the merchant navy compared to the 3-year B.Sc. route.', banner_color: '#1E3A5F', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '3', slug: 'be-btech-marine-engineering', name: 'B.E./B.Tech Marine Engineering', short_name: 'BE Marine Engg', department: 'engine', duration_months: 48, duration_display: '4 Years', cet_required: true, display_max_age: 25, salary_entry_min_usd: 400, salary_peak_max_usd: 20000, salary_display: '$400 – $20,000/month', description: 'A 4-year engineering degree producing Marine Engineer Officers. One of the highest-paid maritime careers.', banner_color: '#0F4C35', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '4', slug: 'graduate-marine-engineering', name: 'Graduate Marine Engineering (GME)', short_name: 'GME', department: 'engine', duration_months: 12, duration_display: '1 Year', cet_required: false, display_max_age: 28, salary_entry_min_usd: 400, salary_peak_max_usd: 20000, salary_display: '$400 – $20,000/month', description: 'A 1-year conversion course for engineering graduates (BE Mechanical/Electrical) to join as Marine Engineers.', banner_color: '#0F4C35', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '5', slug: 'diploma-marine-engineering', name: 'Diploma Marine Engineering (DMET)', short_name: 'DMET', department: 'engine', duration_months: 24, duration_display: '2 Years', cet_required: true, display_max_age: 25, salary_entry_min_usd: 300, salary_peak_max_usd: 12000, salary_display: '$300 – $12,000/month', description: 'A 2-year diploma for engine room ratings and junior officers. Accessible after Class 10.', banner_color: '#0F4C35', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '6', slug: 'electro-technical-officer', name: 'Electro-Technical Officer (ETO)', short_name: 'ETO', department: 'eto', duration_months: 4, duration_display: '4 Months', cet_required: false, display_max_age: 28, salary_entry_min_usd: 2500, salary_peak_max_usd: 7000, salary_display: '$2,500 – $7,000/month', description: 'Short conversion course for electrical/electronics graduates to sail as ETOs. High demand, excellent pay.', banner_color: '#3D1A6E', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '7', slug: 'gp-rating', name: 'General Purpose (GP) Rating', short_name: 'GP Rating', department: 'ratings', duration_months: 6, duration_display: '6 Months', cet_required: false, display_max_age: 25, salary_entry_min_usd: 600, salary_peak_max_usd: 2000, salary_display: '$600 – $2,000/month', description: 'The quickest path to sea. A 6-month course for Class 10 passouts to sail as deck or engine ratings.', banner_color: '#1A4A2E', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
  { id: '8', slug: 'maritime-catering-ccmc', name: 'Maritime Catering (CCMC)', short_name: 'CCMC', department: 'catering', duration_months: 6, duration_display: '6 Months', cet_required: false, display_max_age: 30, salary_entry_min_usd: 500, salary_peak_max_usd: 1500, salary_display: '$500 – $1,500/month', description: 'A 6-month course for ship catering staff (cooks, stewards). Open to Class 10 passouts.', banner_color: '#4A2A1A', source_circular: 'DGS Training Circular No. 12 of 2020', is_active: true, created_at: '', updated_at: '' },
]

export interface StaticCollege {
  id: string
  slug: string
  name: string
  type: string
  dgs_approval_status: string
  city: string | null
  state: string | null
  imu_affiliated: boolean
  is_active: boolean
  is_partner: boolean
  rating_avg: number | null
  rating_count: number
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  dgs_approval_number: string | null
  last_dgs_verified: string | null
  established_year: number | null
  total_seats: number | null
  hostel_available: boolean
  description: string | null
}

export const STATIC_COLLEGES: StaticCollege[] = [
  { id: '1', slug: 'ts-chanakya-mumbai', name: 'T.S. Chanakya', type: 'imu_campus', dgs_approval_status: 'approved', city: 'Navi Mumbai', state: 'Maharashtra', imu_affiliated: true, is_active: true, is_partner: false, rating_avg: 4.2, rating_count: 156, address: 'Kharghar, Navi Mumbai, Maharashtra 410210', phone: '+91-22-2774-8100', email: 'info@tschanakya.edu.in', website: 'https://www.tschanakya.edu.in', dgs_approval_number: 'MTI/04/2018', last_dgs_verified: '2024-01-15', established_year: 1969, total_seats: 240, hostel_available: true, description: "T.S. Chanakya is one of India's premier maritime training institutes, operated by the Indian Maritime University. Located in Navi Mumbai, it has produced thousands of merchant navy officers." },
  { id: '2', slug: 'imu-chennai', name: 'Indian Maritime University (IMU) Chennai', type: 'imu_campus', dgs_approval_status: 'approved', city: 'Chennai', state: 'Tamil Nadu', imu_affiliated: true, is_active: true, is_partner: false, rating_avg: 4.4, rating_count: 203, address: 'East Coast Road, Uthandi, Chennai 600119', phone: '+91-44-2453-0343', email: 'info@imu.edu.in', website: 'https://www.imu.edu.in', dgs_approval_number: 'MTI/01/2018', last_dgs_verified: '2024-01-15', established_year: 2008, total_seats: 300, hostel_available: true, description: 'The Indian Maritime University, Chennai campus is the apex body for maritime education in India, offering undergraduate and postgraduate programmes in nautical science and marine engineering.' },
  { id: '3', slug: 'marine-engineering-research-institute-kolkata', name: 'Marine Engineering Research Institute (MERI) Kolkata', type: 'imu_campus', dgs_approval_status: 'approved', city: 'Kolkata', state: 'West Bengal', imu_affiliated: true, is_active: true, is_partner: false, rating_avg: 4.1, rating_count: 98, address: '73, Hyde Lane, Kolkata 700016', phone: '+91-33-2248-5264', email: 'meri@meri.edu.in', website: 'https://www.meri.edu.in', dgs_approval_number: 'MTI/02/2018', last_dgs_verified: '2024-01-15', established_year: 1949, total_seats: 200, hostel_available: true, description: "MERI Kolkata is one of India's oldest maritime training institutions, specializing in marine engineering education." },
]

export interface StaticCollegeCourse {
  college_id: string
  college_slug: string
  course_id: string
  course_slug: string
  annual_fees: number
  seats: number
  admission_type: string
}

export const STATIC_COLLEGE_COURSES: StaticCollegeCourse[] = [
  { college_id: '1', college_slug: 'ts-chanakya-mumbai', course_id: '1', course_slug: 'bsc-nautical-science', annual_fees: 375000, seats: 60, admission_type: 'CET' },
  { college_id: '1', college_slug: 'ts-chanakya-mumbai', course_id: '2', course_slug: 'dns-diploma-nautical-science', annual_fees: 350000, seats: 60, admission_type: 'CET' },
  { college_id: '2', college_slug: 'imu-chennai', course_id: '1', course_slug: 'bsc-nautical-science', annual_fees: 400000, seats: 80, admission_type: 'CET' },
  { college_id: '2', college_slug: 'imu-chennai', course_id: '3', course_slug: 'be-btech-marine-engineering', annual_fees: 420000, seats: 80, admission_type: 'CET' },
  { college_id: '3', college_slug: 'marine-engineering-research-institute-kolkata', course_id: '3', course_slug: 'be-btech-marine-engineering', annual_fees: 390000, seats: 60, admission_type: 'CET' },
  { college_id: '3', college_slug: 'marine-engineering-research-institute-kolkata', course_id: '4', course_slug: 'graduate-marine-engineering', annual_fees: 280000, seats: 40, admission_type: 'Direct' },
]
