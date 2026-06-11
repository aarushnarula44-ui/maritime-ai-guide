-- ============================================================
-- MARITIME AI GUIDE — SEED DATA
-- ============================================================

-- COURSES
INSERT INTO public.courses (slug, name, short_name, department, duration_months, duration_display, cet_required, display_max_age, salary_entry_min_usd, salary_peak_max_usd, salary_display, source_circular, banner_color) VALUES
('bsc-nautical-science', 'B.Sc. (Nautical Science)', 'B.Sc. NS', 'deck', 36, '3 Years', true, 25, 400, 15000, '$400 – $15,000/month', 'DGS Training Circular No. 12 of 2020', '#1E3A5F'),
('dns-diploma-nautical-science', 'Diploma in Nautical Science (DNS)', 'DNS', 'deck', 12, '1 Year (leading to B.Sc.)', true, 25, 400, 15000, '$400 – $15,000/month', 'DGS Training Circular No. 12 of 2020', '#1E3A5F'),
('be-btech-marine-engineering', 'BE/B-Tech Marine Engineering', 'BE Marine Engg', 'engine', 48, '4 Years', true, 25, 400, 20000, '$400 – $20,000/month', 'DGS Training Circular No. 12 of 2020', '#0F4C35'),
('graduate-marine-engineering', 'Graduate Marine Engineering (GME)', 'GME', 'engine', 12, '1 Year', false, 28, 400, 20000, '$400 – $20,000/month', 'DGS Training Circular No. 12 of 2020', '#0F4C35'),
('diploma-marine-engineering', 'Diploma in Marine Engineering', 'Diploma Marine', 'engine', 24, '2 Years', false, 23, 300, 12000, '$300 – $12,000/month', 'DGS Training Circular No. 12 of 2020', '#0F4C35'),
('electro-technical-officer', 'Electro-Technical Officers (ETO)', 'ETO', 'eto', 4, '4 Months', false, 35, 2500, 7000, '$2,500 – $7,000/month', 'DGS Training Circular No. 12 of 2020', '#3D1A6E'),
('gp-rating', 'General Purpose Rating (GP Rating)', 'GP Rating', 'ratings', 6, '6 Months', false, 25, 600, 2000, '$600 – $2,000/month', 'DGS Training Circular No. 12 of 2020', '#1A4A2E'),
('maritime-catering-ccmc', 'Certificate Course in Maritime Catering (CCMC)', 'CCMC', 'catering', 6, '6 Months', false, 25, 500, 1500, '$500 – $1,500/month', 'DGS Training Circular No. 12 of 2020', '#4A2A1A');

-- COURSE ELIGIBILITY RULES
-- B.Sc. Nautical Science
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_pcm_percentage, min_english_percentage, english_check_level, max_age_general, source_section)
SELECT id, 1, '12th Standard (PCM)', 'class_12_pcm', 60.00, 50.00, 'either', 25, 'Annexure 1, Page 1'
FROM public.courses WHERE slug = 'bsc-nautical-science';

-- DNS
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_pcm_percentage, min_english_percentage, english_check_level, max_age_general, source_section)
SELECT id, 1, '12th Standard (PCM)', 'class_12_pcm', 60.00, 50.00, 'either', 25, 'Annexure 1, Page 1'
FROM public.courses WHERE slug = 'dns-diploma-nautical-science';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 2, 'B.Sc. Graduate', 'bsc', 55.00, 50.00, 'either', 25,
'{"bsc_subjects": ["physics","mathematics","chemistry","electronics"], "physics_required": true}'::jsonb,
'Annexure 1, Page 2'
FROM public.courses WHERE slug = 'dns-diploma-nautical-science';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 3, 'B.E./B.Tech Graduate', 'be_btech', 50.00, 50.00, 'either', 25,
'{"institute_types": ["iit", "aicte_recognized"]}'::jsonb,
'Annexure 1, Page 2'
FROM public.courses WHERE slug = 'dns-diploma-nautical-science';

-- BE/B-Tech Marine Engineering
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_pcm_percentage, min_english_percentage, english_check_level, max_age_general, exemptions_granted, source_section)
SELECT id, 1, '12th Standard (PCM)', 'class_12_pcm', 60.00, 50.00, 'either', 25,
'{"meo_class_iv_part_a": true, "meo_class_ii_part_a": true}'::jsonb,
'Annexure 1, Page 3'
FROM public.courses WHERE slug = 'be-btech-marine-engineering';

-- GME
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 1, 'BE/B.Tech Mechanical Engineering', 'be_btech', 50.00, 50.00, 'either', 28,
'{"branch": "mechanical_engineering", "pure_mechanical_required": true}'::jsonb,
'Annexure 1, Page 8'
FROM public.courses WHERE slug = 'graduate-marine-engineering';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 2, 'All Mechanical Streams', 'be_btech', 50.00, 50.00, 'either', 28,
'{"branch_prefix": "mechanical"}'::jsonb,
'Annexure 1, Page 8'
FROM public.courses WHERE slug = 'graduate-marine-engineering';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 3, 'Naval Architecture Streams', 'be_btech', 50.00, 50.00, 'either', 28,
'{"branch_prefix": "naval_architecture"}'::jsonb,
'Annexure 1, Page 8'
FROM public.courses WHERE slug = 'graduate-marine-engineering';

-- Diploma Marine Engineering
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 1, 'Diploma Mechanical/Naval Arch/Electrical', 'diploma', 50.00, 50.00, 'either', 22,
'{"branches": ["mechanical","naval_architecture","electrical","electrical_and_electronics"]}'::jsonb,
'Annexure 1, Page 9'
FROM public.courses WHERE slug = 'diploma-marine-engineering';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 2, 'Diploma Shipbuilding', 'diploma', 50.00, 50.00, 'either', 23,
'{"branches": ["shipbuilding"]}'::jsonb,
'Annexure 1, Page 9'
FROM public.courses WHERE slug = 'diploma-marine-engineering';

-- ETO
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 1, '4-year BE/B.Tech Electrical/Electronics', 'be_btech', 50.00, 50.00, 'either', 35,
'{"branches": ["electrical","electronics","electrical_and_electronics","electronics_and_telecom","electronics_and_instrumentation"], "degree_years": 4}'::jsonb,
'Annexure 1, Page 11'
FROM public.courses WHERE slug = 'electro-technical-officer';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 2, 'Lateral Entry Diploma-to-Degree', 'be_btech', 50.00, 50.00, 'either', 35,
'{"lateral_entry": true, "branches": ["electrical","electronics"]}'::jsonb,
'Annexure 1, Page 11'
FROM public.courses WHERE slug = 'electro-technical-officer';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 3, '3-year Diploma Electrical/Electronics', 'diploma', 60.00, 50.00, 'either', 35,
'{"branches": ["electrical","electronics","electrical_and_electronics"]}'::jsonb,
'Annexure 1, Page 11'
FROM public.courses WHERE slug = 'electro-technical-officer';

-- GP Rating
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, min_age, additional_conditions, source_section)
SELECT id, 1, 'Class 10 Pass', 'class_10', 40.00, 40.00, 'class_10', 25, 17.5,
'{"subjects_required": ["science","mathematics"]}'::jsonb,
'Annexure 1, Page 13'
FROM public.courses WHERE slug = 'gp-rating';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, min_age, additional_conditions, source_section)
SELECT id, 2, '2-Year ITI', 'class_10', 50.00, 40.00, 'class_10', 25, 17.5,
'{"iti_required": true, "government_approved": true}'::jsonb,
'Annexure 1, Page 13'
FROM public.courses WHERE slug = 'gp-rating';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 3, 'Diploma/Degree Holders', 'diploma', 40.00, 40.00, 'class_10', 27,
'{"class_10_required": true, "training_within_months": 12}'::jsonb,
'Annexure 1, Page 13'
FROM public.courses WHERE slug = 'gp-rating';

-- CCMC
INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, min_age, source_section)
SELECT id, 1, 'Class 10 Pass', 'class_10', 40.00, 40.00, 'class_10', 25, 17.5, 'Annexure 1, Page 14'
FROM public.courses WHERE slug = 'maritime-catering-ccmc';

INSERT INTO public.course_eligibility_rules (course_id, route_number, route_label, qualification_required, min_aggregate_pct, min_english_percentage, english_check_level, max_age_general, additional_conditions, source_section)
SELECT id, 2, 'Diploma/Degree Holders', 'diploma', 40.00, 40.00, 'class_10', 27,
'{"class_10_required": true}'::jsonb,
'Annexure 1, Page 14'
FROM public.courses WHERE slug = 'maritime-catering-ccmc';

-- CAREER PROGRESSION — Deck (B.Sc. NS and DNS)
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 1, 'Deck Cadet', 0, 1, 400, 800, NULL FROM public.courses WHERE slug = 'bsc-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 2, '3rd Officer', 2, 4, 1500, 2500, 'Class II' FROM public.courses WHERE slug = 'bsc-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 3, '2nd Officer', 4, 7, 2500, 4000, NULL FROM public.courses WHERE slug = 'bsc-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 4, 'Chief Officer', 7, 12, 4500, 7000, NULL FROM public.courses WHERE slug = 'bsc-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 5, 'Master/Captain', 12, 18, 8000, 15000, NULL FROM public.courses WHERE slug = 'bsc-nautical-science';

INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 1, 'Deck Cadet', 0, 1, 400, 800, NULL FROM public.courses WHERE slug = 'dns-diploma-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 2, '3rd Officer', 2, 4, 1500, 2500, 'Class II' FROM public.courses WHERE slug = 'dns-diploma-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 3, '2nd Officer', 4, 7, 2500, 4000, NULL FROM public.courses WHERE slug = 'dns-diploma-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 4, 'Chief Officer', 7, 12, 4500, 7000, NULL FROM public.courses WHERE slug = 'dns-diploma-nautical-science';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 5, 'Master/Captain', 12, 18, 8000, 15000, NULL FROM public.courses WHERE slug = 'dns-diploma-nautical-science';

-- CAREER PROGRESSION — Engine
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd)
SELECT id, 1, 'Engine Cadet/4th Engineer', 0, 2, 400, 800 FROM public.courses WHERE slug = 'be-btech-marine-engineering';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 2, '3rd Engineer', 2, 5, 2500, 4000, 'MEO Class IV' FROM public.courses WHERE slug = 'be-btech-marine-engineering';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 3, '2nd Engineer', 5, 10, 4000, 6500, 'MEO Class II' FROM public.courses WHERE slug = 'be-btech-marine-engineering';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 4, 'Chief Engineer', 10, 16, 8000, 20000, 'MEO Class I' FROM public.courses WHERE slug = 'be-btech-marine-engineering';

INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd)
SELECT id, 1, 'Engine Cadet/4th Engineer', 0, 2, 400, 800 FROM public.courses WHERE slug = 'graduate-marine-engineering';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 2, '3rd Engineer', 2, 5, 2500, 4000, 'MEO Class IV' FROM public.courses WHERE slug = 'graduate-marine-engineering';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 3, '2nd Engineer', 5, 10, 4000, 6500, 'MEO Class II' FROM public.courses WHERE slug = 'graduate-marine-engineering';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd, coc_required)
SELECT id, 4, 'Chief Engineer', 10, 16, 8000, 20000, 'MEO Class I' FROM public.courses WHERE slug = 'graduate-marine-engineering';

-- CAREER PROGRESSION — ETO
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd)
SELECT id, 1, 'ETO', 0, 5, 2500, 5000 FROM public.courses WHERE slug = 'electro-technical-officer';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd)
SELECT id, 2, 'Senior ETO', 5, 99, 4000, 7000 FROM public.courses WHERE slug = 'electro-technical-officer';

-- CAREER PROGRESSION — GP Rating
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd)
SELECT id, 1, 'General Purpose Rating', 0, 3, 600, 1200 FROM public.courses WHERE slug = 'gp-rating';
INSERT INTO public.course_career_progression (course_id, rank_order, rank_title, years_from, years_to, salary_min_usd, salary_max_usd)
SELECT id, 2, 'Able Seaman/Engine Rating', 3, 8, 1200, 2000 FROM public.courses WHERE slug = 'gp-rating';

-- CET SCHEDULE
INSERT INTO public.cet_schedules (academic_year, registration_opens, registration_closes, exam_date, status) VALUES
('2025-26', '2025-03-01', '2025-05-15', '2025-06-07', 'upcoming');

-- CET TOPICS
INSERT INTO public.cet_topics (subject, topic_name) VALUES
('mathematics', 'Algebra'),
('mathematics', 'Trigonometry'),
('mathematics', 'Calculus'),
('mathematics', 'Statistics'),
('mathematics', 'Coordinate Geometry'),
('mathematics', 'Matrices'),
('mathematics', 'Vectors'),
('physics', 'Mechanics'),
('physics', 'Thermodynamics'),
('physics', 'Optics'),
('physics', 'Electricity'),
('physics', 'Magnetism'),
('physics', 'Modern Physics'),
('physics', 'Waves'),
('chemistry', 'Physical Chemistry'),
('chemistry', 'Organic Chemistry'),
('chemistry', 'Inorganic Chemistry'),
('chemistry', 'Electrochemistry'),
('english', 'Grammar'),
('english', 'Comprehension'),
('english', 'Vocabulary'),
('english', 'Writing'),
('general_aptitude', 'Logical Reasoning'),
('general_aptitude', 'Numerical Ability'),
('general_aptitude', 'Spatial Reasoning'),
('general_aptitude', 'General Knowledge');

-- SAMPLE CET QUESTIONS (5 per subject)
INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'If x² + 5x + 6 = 0, what are the values of x?', '-2 and -3', '2 and 3', '-2 and 3', '2 and -3', 'a', 'medium'
FROM public.cet_topics WHERE subject = 'mathematics' AND topic_name = 'Algebra' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'What is the value of sin(30°)?', '√3/2', '1/2', '1/√2', '√3', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'mathematics' AND topic_name = 'Trigonometry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'What is the derivative of x³?', '3x', '3x²', 'x²', '2x²', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'mathematics' AND topic_name = 'Calculus' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'What is the mean of 2, 4, 6, 8, 10?', '5', '6', '7', '8', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'mathematics' AND topic_name = 'Statistics' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The slope of a line passing through (1,2) and (3,6) is:', '1', '2', '3', '4', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'mathematics' AND topic_name = 'Coordinate Geometry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Newton''s second law of motion states F =', 'mv', 'ma', 'mv²', 'm/a', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'physics' AND topic_name = 'Mechanics' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The SI unit of pressure is:', 'Newton', 'Pascal', 'Joule', 'Watt', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'physics' AND topic_name = 'Mechanics' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The speed of light in vacuum is approximately:', '3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'physics' AND topic_name = 'Optics' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Ohm''s law states V =', 'I/R', 'IR', 'I²R', 'R/I', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'physics' AND topic_name = 'Electricity' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The unit of magnetic flux density is:', 'Tesla', 'Weber', 'Henry', 'Gauss only', 'a', 'medium'
FROM public.cet_topics WHERE subject = 'physics' AND topic_name = 'Magnetism' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'What is the pH of pure water?', '0', '7', '14', '1', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'chemistry' AND topic_name = 'Physical Chemistry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The functional group of alcohols is:', '-COOH', '-OH', '-CHO', '-NH₂', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'chemistry' AND topic_name = 'Organic Chemistry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The atomic number of Carbon is:', '6', '12', '8', '14', 'a', 'medium'
FROM public.cet_topics WHERE subject = 'chemistry' AND topic_name = 'Inorganic Chemistry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Electrolysis of water produces:', 'H₂ and O₂', 'H₂ and Cl₂', 'O₂ and Cl₂', 'Only H₂', 'a', 'medium'
FROM public.cet_topics WHERE subject = 'chemistry' AND topic_name = 'Electrochemistry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'NaCl is an example of:', 'Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'chemistry' AND topic_name = 'Physical Chemistry' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Identify the correct sentence:', 'He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'english' AND topic_name = 'Grammar' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The synonym of "Abundant" is:', 'Scarce', 'Plentiful', 'Rare', 'Limited', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'english' AND topic_name = 'Vocabulary' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Which tense is used for habits?', 'Simple Past', 'Simple Present', 'Present Continuous', 'Past Perfect', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'english' AND topic_name = 'Grammar' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'The antonym of "Transparent" is:', 'Clear', 'Visible', 'Opaque', 'Bright', 'c', 'medium'
FROM public.cet_topics WHERE subject = 'english' AND topic_name = 'Vocabulary' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Which is the correct passive voice: "He writes a letter"?', 'A letter was written by him.', 'A letter is written by him.', 'A letter will be written by him.', 'A letter has been written by him.', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'english' AND topic_name = 'Grammar' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'If A is taller than B and B is taller than C, who is shortest?', 'A', 'B', 'C', 'Cannot determine', 'c', 'medium'
FROM public.cet_topics WHERE subject = 'general_aptitude' AND topic_name = 'Logical Reasoning' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'What is 15% of 200?', '20', '25', '30', '35', 'c', 'medium'
FROM public.cet_topics WHERE subject = 'general_aptitude' AND topic_name = 'Numerical Ability' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'Complete the series: 2, 4, 8, 16, __', '24', '32', '28', '20', 'b', 'medium'
FROM public.cet_topics WHERE subject = 'general_aptitude' AND topic_name = 'Numerical Ability' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'IMU stands for:', 'Indian Maritime University', 'International Maritime Union', 'Indian Marine Unit', 'International Marine University', 'a', 'medium'
FROM public.cet_topics WHERE subject = 'general_aptitude' AND topic_name = 'General Knowledge' LIMIT 1;

INSERT INTO public.cet_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
SELECT id, 'DGS stands for:', 'Director General of Shipping', 'Department of Global Seas', 'Directorate of Government Ships', 'Department of General Services', 'a', 'medium'
FROM public.cet_topics WHERE subject = 'general_aptitude' AND topic_name = 'General Knowledge' LIMIT 1;

-- SAMPLE COLLEGES
INSERT INTO public.colleges (slug, name, type, dgs_approval_status, city, state, imu_affiliated) VALUES
('ts-chanakya-mumbai', 'T.S. Chanakya', 'dgs_approved_private', 'approved', 'Mumbai', 'Maharashtra', false),
('tolani-maritime-pune', 'Tolani Maritime Institute', 'dgs_approved_private', 'approved', 'Pune', 'Maharashtra', true),
('imu-chennai', 'IMU Chennai Main Campus', 'imu_campus', 'approved', 'Chennai', 'Tamil Nadu', true),
('samundra-mumbai', 'Samundra Institute of Maritime Studies', 'dgs_approved_private', 'approved', 'Mumbai', 'Maharashtra', true),
('himt-chennai', 'HIMT College', 'dgs_approved_private', 'approved', 'Chennai', 'Tamil Nadu', false);

-- COLLEGE COURSES
INSERT INTO public.college_courses (college_id, course_id, annual_fee_inr, admission_type)
SELECT c.id, co.id, 350000, 'cet_only'
FROM public.colleges c, public.courses co
WHERE c.slug = 'ts-chanakya-mumbai' AND co.slug IN ('bsc-nautical-science', 'dns-diploma-nautical-science');

INSERT INTO public.college_courses (college_id, course_id, annual_fee_inr, admission_type)
SELECT c.id, co.id, 320000, 'cet_only'
FROM public.colleges c, public.courses co
WHERE c.slug = 'tolani-maritime-pune' AND co.slug IN ('bsc-nautical-science', 'be-btech-marine-engineering');

INSERT INTO public.college_courses (college_id, course_id, annual_fee_inr, admission_type)
SELECT c.id, co.id, 285000, 'cet_only'
FROM public.colleges c, public.courses co
WHERE c.slug = 'imu-chennai' AND co.slug IN ('bsc-nautical-science', 'dns-diploma-nautical-science', 'be-btech-marine-engineering');

INSERT INTO public.college_courses (college_id, course_id, annual_fee_inr, admission_type)
SELECT c.id, co.id, 300000, 'cet_only'
FROM public.colleges c, public.courses co
WHERE c.slug = 'samundra-mumbai' AND co.slug IN ('bsc-nautical-science', 'dns-diploma-nautical-science');

INSERT INTO public.college_courses (college_id, course_id, annual_fee_inr, admission_type)
SELECT c.id, co.id, 270000, 'cet_only'
FROM public.colleges c, public.courses co
WHERE c.slug = 'himt-chennai' AND co.slug IN ('dns-diploma-nautical-science', 'gp-rating');

-- KNOWLEDGE BASE
INSERT INTO public.knowledge_base (category, title, content, source_document, source_section, confidence_level) VALUES
('eligibility', 'B.Sc. Nautical Science Eligibility',
'To be eligible for B.Sc. Nautical Science, candidates must qualify in the IMU CET online examination. Academic qualification requires passing 12th Standard or equivalent with Physics, Chemistry, Mathematics and English as separate subjects with a PCM average of not less than 60%. The candidate must have secured minimum 50% marks in English language in 10th or 12th standard exam. The candidate must have passed the 10th and 12th standard from a recognized board. Maximum age is 25 years for General category candidates. SC/ST candidates get 5 years relaxation. OBC (NCL) candidates get 3 years relaxation. Women candidates get additional 2 years relaxation in each category.',
'DGS Training Circular No. 12 of 2020', 'Annexure 1, Page 1', 'high'),

('eligibility', 'BE/B-Tech Marine Engineering Eligibility (12th Route)',
'For BE/B-Tech Marine Engineering via the 12th standard route, candidates must be qualified in IMU CET. Pass in 12th standard or equivalent with Physics, Chemistry, Mathematics and English as separate subjects with PCM average of not less than 60%. Must have secured minimum 50% marks in English in 10th or 12th standard. Must have passed from recognized board. Maximum age 25 years General category. These candidates are exempted from appearing in all subjects of Part A of both MEO Class IV and MEO Class II grade examinations.',
'DGS Training Circular No. 12 of 2020', 'Annexure 1, Page 3', 'high'),

('eligibility', 'Graduate Marine Engineering (GME) Eligibility',
'For GME course, candidates need a BE/B-Tech in Mechanical Engineering with minimum 50% marks in final year. Must have secured minimum 50% marks in English in 10th, 12th or degree exam. The degree must be from AICTE approved institute, IIT, or University Engineering College directly run by a university. Maximum age is 28 years for General category. Candidates with pure Mechanical Engineering degree are exempted from all Part A subjects of MEO Class IV and MEO Class II exams.',
'DGS Training Circular No. 12 of 2020', 'Annexure 1, Page 8', 'high'),

('eligibility', 'ETO Eligibility',
'For Electro-Technical Officers course, candidates need a four-year BE/B-Tech degree with minimum 50% marks in Electrical Engineering, Electronics Engineering, Electrical and Electronics Engineering, Electronics and Telecommunication, or Electronics and Instrumentation. Must have 50% in English in 10th or 12th standard. If English below 50% in school, still eligible if 50% in degree and medium was English. Maximum age is 35 years for General category. Course duration is 4 months.',
'DGS Training Circular No. 12 of 2020', 'Annexure 1, Page 11', 'high'),

('eligibility', 'GP Rating Eligibility',
'For General Purpose Rating, candidates need to pass Class 10 with aggregate 40% marks with Science and Mathematics as subjects. Must have secured minimum 40% marks in English in 10th standard. Minimum age is 17.5 years and maximum age is 25 years for General category. Alternatively, candidates with 2-year ITI from Government approved institute with 50% aggregate are also eligible. Diploma or degree holders are also eligible with maximum age raised to 27 years provided shipboard training is given within one year of course completion.',
'DGS Training Circular No. 12 of 2020', 'Annexure 1, Page 13', 'high'),

('cet', 'IMU CET Exam Pattern',
'The IMU CET is a 3-hour online examination with 200 questions carrying 200 marks. Subjects are: Mathematics 50 questions 50 marks, Physics 50 questions 50 marks, Chemistry 20 questions 20 marks, English 40 questions 40 marks, General Aptitude 40 questions 40 marks. There is NO negative marking. The syllabus is based on CBSE/ICSE/State Board curriculum. Registration fee is Rs 1000. The exam is conducted in the first week of June preferably on a Saturday. Exam centers are in 36 cities across India.',
'DGS Training Circular No. 12 of 2020', 'Annexure 2, Page 4', 'high'),

('cet', 'IMU CET Eligibility and Age Limits',
'To appear for IMU CET, candidates must have passed 12th standard from a recognized board with minimum 60% in PCM. Candidates with results awaited may also apply. Must have minimum 50% in English in 10th or 12th standard. Age limits as on course commencement date: General category maximum 25 years, SC/ST maximum 30 years, OBC NCL maximum 28 years, Women get additional 2 years relaxation in each category.',
'DGS Training Circular No. 12 of 2020', 'Annexure 2, Page 2-3', 'high'),

('career', 'Deck Officer Career Progression',
'A deck officer career starts as Deck Cadet after completing B.Sc. Nautical Science or DNS. After 12 months sea time, candidates appear for Class II CoC to become 3rd Officer earning approximately $1500 to $2500 per month. With more sea time, progression is to 2nd Officer earning $2500 to $4000, then Chief Officer earning $4500 to $7000, and finally Master or Captain earning $8000 to $15000 per month. Total time to Captain is approximately 12 to 18 years from joining as cadet.',
'Maritime AI Guide Knowledge Base', 'Career Progression Data', 'medium'),

('career', 'Engine Officer Career Progression',
'Engine officer career starts as Engine Cadet or 4th Engineer after completing BE Marine Engineering or GME. Progression is 4th Engineer earning $1800 to $3000, then 3rd Engineer earning $2500 to $4000 after MEO Class IV exam, then 2nd Engineer earning $4000 to $6500 after MEO Class II exam, and finally Chief Engineer earning $8000 to $20000 per month after MEO Class I. LNG and chemical tanker Chief Engineers can earn $15000 to $20000 per month. Total time approximately 12 to 16 years.',
'Maritime AI Guide Knowledge Base', 'Career Progression Data', 'medium'),

('eligibility', 'Age Relaxation Rules for All Courses',
'The maximum age limits for all maritime courses are subject to relaxation as follows. Scheduled Caste SC and Scheduled Tribe ST candidates get 5 years relaxation on the maximum age limit. Non-creamy layer Other Backward Classes OBC candidates get 3 years relaxation. Women candidates of each category get an additional 2 years relaxation on top of their category relaxation. A SC woman therefore gets 7 years total relaxation. All age limits are calculated as on the date of commencement of the pre-sea maritime course, not the date of application. Candidates from Lakshadweep and Andaman and Nicobar Islands belonging to Scheduled Tribes get 5% relaxation in English marks requirement.',
'DGS Training Circular No. 12 of 2020', 'Section 12.1.4', 'high');
