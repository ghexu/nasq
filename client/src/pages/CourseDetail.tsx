/**
 * حقوق الملكية الفكرية © 2025 فريق نسق | جامعة الأميرة نورة بنت عبدالرحمن
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import {
  GraduationCap, ArrowRight, BookOpen, Brain, FileText, CheckCircle2,
  Clock, Target, ChevronDown, ChevronUp, Loader2,
  Award, BarChart3, Star, AlertCircle, RefreshCw, Download,
  Wand2, ListChecks, ChevronRight, ClipboardList
} from "lucide-react";

// ---- Types ----
type RubricCriterion = {
  name: string;
  weight: number;
  excellent: string;
  good: string;
  needsImprovement: string;
};

type Rubric = {
  id: number;
  activityId: number;
  criteria: RubricCriterion[];
  totalPoints: number;
};

type Activity = {
  id: number;
  courseId: number;
  outcomeId: number | null;
  title: string;
  type: string;
  description: string | null;
  duration: string | null;
  instructions: string | null;
  isSelected: number;
  isAiGenerated: number;
  rubric: Rubric | null;
};

type Objective = {
  id: number;
  courseId: number;
  outcomeId: number;
  text: string;
  domain: string;
  bloomLevel: string | null;
  actionVerb: string | null;
  orderIndex: number;
};

type OutcomeWithChildren = {
  id: number;
  courseId: number;
  text: string;
  domain: string;
  bloomLevel: string | null;
  actionVerb: string | null;
  orderIndex: number;
  objectives: Objective[];
  activities: Activity[];
};

// ---- Config ----
const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  project:      { label: "مشروع",        color: "text-violet-700", bg: "bg-violet-50 border-violet-200",  icon: "🗂️" },
  discussion:   { label: "نقاش",         color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",      icon: "💬" },
  quiz:         { label: "اختبار",       color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",    icon: "📝" },
  practical:    { label: "مهمة تطبيقية", color: "text-green-700",  bg: "bg-green-50 border-green-200",    icon: "🔬" },
  presentation: { label: "عرض تقديمي",  color: "text-rose-700",   bg: "bg-rose-50 border-rose-200",      icon: "🎤" },
  research:     { label: "بحث",          color: "text-teal-700",   bg: "bg-teal-50 border-teal-200",      icon: "🔍" },
};

const domainConfig: Record<string, { label: string; color: string }> = {
  cognitive:  { label: "معرفي",  color: "bg-blue-50 text-blue-700 border-blue-200" },
  skill:      { label: "مهاري",  color: "bg-green-50 text-green-700 border-green-200" },
  value:      { label: "وجداني", color: "bg-amber-50 text-amber-700 border-amber-200" },
  affective:  { label: "وجداني", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const levelLabels: Record<string, string> = {
  bachelor:  "بكالوريوس",
  masters:   "ماجستير",
  diploma:   "دبلوم",
  doctorate: "دكتوراه",
};

// ---- Sub-components ----
function RubricTable({ rubric }: { rubric: Rubric }) {
  const criteria = Array.isArray(rubric.criteria) ? rubric.criteria : [];
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-border">
      <div className="bg-primary/5 px-4 py-2 flex items-center justify-between border-b border-border">
        <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          سلم التقدير
        </span>
        <span className="text-xs text-muted-foreground">{rubric.totalPoints} درجة</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/40">
              <th className="text-right px-3 py-2 font-medium text-foreground border-b border-border w-1/4">المعيار</th>
              <th className="text-right px-3 py-2 font-medium text-foreground border-b border-border w-1/12">الوزن</th>
              <th className="text-right px-3 py-2 font-medium text-green-700 border-b border-border">ممتاز</th>
              <th className="text-right px-3 py-2 font-medium text-blue-700 border-b border-border">جيد</th>
              <th className="text-right px-3 py-2 font-medium text-amber-700 border-b border-border">يحتاج تحسين</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                <td className="px-3 py-2 font-medium text-foreground border-b border-border/50 align-top">{c.name}</td>
                <td className="px-3 py-2 text-center text-muted-foreground border-b border-border/50 align-top">
                  <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full font-medium">{c.weight}%</span>
                </td>
                <td className="px-3 py-2 border-b border-border/50 align-top leading-relaxed text-green-700">{c.excellent}</td>
                <td className="px-3 py-2 border-b border-border/50 align-top leading-relaxed text-blue-700">{c.good}</td>
                <td className="px-3 py-2 border-b border-border/50 align-top leading-relaxed text-amber-700">{c.needsImprovement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  onToggle,
  isToggling,
}: {
  activity: Activity;
  onToggle: (id: number, selected: boolean) => void;
  isToggling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[activity.type] ?? typeConfig.project;
  const isSelected = activity.isSelected === 1;

  return (
    <div className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
      isSelected
        ? "border-primary shadow-nasaq bg-card"
        : "border-border bg-card hover:border-primary/40"
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border ${cfg.bg}`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {activity.duration && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{activity.duration}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-foreground text-sm">{activity.title}</h4>
              </div>
              <button
                onClick={() => onToggle(activity.id, !isSelected)}
                disabled={isToggling}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-nasaq"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                {isSelected ? "مختار" : "اختر"}
              </button>
            </div>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{activity.description}</p>
            )}
          </div>
        </div>
        {(activity.instructions || activity.rubric) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2.5 w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> إخفاء سلم التقدير</> : <><ChevronDown className="w-3 h-3" /> عرض سلم التقدير</>}
          </button>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
          {activity.instructions && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />تعليمات النشاط
              </h5>
              <div className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{activity.instructions}</div>
            </div>
          )}
          {activity.rubric && <RubricTable rubric={activity.rubric} />}
        </div>
      )}
    </div>
  );
}

/** بطاقة ناتج التعلم مع أهدافه الإجرائية وأنشطته */
function OutcomeCard({
  outcome,
  index,
  hasObjectives,
  onToggle,
  togglingId,
}: {
  outcome: OutcomeWithChildren;
  index: number;
  hasObjectives: boolean;
  onToggle: (id: number, selected: boolean) => void;
  togglingId: number | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showObjectives, setShowObjectives] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const dc = domainConfig[outcome.domain] ?? domainConfig.cognitive;

  return (
    <div className="bg-card rounded-2xl border-2 border-border/60 overflow-hidden shadow-nasaq">
      {/* Outcome Header */}
      <div
        className="p-5 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 nasaq-gradient rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">ناتج التعلم</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${dc.color}`}>{dc.label}</span>
              {outcome.bloomLevel && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{outcome.bloomLevel}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground leading-relaxed">{outcome.text}</p>
            {outcome.actionVerb && (
              <p className="text-xs text-muted-foreground mt-1">الفعل الإجرائي: <span className="text-primary font-medium">{outcome.actionVerb}</span></p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {hasObjectives && outcome.objectives.length > 0 && (
                <span className="bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
                  {outcome.objectives.length} هدف
                </span>
              )}
              {outcome.activities.length > 0 && (
                <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                  {outcome.activities.length} نشاط
                </span>
              )}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50">
          {/* Objectives Section */}
          {hasObjectives && outcome.objectives.length > 0 && (
            <div className="p-4 border-b border-border/50 bg-violet-50/30">
              <button
                onClick={() => setShowObjectives(!showObjectives)}
                className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold text-violet-700 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5" />
                  الأهداف الإجرائية ({outcome.objectives.length})
                </span>
                {showObjectives ? <ChevronUp className="w-3.5 h-3.5 text-violet-500" /> : <ChevronDown className="w-3.5 h-3.5 text-violet-500" />}
              </button>
              {showObjectives && (
                <div className="space-y-2 pr-2 border-r-2 border-violet-200">
                  {outcome.objectives.map((obj, i) => {
                    const odc = domainConfig[obj.domain] ?? domainConfig.cognitive;
                    return (
                      <div key={obj.id} className="flex items-start gap-2.5 bg-white rounded-lg p-3 border border-violet-100">
                        <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{obj.text}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${odc.color}`}>{odc.label}</span>
                            {obj.bloomLevel && (
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{obj.bloomLevel}</span>
                            )}
                            {obj.actionVerb && (
                              <span className="text-xs text-violet-600 font-medium">{obj.actionVerb}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Activities Section */}
          {outcome.activities.length > 0 && (
            <div className="p-4 bg-primary/5/20">
              <button
                onClick={() => setShowActivities(!showActivities)}
                className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  الأنشطة التعليمية المقترحة ({outcome.activities.length})
                </span>
                {showActivities ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />}
              </button>
              {showActivities && (
                <div className="space-y-3 pr-2 border-r-2 border-primary/20">
                  {outcome.activities.map((act) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      onToggle={onToggle}
                      isToggling={togglingId === act.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {outcome.activities.length === 0 && (!hasObjectives || outcome.objectives.length === 0) && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              لا توجد أنشطة أو أهداف لهذا الناتج بعد
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main Component ----
export default function CourseDetail() {
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id ?? "0");
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isConvertingObjectives, setIsConvertingObjectives] = useState(false);
  const [viewMode, setViewMode] = useState<"hierarchical" | "flat-activities" | "flat-selected">("hierarchical");

  const autoGeneratedRef = useRef(false);

  const { data: course, isLoading, refetch } = trpc.courses.get.useQuery(
    { id: courseId },
    { enabled: !!courseId }
  );

  // توليد تلقائي عند فتح الصفحة إذا لم تكن هناك أنشطة مرتبطة بالنواتج بعد
  useEffect(() => {
    if (
      course &&
      !autoGeneratedRef.current &&
      !isLoading &&
      course.outcomes?.length > 0
    ) {
      // تحقق من وجود أنشطة مرتبطة فعلاً بالنواتج
      const outcomesWithActivities = course.outcomes.filter((o: any) => o.activities && o.activities.length > 0);
      if (outcomesWithActivities.length > 0) return; // الأنشطة موجودة ومرتبطة بشكل صحيح
      autoGeneratedRef.current = true;
      setIsRegenerating(true);
      aiMutation.mutate({
        courseId: course.id,
        courseTitle: course.title,
        courseLevel: course.level,
        outcomes: course.outcomes.map((o: any) => ({
          id: o.id,
          text: o.text,
          domain: o.domain,
          bloomLevel: o.bloomLevel ?? null,
          actionVerb: o.actionVerb ?? null,
        })),
      });
    }
  }, [course, isLoading]);

  const toggleMutation = trpc.ai.toggleActivity.useMutation({
    onSuccess: () => { refetch(); setTogglingId(null); },
    onError: () => { toast.error("حدث خطأ"); setTogglingId(null); },
  });

  const aiMutation = trpc.ai.analyzeAndGenerate.useMutation({
    onSuccess: () => {
      toast.success("تم إعادة توليد الأنشطة بنجاح!");
      refetch();
      setIsRegenerating(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التوليد");
      setIsRegenerating(false);
    },
  });

  const exportWordMutation = trpc.ai.exportWord.useMutation();
  const convertObjectivesMutation = trpc.ai.convertToObjectives.useMutation();

  const handleToggle = (activityId: number, selected: boolean) => {
    setTogglingId(activityId);
    toggleMutation.mutate({ activityId, isSelected: selected });
  };

  const handleRegenerate = async () => {
    if (!course) return;
    setIsRegenerating(true);
    await aiMutation.mutateAsync({
      courseId: course.id,
      courseTitle: course.title,
      courseLevel: course.level,
      outcomes: course.outcomes.map((o) => ({
        id: o.id,
        text: o.text,
        domain: o.domain,
        bloomLevel: (o as any).bloomLevel ?? null,
        actionVerb: (o as any).actionVerb ?? null,
      })),
    });
  };

  const handleExportWord = async () => {
    if (!course) return;
    setIsExportingWord(true);
    try {
      const result = await exportWordMutation.mutateAsync({ courseId: course.id });
      const byteArray = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تحميل ملف Word بنجاح!");
    } catch {
      toast.error("حدث خطأ أثناء تصدير الملف");
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleConvertObjectives = async () => {
    if (!course) return;
    setIsConvertingObjectives(true);
    try {
      await convertObjectivesMutation.mutateAsync({
        courseId: course.id,
        courseTitle: course.title,
        outcomes: course.outcomes.map((o) => ({
          id: o.id,
          text: o.text,
          domain: o.domain,
          bloomLevel: (o as any).bloomLevel ?? null,
        })),
      });
      toast.success("تم توليد الأهداف الإجرائية بنجاح! ستظهر تحت كل ناتج تعلم.");
      refetch();
      setViewMode("hierarchical");
    } catch {
      toast.error("حدث خطأ أثناء توليد الأهداف");
    } finally {
      setIsConvertingObjectives(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 nasaq-gradient rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <p className="text-muted-foreground">جاري تحميل المقرر...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="font-semibold mb-2">المقرر غير موجود</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline">العودة للوحة التحكم</Button>
        </div>
      </div>
    );
  }

  const outcomes = (course.outcomes ?? []) as OutcomeWithChildren[];
  const allActivities = (course.activities ?? []) as Activity[];
  const allObjectives = (course.objectives ?? []) as Objective[];
  const selectedActivities = allActivities.filter((a) => a.isSelected === 1);
  const hasObjectives = allObjectives.length > 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container flex items-center gap-4 h-16">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            لوحة التحكم
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 nasaq-gradient rounded-md flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm truncate">{course.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleConvertObjectives}
              disabled={isConvertingObjectives}
              className="gap-1.5 text-xs text-violet-600 border-violet-300 hover:bg-violet-50"
            >
              {isConvertingObjectives ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListChecks className="w-3.5 h-3.5" />}
              {hasObjectives ? "إعادة توليد الأهداف" : "توليد الأهداف الإجرائية"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="gap-1.5 text-xs"
            >
              {isExportingWord ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              تصدير Word
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="gap-1.5 text-xs"
            >
              {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              إعادة التوليد
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Course Card */}
            <div className="bg-card rounded-2xl shadow-nasaq border border-border/50 overflow-hidden">
              <div className="nasaq-gradient p-5">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-white text-lg leading-tight">{course.title}</h1>
                {course.courseCode && <p className="text-white/70 text-sm mt-1">{course.courseCode}</p>}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">المستوى</span>
                  <span className="font-medium">{levelLabels[course.level] || course.level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">نواتج التعلم</span>
                  <span className="font-medium text-primary">{outcomes.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الأهداف الإجرائية</span>
                  <span className="font-medium text-violet-600">{allObjectives.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الأنشطة المقترحة</span>
                  <span className="font-medium text-teal-600">{allActivities.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الأنشطة المختارة</span>
                  <span className="font-medium text-green-600">{selectedActivities.length}</span>
                </div>
                {course.description && (
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>
            </div>

            {/* Hierarchy Legend */}
            <div className="bg-card rounded-2xl shadow-nasaq border border-border/50 p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                هيكل المقرر
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 nasaq-gradient rounded-full flex-shrink-0" />
                  <span className="text-foreground font-medium">ناتج التعلم</span>
                  <span className="text-muted-foreground">(شامل للوحدة)</span>
                </div>
                <div className="flex items-center gap-2 mr-3">
                  <ChevronRight className="w-3 h-3 text-violet-500 flex-shrink-0" />
                  <div className="w-2.5 h-2.5 bg-violet-200 rounded-full flex-shrink-0" />
                  <span className="text-violet-700 font-medium">الأهداف الإجرائية</span>
                  <span className="text-muted-foreground">(قابلة للقياس)</span>
                </div>
                <div className="flex items-center gap-2 mr-6">
                  <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                  <div className="w-2.5 h-2.5 bg-primary/20 rounded-full flex-shrink-0" />
                  <span className="text-primary font-medium">الأنشطة التعليمية</span>
                  <span className="text-muted-foreground">(+ سلم التقدير)</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            {allActivities.length > 0 && (
              <div className="bg-card rounded-2xl shadow-nasaq border border-border/50 p-4">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  تقدم الاختيار
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{selectedActivities.length} من {allActivities.length} نشاط</span>
                  <span>{Math.round((selectedActivities.length / allActivities.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full nasaq-gradient rounded-full transition-all duration-500"
                    style={{ width: `${(selectedActivities.length / allActivities.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-8 xl:col-span-9">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <button
                onClick={() => setViewMode("hierarchical")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "hierarchical"
                    ? "nasaq-gradient text-white shadow-nasaq"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                العرض الهرمي
              </button>
              <button
                onClick={() => setViewMode("flat-activities")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "flat-activities"
                    ? "nasaq-gradient text-white shadow-nasaq"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                جميع الأنشطة ({allActivities.length})
              </button>
              <button
                onClick={() => setViewMode("flat-selected")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === "flat-selected"
                    ? "nasaq-gradient text-white shadow-nasaq"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                المختارة ({selectedActivities.length})
              </button>
            </div>

            {/* Regenerating State */}
            {isRegenerating && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center mb-5">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-primary font-medium">نموذج نهى يعيد توليد الأنشطة...</p>
                <p className="text-sm text-muted-foreground mt-1">يتم توليد نشاطين لكل ناتج تعلم مع سلالم التقدير</p>
              </div>
            )}

            {/* Converting Objectives State */}
            {isConvertingObjectives && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-8 text-center mb-5">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
                <p className="text-violet-700 font-medium">جاري توليد الأهداف الإجرائية...</p>
                <p className="text-sm text-muted-foreground mt-1">ستظهر الأهداف تحت كل ناتج تعلم في العرض الهرمي</p>
              </div>
            )}

            {/* Hierarchical View */}
            {viewMode === "hierarchical" && !isRegenerating && !isConvertingObjectives && (
              <div className="space-y-5">
                {outcomes.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">لا توجد نواتج تعلم</h3>
                    <p className="text-muted-foreground text-sm">أضف نواتج التعلم أولاً ثم أعد التوليد</p>
                  </div>
                ) : (
                  <>
                    {!hasObjectives && (
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
                        <ListChecks className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-violet-700">لم يتم توليد الأهداف الإجرائية بعد</p>
                          <p className="text-xs text-violet-600 mt-0.5">اضغط "توليد الأهداف الإجرائية" في الأعلى لإنشاء أهداف قابلة للقياس تحت كل ناتج تعلم</p>
                        </div>
                      </div>
                    )}
                    {outcomes.map((outcome, i) => (
                      <OutcomeCard
                        key={outcome.id}
                        outcome={outcome}
                        index={i}
                        hasObjectives={hasObjectives}
                        onToggle={handleToggle}
                        togglingId={togglingId}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Flat Activities View */}
            {(viewMode === "flat-activities" || viewMode === "flat-selected") && !isRegenerating && (
              <div className="space-y-4">
                {(viewMode === "flat-selected" ? selectedActivities : allActivities).length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {viewMode === "flat-selected" ? "لم تختر أي نشاط بعد" : "لا توجد أنشطة بعد"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {viewMode === "flat-selected"
                        ? "اختر الأنشطة المناسبة من العرض الهرمي أو قائمة جميع الأنشطة"
                        : "اضغط إعادة التوليد لتوليد الأنشطة"}
                    </p>
                  </div>
                ) : (
                  (viewMode === "flat-selected" ? selectedActivities : allActivities).map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onToggle={handleToggle}
                      isToggling={togglingId === activity.id}
                    />
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Survey Banner - shown when activities exist */}
      {allActivities.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 nasaq-gradient rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">⭐</span>
            </div>
            <div className="flex-1 text-center sm:text-right">
              <p className="font-semibold text-violet-800 text-sm">شاركينا برأيكِ!</p>
              <p className="text-xs text-violet-600 mt-0.5">تجربتكِ مع نسق تهمّنا — أجيبي على استبانة قصيرة وساعدينا في تحسين المنصة</p>
            </div>
            <a
              href="/survey.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 nasaq-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-nasaq hover:opacity-90 transition-opacity"
            >
              قيّمي تجربتكِ ←
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
