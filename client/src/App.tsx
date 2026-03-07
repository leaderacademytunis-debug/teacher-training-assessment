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
// import InfographicGenerator from "@/pages/InfographicGenerator";

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
      {/* <Route path="/infographic-generator" component={InfographicGenerator} /> */}
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
