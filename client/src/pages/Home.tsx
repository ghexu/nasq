import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  GraduationCap, BookOpen, BarChart3, Award, ArrowLeft,
  CheckCircle2, Brain, ClipboardList, FileCheck2,
  Target, Wand2, BookMarked, PenLine
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const handleStart = () => {
    navigate("/courses/new");
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "تحليل ذكي باستخدام نموذج نهى ",
      desc: "نهى نموذج لغوي (LLM) تابع لشركة علم سيحلل الأهداف ثم يقترح الأنشطة وفق بيانات المتعلمين داخل أنظمة التعلم",
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "أنشطة تعليمية متنوعة",
      desc: "يقترح مشاريع ونقاشات واختبارات ومهاماً تطبيقية مبنية على بيانات وأداء المتعلمين الحقيقية",
      color: "from-teal-500 to-cyan-600",
      bg: "bg-teal-50",
      text: "text-teal-700",
    },
    {
      icon: <FileCheck2 className="w-6 h-6" />,
      title: "سلم تقييم جاهز تلقائياً",
      desc: "يولّد Rubric مفصل لكل نشاط مع معايير التقييم مربوطة مباشرة بنواتج التعلم",
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      icon: <BookMarked className="w-6 h-6" />,
      title: "حفظ واسترجاع المقررات",
      desc: "احفظ مقرراتك المصممة وأنشطتها المختارة لإعادة استخدامها وتطويرها في الفصول القادمة",
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
      text: "text-rose-700",
    },
  ];

  const steps = [
    { num: "١", icon: <Target className="w-6 h-6 text-white" />, title: "أدخل نواتج التعلم", desc: "حدد نواتج التعلم مع مستواها (معرفي، مهاري، قيمي) والأفعال التعليمية" },
    { num: "٢", icon: <Brain className="w-6 h-6 text-white" />, title: "التحليل الذكي", desc: "يحلل الذكاء الاصطناعي النواتج ويفهم السياق الأكاديمي للمقرر" },
    { num: "٣", icon: <ClipboardList className="w-6 h-6 text-white" />, title: "استعرض الاقتراحات", desc: "اختر من الأنشطة المقترحة مع سلالم التقييم الجاهزة لكل نشاط" },
    { num: "٤", icon: <GraduationCap className="w-6 h-6 text-white" />, title: "احفظ وابدأ التدريس", desc: "احفظ المقرر المصمم وابدأ الفصل الدراسي بثقة وكفاءة" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663150332667/4Jdv7YAi4CxEHy7WKEefP5/nasaq_logo_ffeffc76.png"
              alt="شعار نسق"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-lg text-foreground">نسق</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard")} variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
              مقرراتي
            </Button>
            <Button onClick={() => navigate("/about")} variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
              من نحن
            </Button>
            <Button onClick={handleStart} className="nasaq-gradient text-white border-0 shadow-nasaq">
              ابدأ الآن
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>هاكثون ذكاءثون 2026</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              صمّم مقرراتك بذكاء
              <br />
              <span className="nasaq-text-gradient">مع نسق</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              منصة ذكية تساعد أعضاء هيئة التدريس في جامعة الأميرة نورة على تصميم الأنشطة التعليمية وسلالم التقييم تلقائياً بناءً على نواتج التعلم
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleStart}
                className="nasaq-gradient text-white border-0 shadow-nasaq-lg text-base px-8 h-12 gap-2"
              >
                <PenLine className="w-5 h-5" />
                ابدأ تصميم مقررك
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-base px-8 h-12 gap-2 border-border"
              >
                اكتشف المزايا
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { val: "٦+", label: "أنواع أنشطة" },
                { val: "٣", label: "مستويات التعلم" },
                { val: "١٠٠%", label: "مبني على AI" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-primary">{s.val}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">مزايا منصة نسق</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              كل ما تحتاجه لتصميم مقرر دراسي متكامل في مكان واحد
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl p-6 shadow-nasaq hover:shadow-nasaq-lg transition-all duration-300 hover:-translate-y-1 border border-border/50"
              >
                <div className={`w-12 h-12 ${f.bg} ${f.text} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">كيف يعمل نسق؟</h2>
            <p className="text-muted-foreground text-lg">أربع خطوات بسيطة لتصميم مقرر متكامل</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="text-center relative">
                <div className="w-14 h-14 nasaq-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-nasaq">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-0 w-full h-0.5 bg-gradient-to-l from-primary/30 to-transparent -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="nasaq-gradient rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">جاهز لتصميم مقررك؟</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                انضم إلى أعضاء هيئة التدريس الذين يستخدمون نسق لتوفير الوقت والجهد في تصميم مقرراتهم
              </p>
              <Button
                size="lg"
                onClick={handleStart}
                className="bg-white text-primary hover:bg-white/90 text-base px-8 h-12 font-semibold shadow-lg gap-2"
              >
                <Wand2 className="w-5 h-5" />
                ابدأ مجاناً الآن
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="container">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663150332667/4Jdv7YAi4CxEHy7WKEefP5/nasaq_logo_ffeffc76.png"
                alt="شعار نسق"
                className="w-9 h-9 object-contain"
              />
              <div>
                <span className="font-bold text-foreground text-lg">نسق</span>
                <p className="text-xs text-muted-foreground">مساعد التصميم التعليمي الذكي</p>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-foreground">جامعة الأميرة نورة بنت عبدالرحمن</p>
              <p className="text-xs text-muted-foreground mt-0.5">هاكثون ذكاءثون 2026</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} <span className="font-semibold text-foreground">فريق نسق</span> · جميع الحقوق محفوظة
            </p>
            <p className="text-xs text-muted-foreground text-center">
              حقوق الملكية الفكرية محفوظة لفريق نسق · يُحظر النسخ أو إعادة التوزيع دون إذن
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
