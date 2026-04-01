import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Redirect from "./components/Redirect";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import RoleGuard from "./components/RoleGuard";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { FloatingAssistant } from "./components/FloatingAssistant";
import OnboardingGuard from "./components/OnboardingGuard";

// Eagerly loaded pages (critical path - home & auth)
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// Lazy-loaded pages (code-split into separate chunks)
const MyCourses = lazy(() => import("./pages/MyCourses"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ExamPage = lazy(() => import("./pages/ExamPage"));
const ExamResults = lazy(() => import("./pages/ExamResults"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyCertificates = lazy(() => import("./pages/MyCertificates"));
const CourseVideos = lazy(() => import("./pages/CourseVideos"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const ImportExam = lazy(() => import("./pages/ImportExam"));
const EditQuestions = lazy(() => import("@/pages/EditQuestions"));
const PreviewExam = lazy(() => import("@/pages/PreviewExam"));
const CompleteRegistration = lazy(() => import("@/pages/CompleteRegistration"));
const RegistrationsManagement = lazy(() => import("@/pages/RegistrationsManagement"));
const TeacherTools = lazy(() => import("@/pages/TeacherTools"));
const SharedLibrary = lazy(() => import("@/pages/SharedLibrary"));
const ReferenceLibrary = lazy(() => import("@/pages/ReferenceLibrary"));
const TemplateLibrary = lazy(() => import("@/pages/TemplateLibrary"));
const EduGPTAssistantEnhanced = lazy(() => import("@/pages/EduGPTAssistantEnhanced"));
const EvaluateFiche = lazy(() => import("@/pages/EvaluateFiche"));
const SharedEvaluationView = lazy(() => import("@/pages/SharedEvaluationView"));
const LessonHistory = lazy(() => import("@/pages/LessonHistory"));
const AnnualPlanGenerator = lazy(() => import("@/pages/AnnualPlanGenerator"));
const LessonSheetFromPlan = lazy(() => import("@/pages/LessonSheetFromPlan"));
const EvaluationFromSheet = lazy(() => import("@/pages/EvaluationFromSheet"));
const EvaluationLibrary = lazy(() => import("@/pages/EvaluationLibrary"));
const Contact = lazy(() => import("@/pages/Contact"));
const EduGPT = lazy(() => import("@/pages/EduGPT"));
const Inspector = lazy(() => import("@/pages/Inspector"));
const ExamBuilder = lazy(() => import("@/pages/ExamBuilder"));
const LeaderVisualStudio = lazy(() => import("@/pages/LeaderVisualStudio"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const LegacyDigitizer = lazy(() => import("@/pages/LegacyDigitizer"));
const TeacherPortfolio = lazy(() => import("@/pages/TeacherPortfolio"));
const PublicPortfolio = lazy(() => import("@/pages/PublicPortfolio"));
const CurriculumMap = lazy(() => import("@/pages/CurriculumMap"));
const BlindGrading = lazy(() => import("@/pages/BlindGrading"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MarketplacePublish = lazy(() => import("@/pages/MarketplacePublish"));
const DramaEngine = lazy(() => import("@/pages/DramaEngine"));
const ManagerialDashboard = lazy(() => import("@/pages/ManagerialDashboard"));
const MarketplaceSearch = lazy(() => import("@/pages/MarketplaceSearch"));
const TeacherShowcase = lazy(() => import("@/pages/TeacherShowcase"));
const ConnectionRequests = lazy(() => import("@/pages/ConnectionRequests"));
const TalentDirectory = lazy(() => import("@/pages/TalentDirectory"));
const SchoolPortal = lazy(() => import("@/pages/SchoolPortal"));
const AdminPartners = lazy(() => import("@/pages/AdminPartners"));
const CareerMessages = lazy(() => import("@/pages/CareerMessages"));
const TeacherAnalytics = lazy(() => import("@/pages/TeacherAnalytics"));
const JobBoard = lazy(() => import("@/pages/JobBoard"));
const MyApplications = lazy(() => import("@/pages/MyApplications"));
const AdminBatchManager = lazy(() => import("@/pages/AdminBatchManager"));
const AdminDashboardV2 = lazy(() => import("@/pages/AdminDashboardV2"));
const MyAssignments = lazy(() => import("@/pages/MyAssignments"));
const JoinBatch = lazy(() => import("@/pages/JoinBatch"));
const BatchComparison = lazy(() => import("@/pages/BatchComparison"));
const HandwritingAnalyzer = lazy(() => import("@/pages/HandwritingAnalyzer"));
const VideoEvaluator = lazy(() => import("@/pages/VideoEvaluator"));
const About = lazy(() => import("@/pages/About"));
const PromptLab = lazy(() => import("@/pages/PromptLab"));
const LearningDifficultiesTools = lazy(() => import("@/pages/LearningDifficultiesTools"));
const PedagogicalCompanion = lazy(() => import("@/pages/PedagogicalCompanion"));
const ContentAdapter = lazy(() => import("@/pages/ContentAdapter"));
const TherapeuticExercises = lazy(() => import("@/pages/TherapeuticExercises"));
const FollowUpReport = lazy(() => import("@/pages/FollowUpReport"));
const ProgressEvaluator = lazy(() => import("@/pages/ProgressEvaluator"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const RepartitionJournaliere = lazy(() => import("@/pages/RepartitionJournaliere"));
const ReferenceContentManager = lazy(() => import("@/pages/ReferenceContentManager"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
const SchoolDashboard = lazy(() => import("@/pages/SchoolDashboard"));
const TextbooksLibrary = lazy(() => import("@/pages/TextbooksLibrary"));
const TextbookViewer = lazy(() => import("@/pages/TextbookViewer"));
const EduStudioEngine = lazy(() => import("@/pages/EduStudioEngine"));
const EduStudioExport = lazy(() => import("@/pages/EduStudioExport"));
const MyStudioProjects = lazy(() => import("@/pages/MyStudioProjects"));
const MyDigitalVoice = lazy(() => import("@/pages/MyDigitalVoice"));
const MyPoints = lazy(() => import("@/pages/MyPoints"));
const AIToolsHub = lazy(() => import("@/pages/AIToolsHub"));
const UltimateStudio = lazy(() => import("@/pages/UltimateStudio"));
const CourseToolkit = lazy(() => import("@/pages/CourseToolkit"));
const Inclusion = lazy(() => import("@/pages/Inclusion"));
const PublicTeacherProfile = lazy(() => import("@/pages/PublicTeacherProfile"));
const CompetencyAnalytics = lazy(() => import("@/pages/CompetencyAnalytics"));
const CareerShowcase = lazy(() => import("@/pages/CareerShowcase"));
const TalentRadarPage = lazy(() => import("@/pages/TalentRadarPage"));
const ProfileBuilderPage = lazy(() => import("@/pages/ProfileBuilderPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/AdminAnalyticsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path="/my-courses" component={MyCourses} />
        <Route path="/courses" component={Courses} />
        <Route path="/courses/:id" component={CourseDetail} />
        <Route path="/exams/:id" component={ExamPage} />
        <Route path="/exam-results/:id" component={ExamResults} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/my-certificates" component={MyCertificates} />
        <Route path="/courses/:id/videos" component={CourseVideos} />
        <Route path="/verify" component={VerifyCertificate} />
        <Route path="/import-exam" component={ImportExam} />
        <Route path="/edit-questions/:id" component={EditQuestions} />
        <Route path="/preview-exam/:id" component={PreviewExam} />
        <Route path="/complete-registration" component={CompleteRegistration} />
        <Route path="/dashboard/registrations" component={RegistrationsManagement} />
        <Route path="/teacher-tools" component={TeacherTools} />
        <Route path="/shared-library" component={SharedLibrary} />
        <Route path="/reference-library" component={ReferenceLibrary} />
        <Route path="/template-library" component={TemplateLibrary} />
        <Route path="/assistant" component={EduGPTAssistantEnhanced} />
        <Route path="/evaluate-fiche" component={EvaluateFiche} />
        <Route path="/shared-evaluation/:token" component={SharedEvaluationView} />
        <Route path="/lesson-history" component={LessonHistory} />
        <Route path="/annual-plan" component={AnnualPlanGenerator} />
        <Route path="/lesson-sheet-from-plan" component={LessonSheetFromPlan} />
        <Route path="/evaluation-from-sheet" component={EvaluationFromSheet} />
        <Route path="/evaluation-library" component={EvaluationLibrary} />
        <Route path="/contact" component={Contact} />
        <Route path="/edugpt" component={EduGPT} />
        <Route path="/inspector" component={Inspector} />
        <Route path="/exam-builder" component={ExamBuilder} />
        <Route path="/visual-studio" component={LeaderVisualStudio} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin-control" component={AdminDashboardV2} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/legacy-digitizer" component={LegacyDigitizer} />
        <Route path="/my-portfolio" component={TeacherPortfolio} />
        <Route path="/public-portfolio/:token" component={PublicPortfolio} />
        <Route path="/curriculum-map" component={CurriculumMap} />
        <Route path="/blind-grading" component={BlindGrading} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/marketplace/publish" component={MarketplacePublish} />
        <Route path="/drama-engine" component={DramaEngine} />
        <Route path="/managerial-dashboard" component={ManagerialDashboard} />
        <Route path="/marketplace/search" component={MarketplaceSearch} />
        <Route path="/showcase" component={TalentDirectory} />
        <Route path="/showcase/:slug" component={TeacherShowcase} />
        <Route path="/connection-requests" component={ConnectionRequests} />
        <Route path="/school-portal" component={SchoolPortal} />
        <Route path="/admin/partners" component={AdminPartners} />
        <Route path="/career-messages" component={CareerMessages} />
        <Route path="/teacher-analytics" component={TeacherAnalytics} />
        <Route path="/competency-analytics" component={CompetencyAnalytics} />
        <Route path="/showcase" component={CareerShowcase} />
        <Route path="/jobs" component={JobBoard} />
        <Route path="/my-applications" component={MyApplications} />
        <Route path="/admin/batches" component={AdminBatchManager} />
        <Route path="/my-assignments" component={MyAssignments} />
        <Route path="/join/:code" component={JoinBatch} />
        <Route path="/admin/batch-comparison" component={BatchComparison} />
        <Route path="/handwriting-analyzer" component={HandwritingAnalyzer} />
        <Route path="/learning-support" component={LearningDifficultiesTools} />
        <Route path="/pedagogical-companion" component={PedagogicalCompanion} />
        <Route path="/content-adapter" component={ContentAdapter} />
        <Route path="/therapeutic-exercises" component={TherapeuticExercises} />
        <Route path="/follow-up-report" component={FollowUpReport} />
        <Route path="/progress-evaluator" component={ProgressEvaluator} />
        <Route path="/student-dashboard" component={StudentDashboard} />
        <Route path="/repartition-journaliere" component={RepartitionJournaliere} />
        <Route path="/reference-content" component={ReferenceContentManager} />
        <Route path="/select-role" component={RoleSelection} />
        <Route path="/teacher-dashboard" component={TeacherDashboard} />
        <Route path="/school-dashboard" component={SchoolDashboard} />
        <Route path="/video-evaluator" component={VideoEvaluator} />
        <Route path="/about" component={About} />
        <Route path="/prompt-lab" component={PromptLab} />
        <Route path="/library" component={TextbooksLibrary} />
        <Route path="/textbook-viewer" component={TextbookViewer} />
        <Route path="/edu-studio" component={EduStudioEngine} />
        <Route path="/edu-studio-export" component={EduStudioExport} />
        <Route path="/my-studio-projects" component={MyStudioProjects} />
        <Route path="/my-voice" component={MyDigitalVoice} />
        <Route path="/my-points" component={MyPoints} />
        <Route path="/ai-hub" component={AIToolsHub} />
        <Route path="/ultimate-studio" component={UltimateStudio} />
        <Route path="/course-toolkit" component={CourseToolkit} />
        <Route path="/inclusion" component={Inclusion} />
        <Route path="/teacher/:username" component={PublicTeacherProfile} />
        <Route path="/talent-radar" component={TalentRadarPage} />
        <Route path="/profile-builder" component={ProfileBuilderPage} />
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/admin/analytics" component={AdminAnalyticsPage} />
        {/* Redirects for broken/legacy links */}
        <Route path="/certificates"><Redirect to="/my-certificates" /></Route>
        <Route path="/career"><Redirect to="/jobs" /></Route>
        <Route path="/management"><Redirect to="/managerial-dashboard" /></Route>
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <RoleGuard />
          <OnboardingGuard />
          <Router />
          <PWAInstallPrompt />
          <FloatingAssistant hiddenRoutes={["/assistant", "/exam-builder", "/curriculum-map"]} />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
