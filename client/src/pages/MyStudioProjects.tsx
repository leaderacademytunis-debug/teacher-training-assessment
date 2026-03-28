import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  FolderOpen, Clapperboard, Clock, Layers, Film,
  ArrowLeft, Trash2, Play, Loader2, Search,
  ImageIcon, Volume2, CheckCircle2, AlertCircle, Edit3
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";

export default function MyStudioProjects() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const projectsQuery = trpc.eduStudio.listProjects.useQuery();
  const deleteProjectMut = trpc.eduStudio.deleteProject.useMutation({
    onSuccess: () => {
      projectsQuery.refetch();
      toast.success(t("تم حذف المشروع", "Projet supprimé", "Project deleted"));
    },
    onError: (err) => {
      toast.error(err.message || t("فشل في حذف المشروع", "Échec de la suppression", "Delete failed"));
    },
  });

  const projects = projectsQuery.data || [];
  const filteredProjects = projects.filter((p: any) =>
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return { label: t("مكتمل", "Terminé", "Completed"), color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle2 };
      case "in_progress":
        return { label: t("قيد العمل", "En cours", "In Progress"), color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: Edit3 };
      default:
        return { label: t("مسودة", "Brouillon", "Draft"), color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: AlertCircle };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/leader-visual-studio">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t("مشاريعي", "Mes Projets", "My Projects")}</h1>
                  <p className="text-xs text-purple-300">{t("مشاريع الإنتاج المرئي المحفوظة", "Projets de production sauvegardés", "Saved production projects")}</p>
                </div>
              </div>
            </div>
            <Link href="/edu-studio">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0">
                <Clapperboard className="w-4 h-4 me-2" />
                {t("مشروع جديد", "Nouveau projet", "New Project")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("البحث في المشاريع...", "Rechercher dans les projets...", "Search projects...")}
            className="w-full bg-white/5 border border-purple-500/20 rounded-xl py-3 ps-11 pe-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-400/50"
          />
        </div>

        {/* Projects Grid */}
        {projectsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <Film className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery
                ? t("لا توجد نتائج", "Aucun résultat", "No results")
                : t("لا توجد مشاريع بعد", "Aucun projet encore", "No projects yet")}
            </h3>
            <p className="text-gray-400 mb-6">
              {t("ابدأ بإنشاء مشروع جديد من Edu-Studio", "Commencez par créer un nouveau projet", "Start by creating a new project")}
            </p>
            <Link href="/edu-studio">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                <Clapperboard className="w-4 h-4 me-2" />
                {t("إنشاء مشروع", "Créer un projet", "Create Project")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project: any) => {
              const status = getStatusBadge(project.status || "draft");
              const StatusIcon = status.icon;
              const imageCount = project.generatedImages ? Object.keys(typeof project.generatedImages === "string" ? JSON.parse(project.generatedImages || "{}") : project.generatedImages || {}).length : 0;
              const audioCount = project.generatedAudios ? Object.keys(typeof project.generatedAudios === "string" ? JSON.parse(project.generatedAudios || "{}") : project.generatedAudios || {}).length : 0;

              return (
                <Card
                  key={project.id}
                  className="bg-white/5 border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => navigate(`/edu-studio?project=${project.id}`)}
                >
                  {/* Gradient Top Bar */}
                  <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />

                  <div className="p-5">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg leading-tight flex-1 group-hover:text-purple-200 transition-colors">
                        {project.title || t("مشروع بدون عنوان", "Projet sans titre", "Untitled Project")}
                      </h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color} flex-shrink-0 ms-2`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    {/* Summary */}
                    {project.summary && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.summary}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {project.numberOfScenes || 0} {t("مشاهد", "scènes", "scenes")}
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {imageCount} {t("صور", "images", "images")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        {audioCount} {t("صوتيات", "audios", "audios")}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString(language === "ar" ? "ar-TN" : language === "fr" ? "fr-TN" : "en-US") : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t("هل تريد حذف هذا المشروع؟", "Supprimer ce projet ?", "Delete this project?"))) {
                              deleteProjectMut.mutate({ id: project.id });
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 text-xs font-medium transition-all">
                          <Play className="w-3 h-3" />
                          {t("فتح", "Ouvrir", "Open")}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
