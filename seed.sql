-- ============================================
-- LEADER ACADEMY - SEED DATA
-- ============================================

USE leader_academy;

-- ============================================
-- INSERT USERS
-- ============================================

INSERT INTO users (user_id, email, name, role, school_name, bio, phone, country, city, status, subscription_plan, total_points, total_badges) VALUES
('user-001', 'ali@leaderacademy.school', 'علي سعد الله', 'admin', 'Leader Academy Tunisia', 'مدير ومؤسس المؤسسة التطويرية', '+216 95 123 456', 'Tunisia', 'Tunis', 'active', 'expert', 1500, 12),
('user-002', 'fatima@leaderacademy.school', 'فاطمة محمد', 'teacher', 'مدرسة ابن خلدون', 'معلمة اللغة العربية والعلوم', '+216 95 234 567', 'Tunisia', 'Sfax', 'active', 'pro', 850, 8),
('user-003', 'ahmed@leaderacademy.school', 'أحمد علي', 'teacher', 'مدرسة الشهاب', 'معلم الرياضيات والفيزياء', '+216 95 345 678', 'Tunisia', 'Sousse', 'active', 'pro', 720, 6),
('user-004', 'leila@leaderacademy.school', 'ليلى حسن', 'user', 'مدرسة الزهراء', 'طالبة متفوقة', '+216 95 456 789', 'Tunisia', 'Kairouan', 'active', 'free', 320, 3),
('user-005', 'omar@leaderacademy.school', 'عمر محمود', 'user', 'مدرسة النور', 'طالب مهتم بالتكنولوجيا', '+216 95 567 890', 'Tunisia', 'Gafsa', 'active', 'free', 180, 1);

-- ============================================
-- INSERT COURSES
-- ============================================

INSERT INTO courses (course_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, category, level, duration_hours, price, instructor_id, status, total_students, average_rating) VALUES
('course-001', 'أساسيات الذكاء الاصطناعي في التعليم', 'AI Fundamentals in Education', 'Fondamentaux de l\'IA dans l\'Éducation', 'دورة شاملة تغطي مبادئ الذكاء الاصطناعي وتطبيقاته في المجال التعليمي', 'Comprehensive course covering AI principles and applications in education', 'Cours complet couvrant les principes de l\'IA et ses applications dans l\'éducation', 'AI', 'beginner', 20, 50, 1, 'published', 45, 4.8),
('course-002', 'تصميم الدروس الإلكترونية المتقدمة', 'Advanced E-Learning Design', 'Conception Avancée de l\'E-Learning', 'تعلم كيفية تصميم دروس إلكترونية فعالة وجذابة باستخدام أحدث التقنيات', 'Learn how to design effective and engaging e-learning lessons using latest technologies', 'Apprenez à concevoir des leçons d\'apprentissage en ligne efficaces et attrayantes', 'E-Learning', 'intermediate', 25, 75, 2, 'published', 32, 4.6),
('course-003', 'التقييم الرقمي والاختبارات الإلكترونية', 'Digital Assessment & Online Testing', 'Évaluation Numérique et Tests en Ligne', 'دورة متخصصة في إنشاء وإدارة الاختبارات الإلكترونية وتقييم الطلاب رقمياً', 'Specialized course in creating and managing online tests and digital student assessment', 'Cours spécialisé dans la création et la gestion des tests en ligne', 'Assessment', 'intermediate', 15, 40, 3, 'published', 28, 4.5);

-- ============================================
-- INSERT LESSONS
-- ============================================

INSERT INTO lessons (lesson_id, course_id, title_ar, title_en, title_fr, content_ar, content_en, content_fr, objectives_ar, objectives_en, objectives_fr, duration_minutes, order_number, status, video_url) VALUES
('lesson-001', 1, 'مقدمة إلى الذكاء الاصطناعي', 'Introduction to AI', 'Introduction à l\'IA', 'محتوى تفصيلي عن مفهوم الذكاء الاصطناعي وتاريخه', 'Detailed content about AI concept and history', 'Contenu détaillé sur le concept et l\'histoire de l\'IA', 'فهم مفهوم الذكاء الاصطناعي وأهميته', 'Understand AI concept and its importance', 'Comprendre le concept de l\'IA et son importance', 45, 1, 'published', 'https://example.com/video1.mp4'),
('lesson-002', 1, 'تطبيقات الذكاء الاصطناعي في التعليم', 'AI Applications in Education', 'Applications de l\'IA dans l\'Éducation', 'استكشاف التطبيقات العملية للذكاء الاصطناعي في المؤسسات التعليمية', 'Explore practical AI applications in educational institutions', 'Explorez les applications pratiques de l\'IA dans les établissements d\'enseignement', 'التعرف على تطبيقات الذكاء الاصطناعي الفعلية', 'Identify real AI applications', 'Identifier les applications réelles de l\'IA', 50, 2, 'published', 'https://example.com/video2.mp4'),
('lesson-003', 2, 'أساسيات تصميم الواجهات التعليمية', 'UI/UX Design Basics for Education', 'Bases de la Conception UI/UX pour l\'Éducation', 'تعلم مبادئ تصميم الواجهات الجذابة والسهلة الاستخدام', 'Learn principles of designing attractive and user-friendly interfaces', 'Apprenez les principes de conception d\'interfaces attrayantes', 'تطوير مهارات التصميم الأساسية', 'Develop basic design skills', 'Développer les compétences de conception de base', 40, 1, 'published', 'https://example.com/video3.mp4'),
('lesson-004', 3, 'أنواع الاختبارات الإلكترونية', 'Types of Online Tests', 'Types de Tests en Ligne', 'شرح الأنواع المختلفة من الاختبارات الإلكترونية وخصائصها', 'Explain different types of online tests and their characteristics', 'Expliquez les différents types de tests en ligne', 'التمييز بين أنواع الاختبارات المختلفة', 'Distinguish between different test types', 'Distinguer les différents types de tests', 35, 1, 'published', 'https://example.com/video4.mp4');

-- ============================================
-- INSERT ENROLLMENTS
-- ============================================

INSERT INTO enrollments (enrollment_id, user_id, course_id, status, progress_percentage, started_at) VALUES
('enroll-001', 4, 1, 'in_progress', 60, NOW()),
('enroll-002', 4, 2, 'enrolled', 0, NOW()),
('enroll-003', 5, 1, 'in_progress', 35, NOW()),
('enroll-004', 2, 3, 'completed', 100, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('enroll-005', 3, 2, 'completed', 100, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ============================================
-- INSERT LESSON PROGRESS
-- ============================================

INSERT INTO lesson_progress (progress_id, enrollment_id, lesson_id, status, watched_duration_seconds, completed_at) VALUES
('prog-001', 1, 1, 'completed', 2700, NOW()),
('prog-002', 1, 2, 'in_progress', 1800, NULL),
('prog-003', 3, 1, 'in_progress', 1200, NULL),
('prog-004', 4, 3, 'completed', 2400, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('prog-005', 4, 4, 'completed', 2100, DATE_SUB(NOW(), INTERVAL 28 DAY));

-- ============================================
-- INSERT POINTS
-- ============================================

INSERT INTO points (point_id, user_id, amount, reason, category, reference_id) VALUES
('point-001', 1, 500, 'Course Completed', 'course_completed', 'course-001'),
('point-002', 1, 300, 'Quiz Passed', 'quiz_passed', 'quiz-001'),
('point-003', 1, 200, 'Achievement Unlocked', 'achievement', 'badge-001'),
('point-004', 2, 250, 'Lesson Completed', 'lesson_completed', 'lesson-003'),
('point-005', 2, 150, 'Quiz Passed', 'quiz_passed', 'quiz-002'),
('point-006', 3, 180, 'Lesson Completed', 'lesson_completed', 'lesson-004'),
('point-007', 4, 100, 'Lesson Completed', 'lesson_completed', 'lesson-001'),
('point-008', 5, 80, 'Quiz Passed', 'quiz_passed', 'quiz-001');

-- ============================================
-- INSERT BADGES
-- ============================================

INSERT INTO badges (badge_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, icon_url, criteria, points_required, status) VALUES
('badge-001', 'المتعلم المجتهد', 'Diligent Learner', 'Apprenant Diligent', 'تم إكمال 5 دروس بنجاح', 'Completed 5 lessons successfully', 'Complété 5 leçons avec succès', 'https://example.com/badge1.png', 'lessons_completed_5', 500, 'active'),
('badge-002', 'الخبير', 'Expert', 'Expert', 'تم إكمال دورة كاملة', 'Completed a full course', 'Cours complet terminé', 'https://example.com/badge2.png', 'course_completed', 1000, 'active'),
('badge-003', 'النجم المتألق', 'Shining Star', 'Étoile Brillante', 'حصل على 1000 نقطة', 'Earned 1000 points', 'Gagné 1000 points', 'https://example.com/badge3.png', 'points_1000', 1000, 'active'),
('badge-004', 'المعلم الرائع', 'Great Teacher', 'Grand Enseignant', 'ساهم في تدريب 10 طلاب', 'Trained 10 students', 'Formé 10 étudiants', 'https://example.com/badge4.png', 'students_trained_10', 2000, 'active');

-- ============================================
-- INSERT USER BADGES
-- ============================================

INSERT INTO user_badges (user_badge_id, user_id, badge_id, earned_at) VALUES
('ubadge-001', 1, 1, DATE_SUB(NOW(), INTERVAL 60 DAY)),
('ubadge-002', 1, 2, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('ubadge-003', 1, 3, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('ubadge-004', 1, 4, DATE_SUB(NOW(), INTERVAL 15 DAY)),
('ubadge-005', 2, 1, DATE_SUB(NOW(), INTERVAL 40 DAY)),
('ubadge-006', 2, 2, DATE_SUB(NOW(), INTERVAL 25 DAY)),
('ubadge-007', 3, 1, DATE_SUB(NOW(), INTERVAL 35 DAY)),
('ubadge-008', 4, 1, DATE_SUB(NOW(), INTERVAL 20 DAY));

-- ============================================
-- INSERT ASSESSMENTS
-- ============================================

INSERT INTO assessments (assessment_id, lesson_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, type, total_points, passing_score, duration_minutes, status) VALUES
('quiz-001', 1, 'اختبار الدرس الأول', 'Lesson 1 Quiz', 'Quiz de la Leçon 1', 'اختبر معلوماتك عن مقدمة الذكاء الاصطناعي', 'Test your knowledge about AI introduction', 'Testez vos connaissances sur l\'introduction à l\'IA', 'quiz', 100, 60, 15, 'published'),
('quiz-002', 2, 'اختبار تطبيقات الذكاء الاصطناعي', 'AI Applications Quiz', 'Quiz des Applications de l\'IA', 'اختبر معرفتك بتطبيقات الذكاء الاصطناعي', 'Test your knowledge about AI applications', 'Testez vos connaissances sur les applications de l\'IA', 'quiz', 100, 60, 20, 'published'),
('quiz-003', 3, 'مشروع تصميم الواجهة', 'UI Design Project', 'Projet de Conception UI', 'صمم واجهة تعليمية جذابة', 'Design an attractive educational interface', 'Concevoir une interface éducative attrayante', 'project', 150, 80, 120, 'published');

-- ============================================
-- INSERT ASSESSMENT RESULTS
-- ============================================

INSERT INTO assessment_results (result_id, user_id, assessment_id, score, status, submitted_at, graded_at) VALUES
('result-001', 4, 1, 85, 'passed', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
('result-002', 5, 1, 72, 'passed', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('result-003', 2, 2, 95, 'passed', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
('result-004', 3, 3, 88, 'passed', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- ============================================
-- INSERT JOBS
-- ============================================

INSERT INTO jobs (job_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, company_name, location, job_type, salary_min, salary_max, experience_level, status, posted_by) VALUES
('job-001', 'معلم اللغة الإنجليزية', 'English Teacher', 'Professeur d\'Anglais', 'نبحث عن معلم متخصص في اللغة الإنجليزية', 'We are looking for a specialized English teacher', 'Nous recherchons un professeur d\'anglais spécialisé', 'مدرسة النور', 'Tunis', 'full_time', 1500, 2500, 'mid', 'open', 1),
('job-002', 'مطور تطبيقات ويب', 'Web Developer', 'Développeur Web', 'نبحث عن مطور ويب متمرس', 'We are looking for an experienced web developer', 'Nous recherchons un développeur web expérimenté', 'Tech Solutions', 'Sfax', 'full_time', 2000, 3500, 'mid', 'open', 1),
('job-003', 'مصمم جرافيك', 'Graphic Designer', 'Designer Graphique', 'نبحث عن مصمم جرافيك إبداعي', 'We are looking for a creative graphic designer', 'Nous recherchons un designer graphique créatif', 'Creative Agency', 'Sousse', 'full_time', 1200, 2000, 'entry', 'open', 1),
('job-004', 'مدرب الذكاء الاصطناعي', 'AI Trainer', 'Formateur en IA', 'نبحث عن مدرب متخصص في الذكاء الاصطناعي', 'We are looking for an AI specialist trainer', 'Nous recherchons un formateur spécialisé en IA', 'Leader Academy', 'Tunis', 'full_time', 2500, 4000, 'senior', 'open', 1);

-- ============================================
-- INSERT JOB APPLICATIONS
-- ============================================

INSERT INTO job_applications (application_id, user_id, job_id, status, cover_letter, applied_at) VALUES
('app-001', 4, 1, 'applied', 'I am interested in this teaching position', NOW()),
('app-002', 5, 2, 'applied', 'I have 3 years of web development experience', NOW()),
('app-003', 2, 4, 'shortlisted', 'I am an experienced AI trainer', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('app-004', 3, 4, 'reviewing', 'I am passionate about AI education', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ============================================
-- INSERT PORTFOLIOS
-- ============================================

INSERT INTO portfolios (portfolio_id, user_id, title_ar, title_en, title_fr, description_ar, description_en, description_fr, status, total_views) VALUES
('port-001', 2, 'محفظة المشاريع التعليمية', 'Educational Projects Portfolio', 'Portefeuille de Projets Éducatifs', 'مجموعة من المشاريع التعليمية الناجحة', 'Collection of successful educational projects', 'Collection de projets éducatifs réussis', 'published', 245),
('port-002', 3, 'محفظة الأبحاث العلمية', 'Scientific Research Portfolio', 'Portefeuille de Recherche Scientifique', 'أبحاث علمية متميزة في مجال التعليم', 'Distinguished scientific research in education', 'Recherche scientifique distinguée dans l\'éducation', 'published', 189);

-- ============================================
-- INSERT NOTIFICATIONS
-- ============================================

INSERT INTO notifications (notification_id, user_id, title, message, type, is_read, action_url) VALUES
('notif-001', 4, 'تم قبول طلبك', 'تم قبول طلبك للتقدم للوظيفة', 'success', FALSE, '/jobs/job-001'),
('notif-002', 5, 'دورة جديدة متاحة', 'دورة جديدة في مجال الذكاء الاصطناعي', 'info', FALSE, '/courses/course-001'),
('notif-003', 2, 'شهادة جديدة', 'تم إصدار شهادة لك', 'success', TRUE, '/certificates/cert-001'),
('notif-004', 1, 'تقرير شهري', 'تقرير الأداء الشهري جاهز', 'info', FALSE, '/analytics/monthly');

-- ============================================
-- END OF SEED DATA
-- ============================================
