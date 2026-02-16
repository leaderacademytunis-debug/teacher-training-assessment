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
