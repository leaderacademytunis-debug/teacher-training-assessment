# UAT Audit Findings

## Pillar 1: Branding & Identity
### Issues Found:
1. **exportExamWord**: schoolName is hardcoded as ".................." - NOT using user's schoolName from input
2. **exportExamWord**: schoolLogo is NOT included in the Word export input schema or rendering
3. **exportExamWord**: schoolYear is hardcoded as "2025-2026" instead of dynamic
4. **exportExamWord**: Missing outer frame/border around the entire page

### Status: NEEDS FIX

## Pillar 2: EDUGPT Core
### To Check:
- System prompt for Sened/Ta'lima structure
- Criteria codes placement
- Typography (Cairo font, 14pt+)

## Pillar 3: Visual Studio
### To Check:
- Auto-detection of [رسم: ...] placeholders
- bw_lineart style enforcement
- Gallery 2x3 grid with deletion

## Pillar 4: Grading & Export
### To Check:
- Grading table appended to every exam
- Manual edit in preview mode
- Export integrity (outer frame + tables)

## Pillar 5: Admin & Access Control
### To Check:
- Free account restrictions on image generation and logo upload
- Bulk activation tool
- Smart onboarding (subject + grade prompt)
