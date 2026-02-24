#!/bin/bash
mysql -h $(echo $DATABASE_URL | sed 's/mysql:\/\///' | cut -d@ -f2 | cut -d: -f1) \
      -P $(echo $DATABASE_URL | sed 's/.*://' | cut -d\/ -f1) \
      -u $(echo $DATABASE_URL | sed 's/mysql:\/\///' | cut -d: -f1) \
      -p$(echo $DATABASE_URL | sed 's/.*://' | cut -d@ -f1) \
      $(echo $DATABASE_URL | sed 's/.*\///' | cut -d\? -f1) << SQL
INSERT INTO reference_documents (uploaded_by, school_year, education_level, grade, subject, document_type, document_title, document_url) VALUES
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'اللغة العربية', 'teacher_guide', 'دليل المعلم - اللغة العربية - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/gXwTVSIkELuJdlwT.pdf'),
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'التربية الفنية', 'teacher_guide', 'دليل المعلم - التربية الفنية - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/itQAUUneueOZaozU.pdf'),
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'التربية الإسلامية', 'teacher_guide', 'دليل المعلم - التربية الإسلامية - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/NTtzOeVdDhdVhHAl.pdf'),
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'التربية الموسيقية', 'teacher_guide', 'دليل المعلم - التربية الموسيقية - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/qKbEunnCvOgcGzwx.pdf'),
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'الرياضيات', 'teacher_guide', 'دليل المعلم - الرياضيات - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/pRAGTsYWUjRKVBVP.pdf'),
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'علوم الطبيعة', 'teacher_guide', 'دليل المعلم - علوم الطبيعة - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/ofWLXfqHDwrhJAvD.pdf'),
(1, '2024-2025', 'primary', 'السنة الأولى والثانية ابتدائي', 'التكنولوجيا', 'teacher_guide', 'دليل المعلم - التكنولوجيا - الدرجة الأولى', 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/TTpHHTRKUdTAfkyg.pdf');
SQL
