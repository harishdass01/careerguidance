/*
# Seed Learning Roadmaps, Projects, and Certifications

1. Inserts learning roadmap phases for 10 careers (5-7 phases each)
2. Inserts suggested projects for each career
3. Inserts recommended certifications for each career
4. Uses ON CONFLICT DO NOTHING for idempotency
*/

-- ============================================================
-- LEARNING ROADMAPS
-- ============================================================
INSERT INTO learning_roadmaps (career_name, phase_number, phase_title, objectives, skills, resources, project_task) VALUES
-- Software Developer
('Software Developer', 1, 'Programming Fundamentals', ARRAY['Master basic syntax and control structures','Understand OOP concepts','Learn data structures'], ARRAY['Python','Java'], '[{"title":"Python for Everybody","url":"https://www.coursera.org/specializations/python"},{"title":"Java Programming Basics","url":"https://www.udemy.com/java-tutorial"}]'::jsonb, 'Build a console-based calculator application'),
('Software Developer', 2, 'Web Development Basics', ARRAY['Learn HTML, CSS, JavaScript','Understand DOM manipulation','Build responsive layouts'], ARRAY['HTML/CSS','JavaScript'], '[{"title":"The Odin Project","url":"https://www.theodinproject.com"},{"title":"freeCodeCamp Responsive Web Design","url":"https://www.freecodecamp.org"}]'::jsonb, 'Create a personal portfolio website'),
('Software Developer', 3, 'Frontend Framework', ARRAY['Learn React fundamentals','Component-based architecture','State management'], ARRAY['React'], '[{"title":"React Official Docs","url":"https://react.dev"},{"title":"Full Modern React Tutorial","url":"https://www.udemy.com/react-tutorial"}]'::jsonb, 'Build a task management app with React'),
('Software Developer', 4, 'Backend Development', ARRAY['Learn Node.js and Express','REST API design','Database integration'], ARRAY['Node.js','SQL'], '[{"title":"Node.js Mastery","url":"https://www.udemy.com/nodejs-course"},{"title":"Express.js Guide","url":"https://expressjs.com"}]'::jsonb, 'Create a RESTful API with CRUD operations'),
('Software Developer', 5, 'Version Control & Deployment', ARRAY['Master Git workflows','Learn CI/CD basics','Deploy applications'], ARRAY['Git','Docker'], '[{"title":"Pro Git Book","url":"https://git-scm.com/book"},{"title":"Docker Getting Started","url":"https://docs.docker.com/get-started/"}]'::jsonb, 'Set up a CI/CD pipeline for your project'),
('Software Developer', 6, 'Real-World Projects', ARRAY['Build full-stack applications','Work with teams','Code reviews'], ARRAY['React','Node.js','Git'], '[{"title":"Build a Full-Stack App","url":"https://www.youtube.com"}]'::jsonb, 'Build an e-commerce web application'),
('Software Developer', 7, 'Resume & Interview Prep', ARRAY['Prepare technical resume','Practice coding interviews','System design basics'], ARRAY['Problem Solving'], '[{"title":"LeetCode","url":"https://leetcode.com"},{"title":"System Design Primer","url":"https://github.com/donnemartin/system-design-primer"}]'::jsonb, 'Complete 50 LeetCode problems and mock interviews'),

-- Data Analyst
('Data Analyst', 1, 'Python Fundamentals', ARRAY['Learn Python syntax','Data structures','Basic scripting'], ARRAY['Python'], '[{"title":"Python for Data Analysis","url":"https://www.coursera.org"}]'::jsonb, 'Write Python scripts for data manipulation'),
('Data Analyst', 2, 'SQL & Databases', ARRAY['Learn SQL queries','Joins and aggregations','Database design'], ARRAY['SQL'], '[{"title":"SQLBolt","url":"https://sqlbolt.com"},{"title":"Mode SQL Tutorial","url":"https://mode.com/sql-tutorial"}]'::jsonb, 'Create a database and write complex queries'),
('Data Analyst', 3, 'Statistics for Analytics', ARRAY['Descriptive statistics','Probability distributions','Hypothesis testing'], ARRAY['Statistics'], '[{"title":"Khan Academy Statistics","url":"https://www.khanacademy.org/math/statistics-probability"}]'::jsonb, 'Perform statistical analysis on a dataset'),
('Data Analyst', 4, 'Excel & Power BI', ARRAY['Advanced Excel functions','Pivot tables','Power BI dashboards'], ARRAY['Excel','Power BI'], '[{"title":"Excel Skills for Business","url":"https://www.coursera.org"},{"title":"Power BI Learning Path","url":"https://learn.microsoft.com/power-bi"}]'::jsonb, 'Build an interactive sales dashboard in Power BI'),
('Data Analyst', 5, 'Data Visualization', ARRAY['Principles of visualization','Charts and graphs','Storytelling with data'], ARRAY['Data Visualization','Tableau'], '[{"title":"Tableau Public","url":"https://public.tableau.com"},{"title":"Data Visualization with Python","url":"https://www.coursera.org"}]'::jsonb, 'Create a comprehensive data visualization report'),
('Data Analyst', 6, 'Real-World Projects', ARRAY['End-to-end data analysis','Business problem solving','Report writing'], ARRAY['Python','SQL','Power BI'], '[{"title":"Kaggle Datasets","url":"https://www.kaggle.com/datasets"}]'::jsonb, 'Analyze a real dataset and present insights'),
('Data Analyst', 7, 'Resume & Interview Prep', ARRAY['Portfolio preparation','SQL interview practice','Case study interviews'], ARRAY['Communication'], '[{"title":"Data Analyst Interview Guide","url":"https://www.interviewquery.com"}]'::jsonb, 'Prepare a data analyst portfolio with 3 projects'),

-- Data Scientist
('Data Scientist', 1, 'Python & Data Handling', ARRAY['Python for data science','Pandas and NumPy','Data cleaning'], ARRAY['Python'], '[{"title":"Python for Data Science","url":"https://www.coursera.org"}]'::jsonb, 'Clean and prepare a messy dataset using Pandas'),
('Data Scientist', 2, 'Statistics & Mathematics', ARRAY['Linear algebra fundamentals','Probability theory','Statistical inference'], ARRAY['Statistics'], '[{"title":"Statistical Learning","url":"https://www.statlearning.com"}]'::jsonb, 'Solve statistical problems and prove theorems'),
('Data Scientist', 3, 'Machine Learning Basics', ARRAY['Supervised learning','Unsupervised learning','Model evaluation'], ARRAY['Machine Learning'], '[{"title":"Andrew Ng ML Course","url":"https://www.coursera.org/specializations/machine-learning"}]'::jsonb, 'Build a classification model from scratch'),
('Data Scientist', 4, 'Deep Learning', ARRAY['Neural networks','TensorFlow/Keras','Computer vision or NLP'], ARRAY['Deep Learning','TensorFlow'], '[{"title":"Deep Learning Specialization","url":"https://www.coursera.org/specializations/deep-learning"}]'::jsonb, 'Build a neural network for image classification'),
('Data Scientist', 5, 'SQL & Big Data', ARRAY['Advanced SQL','Big data tools','Data pipelines'], ARRAY['SQL'], '[{"title":"Data Engineering Essentials","url":"https://www.coursera.org"}]'::jsonb, 'Build a data pipeline for large-scale data'),
('Data Scientist', 6, 'Real-World Projects', ARRAY['End-to-end ML projects','Kaggle competitions','Model deployment'], ARRAY['Python','Machine Learning'], '[{"title":"Kaggle","url":"https://www.kaggle.com"}]'::jsonb, 'Complete a Kaggle competition with top 20% score'),
('Data Scientist', 7, 'Resume & Interview Prep', ARRAY['ML system design','Portfolio preparation','Technical interview practice'], ARRAY['Communication'], '[{"title":"ML Interview Prep","url":"https://www.interviewquery.com"}]'::jsonb, 'Build a portfolio with 3 ML projects and deploy one'),

-- AI Engineer
('AI Engineer', 1, 'Programming Foundations', ARRAY['Master Python','Data structures','Algorithms'], ARRAY['Python'], '[{"title":"Python for AI","url":"https://www.coursera.org"}]'::jsonb, 'Implement basic algorithms in Python'),
('AI Engineer', 2, 'Mathematics for AI', ARRAY['Linear algebra','Calculus','Probability'], ARRAY['Statistics'], '[{"title":"Mathematics for Machine Learning","url":"https://www.coursera.org/specializations/mathematics-machine-learning"}]'::jsonb, 'Solve linear algebra and calculus problems'),
('AI Engineer', 3, 'Machine Learning', ARRAY['Supervised and unsupervised learning','Model selection','Feature engineering'], ARRAY['Machine Learning'], '[{"title":"ML by Andrew Ng","url":"https://www.coursera.org/specializations/machine-learning"}]'::jsonb, 'Build and optimize ML models'),
('AI Engineer', 4, 'Deep Learning & Neural Networks', ARRAY['CNNs, RNNs, Transformers','TensorFlow','PyTorch'], ARRAY['Deep Learning','TensorFlow'], '[{"title":"Deep Learning Specialization","url":"https://www.coursera.org/specializations/deep-learning"}]'::jsonb, 'Build a deep learning model for image or text data'),
('AI Engineer', 5, 'Specialized AI Domains', ARRAY['NLP or Computer Vision','Reinforcement learning','AI ethics'], ARRAY['Machine Learning'], '[{"title":"NLP Specialization","url":"https://www.coursera.org/specializations/natural-language-processing"}]'::jsonb, 'Build an NLP or computer vision application'),
('AI Engineer', 6, 'AI System Design & Deployment', ARRAY['Model deployment','MLOps','Scalable AI systems'], ARRAY['Docker'], '[{"title":"MLOps Specialization","url":"https://www.coursera.org/specializations/mlops-machine-learning-production"}]'::jsonb, 'Deploy an AI model as a web service'),
('AI Engineer', 7, 'Resume & Interview Prep', ARRAY['AI portfolio','Technical interviews','Research paper reading'], ARRAY['Communication'], '[{"title":"AI Interview Guide","url":"https://www.interviewquery.com"}]'::jsonb, 'Complete an end-to-end AI project and write a blog post'),

-- Cybersecurity Analyst
('Cybersecurity Analyst', 1, 'IT & Networking Fundamentals', ARRAY['Network protocols','OSI model','Operating systems'], ARRAY['Networking'], '[{"title":"CompTIA Network+","url":"https://www.comptia.org"}]'::jsonb, 'Set up a home lab network'),
('Cybersecurity Analyst', 2, 'Security Fundamentals', ARRAY['CIA triad','Threat types','Security policies'], ARRAY['Cybersecurity'], '[{"title":"CompTIA Security+","url":"https://www.comptia.org"}]'::jsonb, 'Conduct a basic security assessment'),
('Cybersecurity Analyst', 3, 'Linux & Scripting', ARRAY['Linux administration','Bash scripting','Python for security'], ARRAY['Python','Linux'], '[{"title":"Linux Journey","url":"https://linuxjourney.com"}]'::jsonb, 'Write a Python script for log analysis'),
('Cybersecurity Analyst', 4, 'Ethical Hacking & Penetration Testing', ARRAY['Vulnerability assessment','Pen testing tools','Exploitation basics'], ARRAY['Cybersecurity'], '[{"title":"TryHackMe","url":"https://tryhackme.com"},{"title":"HackTheBox","url":"https://www.hackthebox.com"}]'::jsonb, 'Complete a penetration testing lab'),
('Cybersecurity Analyst', 5, 'Security Tools & SIEM', ARRAY['SIEM platforms','IDS/IPS','Incident response'], ARRAY['Cybersecurity'], '[{"title":"Splunk Free Training","url":"https://www.splunk.com"}]'::jsonb, 'Set up a SIEM dashboard for threat monitoring'),
('Cybersecurity Analyst', 6, 'Real-World Projects', ARRAY['Security audits','CTF competitions','Threat modeling'], ARRAY['Problem Solving'], '[{"title":"CTFtime","url":"https://ctftime.org"}]'::jsonb, 'Participate in a CTF competition'),
('Cybersecurity Analyst', 7, 'Resume & Certification Prep', ARRAY['Security certifications','Interview prep','Portfolio'], ARRAY['Communication'], '[{"title":"Security+ Certification","url":"https://www.comptia.org"}]'::jsonb, 'Get CompTIA Security+ certified'),

-- Cloud Engineer
('Cloud Engineer', 1, 'Networking & OS Fundamentals', ARRAY['TCP/IP','Linux basics','System administration'], ARRAY['Linux'], '[{"title":"Linux Foundation Courses","url":"https://training.linuxfoundation.org"}]'::jsonb, 'Set up a Linux server and configure networking'),
('Cloud Engineer', 2, 'Cloud Platform Basics', ARRAY['AWS/Azure/GCP fundamentals','Compute and storage services','Networking in the cloud'], ARRAY['Cloud Computing'], '[{"title":"AWS Cloud Practitioner","url":"https://aws.amazon.com/training/learn-about/cloud-practitioner/"}]'::jsonb, 'Deploy a virtual machine on a cloud platform'),
('Cloud Engineer', 3, 'Containerization', ARRAY['Docker fundamentals','Docker Compose','Container orchestration'], ARRAY['Docker'], '[{"title":"Docker Official Tutorial","url":"https://docs.docker.com/get-started/"}]'::jsonb, 'Containerize a multi-service application'),
('Cloud Engineer', 4, 'Infrastructure as Code', ARRAY['Terraform basics','CloudFormation','Automation scripts'], ARRAY['Git'], '[{"title":"Terraform Getting Started","url":"https://developer.hashicorp.com/terraform/tutorials"}]'::jsonb, 'Provision cloud infrastructure with Terraform'),
('Cloud Engineer', 5, 'CI/CD & DevOps', ARRAY['Pipeline creation','Automated deployments','Monitoring'], ARRAY['Git'], '[{"title":"GitHub Actions","url":"https://docs.github.com/en/actions"}]'::jsonb, 'Build a CI/CD pipeline for a cloud application'),
('Cloud Engineer', 6, 'Real-World Projects', ARRAY['Multi-tier cloud architecture','Cost optimization','Security best practices'], ARRAY['Cloud Computing','Docker'], '[{"title":"AWS Architecture Center","url":"https://aws.amazon.com/architecture/"}]'::jsonb, 'Design and deploy a scalable web application architecture'),
('Cloud Engineer', 7, 'Resume & Certification Prep', ARRAY['Cloud certifications','Interview prep','Hands-on labs'], ARRAY['Communication'], '[{"title":"AWS Solutions Architect","url":"https://aws.amazon.com/certification/"}]'::jsonb, 'Get an AWS or Azure certification'),

-- UI/UX Designer
('UI/UX Designer', 1, 'Design Fundamentals', ARRAY['Color theory','Typography','Layout principles'], ARRAY['UI/UX Design'], '[{"title":"Google UX Design Certificate","url":"https://www.coursera.org/professional-certificates/google-ux"}]'::jsonb, 'Create a color palette and typography system'),
('UI/UX Designer', 2, 'User Research', ARRAY['User interviews','Surveys','Personas and journey maps'], ARRAY['UI/UX Design'], '[{"title":"NNGroup Articles","url":"https://www.nngroup.com/articles/"}]'::jsonb, 'Conduct user research for a mobile app concept'),
('UI/UX Designer', 3, 'Wireframing & Prototyping', ARRAY['Low-fidelity wireframes','Figma basics','Interactive prototypes'], ARRAY['UI/UX Design'], '[{"title":"Figma Academy","url":"https://www.figma.com/academy/"}]'::jsonb, 'Create wireframes and a clickable prototype'),
('UI/UX Designer', 4, 'Visual Design', ARRAY['High-fidelity mockups','Design systems','Accessibility'], ARRAY['UI/UX Design'], '[{"title":"Design Systems Guide","url":"https://www.designsystems.com"}]'::jsonb, 'Design a complete app interface in Figma'),
('UI/UX Designer', 5, 'Frontend Basics', ARRAY['HTML/CSS','Responsive design','Basic JavaScript'], ARRAY['HTML/CSS','JavaScript'], '[{"title":"freeCodeCamp","url":"https://www.freecodecamp.org"}]'::jsonb, 'Code a responsive landing page from your design'),
('UI/UX Designer', 6, 'Real-World Projects', ARRAY['End-to-end design project','Portfolio case studies','Design critique'], ARRAY['UI/UX Design'], '[{"title":"Behance","url":"https://www.behance.net"}]'::jsonb, 'Complete a full UX case study for a product'),
('UI/UX Designer', 7, 'Resume & Portfolio Prep', ARRAY['Portfolio website','Interview preparation','Design challenges'], ARRAY['Communication'], '[{"title":"UX Portfolio Guide","url":"https://www.uxbeginner.com"}]'::jsonb, 'Build a portfolio website with 3 case studies'),

-- Digital Marketing Specialist
('Digital Marketing Specialist', 1, 'Marketing Fundamentals', ARRAY['Marketing principles','Consumer behavior','Brand strategy'], ARRAY['Digital Marketing'], '[{"title":"Google Digital Marketing","url":"https://learndigital.withgoogle.com"}]'::jsonb, 'Create a marketing plan for a fictional brand'),
('Digital Marketing Specialist', 2, 'SEO & Content Marketing', ARRAY['Keyword research','On-page SEO','Content strategy'], ARRAY['Digital Marketing'], '[{"title":"Moz SEO Guide","url":"https://moz.com/beginners-guide-to-seo"}]'::jsonb, 'Optimize a website for search engines'),
('Digital Marketing Specialist', 3, 'Social Media Marketing', ARRAY['Platform strategies','Content calendar','Community management'], ARRAY['Digital Marketing'], '[{"title":"HubSpot Academy","url":"https://academy.hubspot.com"}]'::jsonb, 'Create a month-long social media content calendar'),
('Digital Marketing Specialist', 4, 'Paid Advertising', ARRAY['Google Ads','Facebook Ads','PPM strategy'], ARRAY['Digital Marketing'], '[{"title":"Google Ads Certification","url":"https://skillshop.exceedlms.com"}]'::jsonb, 'Set up and optimize a Google Ads campaign'),
('Digital Marketing Specialist', 5, 'Analytics & Data', ARRAY['Google Analytics','Conversion tracking','A/B testing'], ARRAY['Data Visualization'], '[{"title":"Google Analytics Academy","url":"https://analytics.google.com/analytics/academy/"}]'::jsonb, 'Set up Google Analytics and create reports'),
('Digital Marketing Specialist', 6, 'Real-World Projects', ARRAY['Full marketing campaign','Growth experiments','Marketing audit'], ARRAY['Digital Marketing'], '[{"title":"Marketing Examples","url":"https://marketingexamples.com"}]'::jsonb, 'Run a complete digital marketing campaign'),
('Digital Marketing Specialist', 7, 'Resume & Certification Prep', ARRAY['Marketing certifications','Portfolio building','Interview prep'], ARRAY['Communication'], '[{"title":"HubSpot Certifications","url":"https://academy.hubspot.com"}]'::jsonb, 'Get Google Ads and HubSpot certifications'),

-- Business Analyst
('Business Analyst', 1, 'Business Fundamentals', ARRAY['Business processes','Industry analysis','Stakeholder management'], ARRAY['Business Analysis'], '[{"title":"Business Analysis Foundations","url":"https://www.linkedin.com/learning"}]'::jsonb, 'Map a business process for a retail company'),
('Business Analyst', 2, 'Data Analysis Tools', ARRAY['Excel advanced functions','Pivot tables','Data cleaning'], ARRAY['Excel'], '[{"title":"Excel Skills for Business","url":"https://www.coursera.org"}]'::jsonb, 'Build a financial model in Excel'),
('Business Analyst', 3, 'SQL & Databases', ARRAY['SQL queries','Data extraction','Reporting'], ARRAY['SQL'], '[{"title":"SQL for Business Analysis","url":"https://www.udemy.com"}]'::jsonb, 'Write SQL queries for business reporting'),
('Business Analyst', 4, 'BI & Visualization', ARRAY['Power BI dashboards','Data storytelling','Executive reporting'], ARRAY['Power BI'], '[{"title":"Power BI Learning","url":"https://learn.microsoft.com/power-bi"}]'::jsonb, 'Create an executive dashboard in Power BI'),
('Business Analyst', 5, 'Requirements & Documentation', ARRAY['Requirements gathering','BRDs and FRDs','User stories'], ARRAY['Communication'], '[{"title":"IIBA Business Analysis","url":"https://www.iiba.org"}]'::jsonb, 'Write a complete Business Requirements Document'),
('Business Analyst', 6, 'Real-World Projects', ARRAY['End-to-end analysis project','Process improvement','Case studies'], ARRAY['Business Analysis','Power BI'], '[{"title":"Business Analysis Case Studies","url":"https://www.iiba.org"}]'::jsonb, 'Analyze a business problem and propose solutions'),
('Business Analyst', 7, 'Resume & Certification Prep', ARRAY['BABOK guide','ECBA certification','Interview prep'], ARRAY['Communication'], '[{"title":"IIBA ECBA Certification","url":"https://www.iiba.org/certification/"}]'::jsonb, 'Get ECBA certified and prepare interview portfolio'),

-- Agriculture Technology Specialist
('Agriculture Technology Specialist', 1, 'Agriculture Fundamentals', ARRAY['Crop science basics','Farming systems','Agricultural economics'], ARRAY['Agriculture Technology'], '[{"title":"Agriculture Courses","url":"https://www.coursera.org"}]'::jsonb, 'Research modern farming techniques'),
('Agriculture Technology Specialist', 2, 'IoT & Sensors', ARRAY['Sensor networks','Data collection','IoT platforms'], ARRAY['Agriculture Technology'], '[{"title":"IoT for Agriculture","url":"https://www.udemy.com"}]'::jsonb, 'Design a sensor network for a farm'),
('Agriculture Technology Specialist', 3, 'Data Analysis for Agriculture', ARRAY['Python for ag data','Statistical analysis','Trend analysis'], ARRAY['Python','Statistics'], '[{"title":"Python for Data Analysis","url":"https://www.coursera.org"}]'::jsonb, 'Analyze crop yield data using Python'),
('Agriculture Technology Specialist', 4, 'Machine Learning Applications', ARRAY['Predictive modeling for crops','Image recognition for pests','Yield prediction'], ARRAY['Machine Learning'], '[{"title":"ML for Agriculture","url":"https://www.coursera.org"}]'::jsonb, 'Build a crop yield prediction model'),
('Agriculture Technology Specialist', 5, 'GIS & Remote Sensing', ARRAY['Satellite imagery','GPS mapping','Precision agriculture'], ARRAY['Data Visualization'], '[{"title":"GIS for Agriculture","url":"https://www.esri.com"}]'::jsonb, 'Create a farm map using GIS tools'),
('Agriculture Technology Specialist', 6, 'Real-World Projects', ARRAY['Smart farming solution','Agri-tech startup project','Farm automation'], ARRAY['Agriculture Technology','Python'], '[{"title":"AgriTech Hackathon","url":"https://agritechhackathon.com"}]'::jsonb, 'Build a smart irrigation prototype'),
('Agriculture Technology Specialist', 7, 'Resume & Industry Prep', ARRAY['Agri-tech portfolio','Industry networking','Certification'], ARRAY['Communication'], '[{"title":"Precision Ag Certification","url":"https://www.precisionag.org"}]'::jsonb, 'Build a portfolio with 2 agri-tech projects')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PROJECTS (suggested per career)
-- ============================================================
INSERT INTO projects (career_name, title, description, difficulty, skills_required) VALUES
('Software Developer', 'E-Commerce Web Application', 'Build a full-stack e-commerce app with product catalog, cart, and checkout.', 'advanced', ARRAY['React','Node.js','SQL','HTML/CSS']),
('Software Developer', 'Task Management System', 'Create a Kanban-style task management app with drag-and-drop.', 'intermediate', ARRAY['React','JavaScript']),
('Software Developer', 'REST API Service', 'Design and build a complete RESTful API with authentication.', 'intermediate', ARRAY['Node.js','SQL']),
('Data Analyst', 'Sales Performance Dashboard', 'Create an interactive dashboard analyzing sales data with Power BI.', 'intermediate', ARRAY['Power BI','Excel','SQL']),
('Data Analyst', 'Customer Segmentation Analysis', 'Use Python to segment customers based on purchasing behavior.', 'intermediate', ARRAY['Python','Statistics','Data Visualization']),
('Data Analyst', 'COVID-19 Data Trends Report', 'Analyze and visualize pandemic data trends over time.', 'beginner', ARRAY['Python','Data Visualization','Tableau']),
('Data Scientist', 'Customer Churn Prediction', 'Build an ML model to predict which customers will churn.', 'advanced', ARRAY['Python','Machine Learning','Statistics']),
('Data Scientist', 'Movie Recommendation Engine', 'Create a collaborative filtering recommendation system.', 'advanced', ARRAY['Python','Machine Learning']),
('Data Scientist', 'NLP Sentiment Analysis', 'Analyze social media sentiment using NLP techniques.', 'intermediate', ARRAY['Python','Machine Learning','Deep Learning']),
('AI Engineer', 'Intelligent Chatbot', 'Build an AI chatbot using NLP and intent recognition.', 'advanced', ARRAY['Python','Deep Learning','TensorFlow']),
('AI Engineer', 'Image Classification System', 'Train a CNN model to classify images.', 'intermediate', ARRAY['Python','Deep Learning','TensorFlow']),
('AI Engineer', 'AI-Powered Document Summarizer', 'Build a tool that summarizes long documents using NLP.', 'advanced', ARRAY['Python','Machine Learning','Deep Learning']),
('Cybersecurity Analyst', 'Network Security Audit Tool', 'Develop a tool that scans networks for vulnerabilities.', 'intermediate', ARRAY['Python','Cybersecurity']),
('Cybersecurity Analyst', 'Password Strength Analyzer', 'Create a tool that evaluates password security.', 'beginner', ARRAY['Python','Cybersecurity']),
('Cybersecurity Analyst', 'Log Analysis Dashboard', 'Build a SIEM-like dashboard for analyzing security logs.', 'advanced', ARRAY['Python','Data Visualization','Cybersecurity']),
('Cloud Engineer', 'Auto-Scaling Web Infrastructure', 'Deploy a web app with auto-scaling on AWS.', 'advanced', ARRAY['Cloud Computing','Docker']),
('Cloud Engineer', 'CI/CD Pipeline Setup', 'Create a complete CI/CD pipeline with Jenkins or GitHub Actions.', 'intermediate', ARRAY['Git','Docker','Cloud Computing']),
('UI/UX Designer', 'Mobile Banking App Redesign', 'Redesign a banking app with focus on usability and accessibility.', 'intermediate', ARRAY['UI/UX Design']),
('UI/UX Designer', 'Design System Creation', 'Create a complete design system with components and guidelines.', 'advanced', ARRAY['UI/UX Design']),
('Digital Marketing Specialist', 'SEO Optimization Project', 'Optimize a website to rank on the first page of Google.', 'intermediate', ARRAY['Digital Marketing']),
('Digital Marketing Specialist', 'Social Media Campaign', 'Plan and execute a month-long social media campaign.', 'beginner', ARRAY['Digital Marketing','Communication']),
('Business Analyst', 'Process Optimization Study', 'Analyze and optimize a business process for efficiency.', 'intermediate', ARRAY['Business Analysis','Power BI']),
('Business Analyst', 'Market Research Report', 'Conduct market research and present findings with data.', 'intermediate', ARRAY['Business Analysis','Excel','Communication']),
('Agriculture Technology Specialist', 'Smart Irrigation System', 'Build an IoT-based smart irrigation system.', 'advanced', ARRAY['Agriculture Technology','Python','IoT']),
('Agriculture Technology Specialist', 'Crop Yield Prediction Model', 'Use ML to predict crop yields based on environmental data.', 'advanced', ARRAY['Python','Machine Learning','Agriculture Technology'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- CERTIFICATIONS
-- ============================================================
INSERT INTO certifications (career_name, name, provider, description, url) VALUES
('Software Developer', 'AWS Certified Developer Associate', 'Amazon Web Services', 'Cloud development certification', 'https://aws.amazon.com/certification/'),
('Software Developer', 'Meta Front-End Developer', 'Meta/Coursera', 'Frontend development professional certificate', 'https://www.coursera.org/professional-certificates/meta-front-end-developer'),
('Data Analyst', 'Google Data Analytics Professional', 'Google/Coursera', 'Data analytics professional certificate', 'https://www.coursera.org/professional-certificates/google-data-analytics'),
('Data Analyst', 'Microsoft Power BI Data Analyst', 'Microsoft', 'Power BI certification', 'https://learn.microsoft.com/credentials/certifications/data-analyst-associate/'),
('Data Scientist', 'IBM Data Science Professional', 'IBM/Coursera', 'End-to-end data science certification', 'https://www.coursera.org/professional-certificates/ibm-data-science'),
('Data Scientist', 'TensorFlow Developer Certificate', 'Google', 'ML framework certification', 'https://www.tensorflow.org/certificate'),
('AI Engineer', 'Deep Learning Specialization', 'DeepLearning.AI', 'Deep learning certification', 'https://www.coursera.org/specializations/deep-learning'),
('AI Engineer', 'AI Engineering Professional', 'IBM', 'AI engineering certificate', 'https://www.coursera.org/professional-certificates/ai-engineer'),
('Cybersecurity Analyst', 'CompTIA Security+', 'CompTIA', 'Fundamental security certification', 'https://www.comptia.org/certifications/security'),
('Cybersecurity Analyst', 'Certified Ethical Hacker (CEH)', 'EC-Council', 'Ethical hacking certification', 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/'),
('Cloud Engineer', 'AWS Solutions Architect Associate', 'Amazon Web Services', 'Cloud architecture certification', 'https://aws.amazon.com/certification/certified-solutions-architect-associate/'),
('Cloud Engineer', 'Microsoft Certified: Azure Administrator', 'Microsoft', 'Azure administration certification', 'https://learn.microsoft.com/credentials/certifications/azure-administrator/'),
('UI/UX Designer', 'Google UX Design Professional', 'Google/Coursera', 'UX design certificate', 'https://www.coursera.org/professional-certificates/google-ux'),
('UI/UX Designer', 'NN/g UX Certification', 'Nielsen Norman Group', 'UX research and design certification', 'https://www.nngroup.com/ux-certification/'),
('Digital Marketing Specialist', 'Google Ads Certification', 'Google', 'Search and display ads certification', 'https://skillshop.exceedlms.com/'),
('Digital Marketing Specialist', 'HubSpot Content Marketing', 'HubSpot', 'Content marketing certification', 'https://academy.hubspot.com/courses/content-marketing'),
('Business Analyst', 'IIBA Entry Certificate in Business Analysis', 'IIBA', 'Entry-level BA certification', 'https://www.iiba.org/certification/ecba/'),
('Business Analyst', 'PMI Professional in Business Analysis', 'PMI', 'Professional BA certification', 'https://www.pmi.org/certifications/professional-business-analysis'),
('Agriculture Technology Specialist', 'Precision Agriculture Certification', 'PrecisionAg Institute', 'Precision farming technology certification', 'https://www.precisionag.org'),
('Agriculture Technology Specialist', 'IoT in Agriculture', 'edX', 'IoT applications in agriculture', 'https://www.edx.org')
ON CONFLICT DO NOTHING;
