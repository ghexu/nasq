import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  GraduationCap, Plus, BookOpen, Clock, CheckCircle2, ChevronLeft,
  LayoutDashboard, LogOut, Trash2, Archive, BookMarked, Users,
  Wand2, PenLine
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const levelLabels: Record<string, string> = {
  bachelor: "بكالوريوس",
  masters: "ماجستير",
  diploma: "دبلوم",
  doctorate: "دكتوراه",
};
const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-amber-100 text-amber-700" },
  active: { label: "نشط", color: "bg-green-100 text-green-700" },
  archived: { label: "مؤرشف", color: "bg-gray-100 text-gray-600" },
};

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: courses, isLoading, refetch } = trpc.courses.list.useQuery(undefined, {
    enabled: true,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المقرر بنجاح");
      refetch();
      setDeletingId(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
      setDeletingId(null);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 nasaq-gradient rounded-xl flex items-center justify-center animate-pulse">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const activeCourses = courses?.filter((c) => c.status === "active").length ?? 0;
  const draftCourses = courses?.filter((c) => c.status === "draft").length ?? 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-card border-l border-border flex flex-col z-40 shadow-nasaq">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663150332667/4Jdv7YAi4CxEHy7WKEefP5/nasaq_logo_ffeffc76.png"
              alt="شعار نسق"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-lg">نسق</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm">
            <LayoutDashboard className="w-4 h-4" />
            لوحة التحكم
          </button>
          <button
            onClick={() => navigate("/courses/new")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            مقرر جديد
          </button>
          <button
            onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          >
            <BookMarked className="w-4 h-4" />
            مقرراتي
          </button>
          <button
            onClick={() => navigate("/about")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          >
            <Users className="w-4 h-4" />
            من نحن
          </button>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 nasaq-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "م"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || "عضو هيئة تدريس"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </>
          ) : (
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <PenLine className="w-4 h-4" />
              تسجيل الدخول لحفظ المقررات
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              مرحباً، {user?.name?.split(" ")[0] || "أستاذ"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">إليك نظرة عامة على مقرراتك</p>
          </div>
          <Button
            onClick={() => navigate("/courses/new")}
            className="nasaq-gradient text-white border-0 shadow-nasaq gap-2"
          >
            <Plus className="w-4 h-4" />
            مقرر جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { icon: <BookOpen className="w-5 h-5" />, val: courses?.length ?? 0, label: "إجمالي المقررات", color: "text-primary", bg: "bg-primary/10" },
            { icon: <CheckCircle2 className="w-5 h-5" />, val: activeCourses, label: "مقررات نشطة", color: "text-green-600", bg: "bg-green-50" },
            { icon: <Clock className="w-5 h-5" />, val: draftCourses, label: "مسودات", color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 shadow-nasaq border border-border/50">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-foreground">{s.val}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Courses List */}
        <div id="courses-section" className="bg-card rounded-2xl shadow-nasaq border border-border/50">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-lg">مقرراتي الدراسية</h2>
            <span className="text-sm text-muted-foreground">{courses?.length ?? 0} مقرر</span>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 shimmer rounded-xl" />
              ))}
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 nasaq-gradient-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">لا توجد مقررات بعد</h3>
              <p className="text-muted-foreground text-sm mb-6">ابدأ بإنشاء مقررك الأول وصمّم أنشطته بالذكاء الاصطناعي</p>
              <Button
                onClick={() => navigate("/courses/new")}
                className="nasaq-gradient text-white border-0 shadow-nasaq gap-2"
              >
                <Plus className="w-4 h-4" />
                إنشاء مقرر جديد
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {courses.map((course) => {
                const status = statusLabels[course.status] ?? statusLabels.draft;
                return (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="w-10 h-10 nasaq-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {course.courseCode && <span>{course.courseCode}</span>}
                        <span>{levelLabels[course.level] || course.level}</span>
                        <span>{new Date(course.updatedAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المقرر؟")) {
                            setDeletingId(course.id);
                            deleteMutation.mutate({ id: course.id });
                          }
                        }}
                        disabled={deletingId === course.id}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Team + Copyright Footer */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-4 font-medium tracking-widest">أعضاء فريق نسق</p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            {["ندى المطيري", "رهف السويد", "أمل العتيبي", "غزيل الهداب"].map((name) => (
              <div key={name} className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-full px-4 py-1.5">
                <div className="w-1.5 h-1.5 nasaq-gradient rounded-full flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{name}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-semibold text-foreground">فريق نسق</span> · جميع الحقوق محفوظة
            </p>
            <p className="text-xs text-muted-foreground">
              جامعة الأميرة نورة بنت عبدالرحمن
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
