import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MyCourses from "./pages/MyCourses";
import CourseDetail from "./pages/CourseDetail";
import ExamPage from "./pages/ExamPage";
import ExamResults from "./pages/ExamResults";
import Dashboard from "./pages/Dashboard";
import MyCertificates from "./pages/MyCertificates";
import CourseVideos from "./pages/CourseVideos";
import VerifyCertificate from "./pages/VerifyCertificate";
import ImportExam from "./pages/ImportExam";
import EditQuestions from "@/pages/EditQuestions";
import PreviewExam from "@/pages/PreviewExam";
import CompleteRegistration from "@/pages/CompleteRegistration";
import RegistrationsManagement from "@/pages/RegistrationsManagement";
import TeacherTools from "@/pages/TeacherTools";
import SharedLibrary from "@/pages/SharedLibrary";
import ReferenceLibrary from "@/pages/ReferenceLibrary";
import TemplateLibrary from "@/pages/TemplateLibrary";
import EduGPTAssistantEnhanced from "@/pages/EduGPTAssistantEnhanced";
import EvaluateFiche from "@/pages/EvaluateFiche";
import SharedEvaluationView from "@/pages/SharedEvaluationView";
import LessonHistory from "@/pages/LessonHistory";
import AnnualPlanGenerator from "@/pages/AnnualPlanGenerator";
import LessonSheetFromPlan from "@/pages/LessonSheetFromPlan";
import EvaluationFromSheet from "@/pages/EvaluationFromSheet";
import EvaluationLibrary from "@/pages/EvaluationLibrary";
// import InfographicGenerator from "@/pages/InfographicGenerator";
import Contact from "@/pages/Contact";
import EduGPT from "@/pages/EduGPT";
import Inspector from "@/pages/Inspector";
import ExamBuilder from "@/pages/ExamBuilder";
import LeaderVisualStudio from "@/pages/LeaderVisualStudio";
import AdminDashboard from "@/pages/AdminDashboard";
import Pricing from "@/pages/Pricing";
import LegacyDigitizer from "@/pages/LegacyDigitizer";
import TeacherPortfolio from "@/pages/TeacherPortfolio";
import PublicPortfolio from "@/pages/PublicPortfolio";
import CurriculumMap from "@/pages/CurriculumMap";
import BlindGrading from "@/pages/BlindGrading";
import Marketplace from "@/pages/Marketplace";
import MarketplacePublish from "@/pages/MarketplacePublish";
import DramaEngine from "@/pages/DramaEngine";
import ManagerialDashboard from "@/pages/ManagerialDashboard";
import MarketplaceSearch from "@/pages/MarketplaceSearch";
import TeacherShowcase from "@/pages/TeacherShowcase";
import ConnectionRequests from "@/pages/ConnectionRequests";
import TalentDirectory from "@/pages/TalentDirectory";
import SchoolPortal from "@/pages/SchoolPortal";
import AdminPartners from "@/pages/AdminPartners";
import CareerMessages from "@/pages/CareerMessages";
import TeacherAnalytics from "@/pages/TeacherAnalytics";
import JobBoard from "@/pages/JobBoard";
import MyApplications from "@/pages/MyApplications";
import AdminBatchManager from "@/pages/AdminBatchManager";
import MyAssignments from "@/pages/MyAssignments";
import JoinBatch from "@/pages/JoinBatch";
import BatchComparison from "@/pages/BatchComparison";
import HandwritingAnalyzer from "@/pages/HandwritingAnalyzer";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/my-courses" component={MyCourses} />
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
      {/* <Route path="/infographic-generator" component={InfographicGenerator} /> */}
      <Route path="/contact" component={Contact} />
      <Route path="/edugpt" component={EduGPT} />
      <Route path="/inspector" component={Inspector} />
      <Route path="/exam-builder" component={ExamBuilder} />
      <Route path="/visual-studio" component={LeaderVisualStudio} />
      <Route path="/admin" component={AdminDashboard} />
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
      <Route path="/jobs" component={JobBoard} />
      <Route path="/my-applications" component={MyApplications} />
      <Route path="/admin/batches" component={AdminBatchManager} />
      <Route path="/my-assignments" component={MyAssignments} />
      <Route path="/join/:code" component={JoinBatch} />
      <Route path="/admin/batch-comparison" component={BatchComparison} />
      <Route path="/handwriting-analyzer" component={HandwritingAnalyzer} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
