/*
# Seed Reference Data: Skills, Careers, Career-Skills, Assessment Questions

1. Inserts master data for skills (20+), careers (10), career-skill mappings, and assessment questions (30).
2. All inserts use ON CONFLICT DO NOTHING for idempotency.
3. This is reference/demo data for the career guidance system.
*/

-- ============================================================
-- SKILLS (20+)
-- ============================================================
INSERT INTO skills (name, category, description) VALUES
('Python', 'technical', 'Programming language for data, scripting, and automation'),
('SQL', 'technical', 'Database querying language'),
('Java', 'technical', 'Object-oriented programming language'),
('JavaScript', 'technical', 'Web programming language'),
('React', 'technical', 'Frontend JavaScript library'),
('Node.js', 'technical', 'Server-side JavaScript runtime'),
('Machine Learning', 'technical', 'AI/ML model development and training'),
('Deep Learning', 'technical', 'Neural networks and deep learning frameworks'),
('Statistics', 'technical', 'Statistical analysis and probability'),
('Data Visualization', 'technical', 'Visual representation of data'),
('Excel', 'technical', 'Spreadsheet analysis and reporting'),
('Power BI', 'technical', 'Business intelligence and dashboards'),
('Cloud Computing', 'technical', 'AWS, Azure, GCP cloud platforms'),
('Cybersecurity', 'technical', 'Network security, encryption, threat analysis'),
('UI/UX Design', 'technical', 'User interface and experience design'),
('Digital Marketing', 'technical', 'SEO, SEM, social media marketing'),
('Project Management', 'soft', 'Planning, organizing, and managing projects'),
('Communication', 'soft', 'Verbal and written communication'),
('Leadership', 'soft', 'Leading teams and initiatives'),
('Problem Solving', 'soft', 'Analytical thinking and problem resolution'),
('Critical Thinking', 'soft', 'Evaluating information and making decisions'),
('Teamwork', 'soft', 'Collaboration and team contribution'),
('C++', 'technical', 'Systems programming language'),
('Tableau', 'technical', 'Data visualization and business intelligence'),
('TensorFlow', 'technical', 'Machine learning framework'),
('Docker', 'technical', 'Containerization platform'),
('Git', 'technical', 'Version control system'),
('HTML/CSS', 'technical', 'Web markup and styling'),
('Agriculture Technology', 'technical', 'Tech solutions for agriculture and farming'),
('Business Analysis', 'technical', 'Business process analysis and optimization')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- CAREERS (10)
-- ============================================================
INSERT INTO careers (name, category, description, required_skills, recommended_education, typical_projects, related_careers, growth_outlook, avg_salary) VALUES
('Software Developer', 'Software Development', 'Designs, develops, and maintains software applications using programming languages and frameworks.', ARRAY['Python','Java','JavaScript','React','Node.js','Git','HTML/CSS','Docker'], 'B.Tech in Computer Science or related field', ARRAY['E-commerce web app','Task management system','API development'], ARRAY['Full Stack Developer','Backend Developer','Mobile Developer'], 'High demand, 22% growth projected', '$70,000 - $120,000'),
('Data Analyst', 'Data Analytics', 'Analyzes data to help organizations make better business decisions through visualization and reporting.', ARRAY['Python','SQL','Excel','Statistics','Power BI','Tableau','Data Visualization'], 'B.Tech/BCA/MSc in Data Science or Statistics', ARRAY['Sales dashboard','Customer segmentation analysis','Trend forecasting report'], ARRAY['Business Analyst','Data Scientist','BI Developer'], 'Strong demand, 25% growth projected', '$60,000 - $95,000'),
('Data Scientist', 'Data Science', 'Builds predictive models and extracts insights from complex data using ML and statistical methods.', ARRAY['Python','SQL','Machine Learning','Statistics','Deep Learning','TensorFlow','Data Visualization'], 'M.Tech/MSc in Data Science or Computer Science', ARRAY['Predictive model for churn','Recommendation engine','NLP sentiment analysis'], ARRAY['ML Engineer','Data Analyst','AI Researcher'], 'Very high demand, 36% growth projected', '$90,000 - $160,000'),
('AI Engineer', 'Artificial Intelligence', 'Develops AI systems including NLP, computer vision, and intelligent automation solutions.', ARRAY['Python','Machine Learning','Deep Learning','TensorFlow','Statistics','C++'], 'M.Tech in AI/ML or Computer Science', ARRAY['Chatbot system','Image classification model','AI-powered assistant'], ARRAY['ML Engineer','Data Scientist','NLP Engineer'], 'Explosive growth, 40%+ growth projected', '$100,000 - $180,000'),
('Cybersecurity Analyst', 'Cybersecurity', 'Protects systems and networks from security threats, vulnerabilities, and cyber attacks.', ARRAY['Cybersecurity','Python','Networking','Linux','Cryptography'], 'B.Tech in Cybersecurity or Computer Science', ARRAY['Security audit tool','Penetration testing framework','Threat detection system'], ARRAY['Security Engineer','Penetration Tester','Security Consultant'], 'Critical demand, 32% growth projected', '$80,000 - $140,000'),
('Cloud Engineer', 'Cloud Computing', 'Designs, deploys, and manages cloud infrastructure and services on platforms like AWS, Azure, GCP.', ARRAY['Cloud Computing','Docker','Python','Linux','Networking','Git'], 'B.Tech in Computer Science or Cloud certification', ARRAY['Cloud migration project','Auto-scaling infrastructure','CI/CD pipeline'], ARRAY['DevOps Engineer','Cloud Architect','Site Reliability Engineer'], 'High demand, 28% growth projected', '$85,000 - $150,000'),
('UI/UX Designer', 'UI/UX', 'Creates user-centered designs for digital products combining aesthetics, usability, and research.', ARRAY['UI/UX Design','HTML/CSS','JavaScript','Figma','User Research'], 'Degree in Design or HCI certification', ARRAY['Mobile app redesign','Design system creation','User research study'], ARRAY['Product Designer','UX Researcher','Interaction Designer'], 'Growing demand, 15% growth projected', '$60,000 - $110,000'),
('Digital Marketing Specialist', 'Digital Marketing', 'Promotes brands and products through digital channels including SEO, social media, and content marketing.', ARRAY['Digital Marketing','Content Creation','SEO','Analytics','Social Media'], 'Degree in Marketing or Digital Marketing certification', ARRAY['SEO campaign','Social media strategy','Content marketing funnel'], ARRAY['Growth Marketer','Content Strategist','Marketing Analyst'], 'Strong growth, 10% growth projected', '$45,000 - $85,000'),
('Business Analyst', 'Business Analytics', 'Bridges business and IT by analyzing processes, gathering requirements, and recommending solutions.', ARRAY['Business Analysis','SQL','Excel','Power BI','Communication','Project Management'], 'MBA or B.Tech with Business Analysis certification', ARRAY['Process optimization study','Requirements documentation','Stakeholder analysis report'], ARRAY['Product Manager','Data Analyst','Project Manager'], 'Steady demand, 14% growth projected', '$65,000 - $115,000'),
('Agriculture Technology Specialist', 'Agriculture Technology', 'Applies technology to improve agricultural productivity, sustainability, and supply chain efficiency.', ARRAY['Agriculture Technology','Python','IoT','Data Visualization','Machine Learning'], 'B.Tech in Agriculture Engineering or related field', ARRAY['Smart irrigation system','Crop yield prediction model','Farm monitoring dashboard'], ARRAY['Agri Data Analyst','IoT Engineer','Precision Agriculture Specialist'], 'Emerging field, 20% growth projected', '$55,000 - $100,000')
ON CONFLICT DO NOTHING;

-- ============================================================
-- CAREER SKILLS MAPPINGS
-- ============================================================
INSERT INTO career_skills (career_id, skill_id, importance)
SELECT c.id, s.id, v.imp FROM (VALUES
('Software Developer', 'Python', 8),
('Software Developer', 'Java', 7),
('Software Developer', 'JavaScript', 9),
('Software Developer', 'React', 8),
('Software Developer', 'Node.js', 7),
('Software Developer', 'Git', 8),
('Software Developer', 'HTML/CSS', 8),
('Software Developer', 'Docker', 6),
('Software Developer', 'Problem Solving', 9),
('Software Developer', 'Teamwork', 7),
('Data Analyst', 'Python', 8),
('Data Analyst', 'SQL', 9),
('Data Analyst', 'Excel', 8),
('Data Analyst', 'Statistics', 7),
('Data Analyst', 'Power BI', 7),
('Data Analyst', 'Tableau', 7),
('Data Analyst', 'Data Visualization', 8),
('Data Analyst', 'Communication', 6),
('Data Scientist', 'Python', 9),
('Data Scientist', 'SQL', 7),
('Data Scientist', 'Machine Learning', 10),
('Data Scientist', 'Statistics', 9),
('Data Scientist', 'Deep Learning', 8),
('Data Scientist', 'TensorFlow', 7),
('Data Scientist', 'Data Visualization', 7),
('AI Engineer', 'Python', 9),
('AI Engineer', 'Machine Learning', 10),
('AI Engineer', 'Deep Learning', 9),
('AI Engineer', 'TensorFlow', 8),
('AI Engineer', 'Statistics', 8),
('AI Engineer', 'C++', 6),
('Cybersecurity Analyst', 'Cybersecurity', 10),
('Cybersecurity Analyst', 'Python', 6),
('Cybersecurity Analyst', 'Problem Solving', 9),
('Cybersecurity Analyst', 'Critical Thinking', 8),
('Cloud Engineer', 'Cloud Computing', 10),
('Cloud Engineer', 'Docker', 8),
('Cloud Engineer', 'Python', 7),
('Cloud Engineer', 'Git', 7),
('Cloud Engineer', 'Problem Solving', 8),
('UI/UX Designer', 'UI/UX Design', 10),
('UI/UX Designer', 'HTML/CSS', 7),
('UI/UX Designer', 'JavaScript', 6),
('UI/UX Designer', 'Communication', 8),
('UI/UX Designer', 'Creativity', 9),
('Digital Marketing Specialist', 'Digital Marketing', 10),
('Digital Marketing Specialist', 'Communication', 8),
('Digital Marketing Specialist', 'Creativity', 7),
('Business Analyst', 'Business Analysis', 10),
('Business Analyst', 'SQL', 7),
('Business Analyst', 'Excel', 8),
('Business Analyst', 'Power BI', 7),
('Business Analyst', 'Communication', 9),
('Business Analyst', 'Project Management', 7),
('Agriculture Technology Specialist', 'Agriculture Technology', 10),
('Agriculture Technology Specialist', 'Python', 7),
('Agriculture Technology Specialist', 'Data Visualization', 6),
('Agriculture Technology Specialist', 'Machine Learning', 7)
) AS v(career, skill, imp)
JOIN careers c ON c.name = v.career
JOIN skills s ON s.name = v.skill
ON CONFLICT (career_id, skill_id) DO NOTHING;

-- ============================================================
-- ASSESSMENT QUESTIONS (30 questions, 10 categories)
-- ============================================================
INSERT INTO assessment_questions (question, category) VALUES
('I enjoy writing code and building software applications.', 'Programming'),
('I like solving complex algorithmic problems.', 'Programming'),
('I am interested in learning new programming languages.', 'Programming'),
('I enjoy working with data and finding patterns in it.', 'Analytical Thinking'),
('I can break down complex problems into smaller, manageable parts.', 'Analytical Thinking'),
('I like analyzing data to make informed decisions.', 'Analytical Thinking'),
('I enjoy coming up with creative solutions to problems.', 'Creativity'),
('I like designing visual concepts and user interfaces.', 'Creativity'),
('I think of myself as an innovative person.', 'Creativity'),
('I can communicate my ideas clearly to others.', 'Communication'),
('I enjoy giving presentations or speaking in front of groups.', 'Communication'),
('I am good at writing reports and documentation.', 'Communication'),
('I enjoy leading a team and taking responsibility for outcomes.', 'Leadership'),
('I can motivate others to achieve their goals.', 'Leadership'),
('I am comfortable making decisions in uncertain situations.', 'Leadership'),
('I enjoy solving mathematical problems and equations.', 'Mathematics'),
('I am comfortable with probability and statistics.', 'Mathematics'),
('I can quickly perform mental calculations and numerical reasoning.', 'Mathematics'),
('I am interested in artificial intelligence and machine learning.', 'Technical Interests'),
('I enjoy exploring new technologies and tech trends.', 'Technical Interests'),
('I like working with databases and managing data.', 'Technical Interests'),
('I am interested in how businesses operate and grow.', 'Business/Management'),
('I enjoy planning and organizing projects from start to finish.', 'Business/Management'),
('I am interested in marketing and understanding consumer behavior.', 'Business/Management'),
('I am interested in applying technology to agriculture and farming.', 'Agriculture/Technology'),
('I think technology can solve important problems in food production.', 'Agriculture/Technology'),
('I enjoy working with IoT devices and sensor data.', 'Agriculture/Technology'),
('I like protecting systems and finding security vulnerabilities.', 'Problem Solving'),
('I enjoy troubleshooting and debugging issues.', 'Problem Solving'),
('I stay calm and focused when facing difficult challenges.', 'Problem Solving')
ON CONFLICT DO NOTHING;
