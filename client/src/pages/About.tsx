/**
 * حقوق الملكية الفكرية © 2025 فريق نسق | جامعة الأميرة نورة بنت عبدالرحمن
 */
import { useLocation } from "wouter";
import { ArrowRight, GraduationCap, Brain, Target, Users, Lightbulb, Star, BookOpen, Award, Zap, Heart, AlertTriangle, CheckCircle2, TrendingUp, Link2, Puzzle, BarChart3 } from "lucide-react";

const teamMembers = [
  {
    name: "ندى المطيري",
    role: "مدير المشروع",
    specialty: "مصممة تعليمية",
    initial: "ن",
    color: "from-teal-500 to-cyan-600",
  },
  {
    name: "أمل العتيبي",
    role: "مطورة المحتوى",
    specialty: "مصممة تعليمية",
    initial: "أ",
    color: "from-rose-500 to-pink-600",
  },
  {
    name: "رهف السويد",
    role: "مصممة الجرافيكس",
    specialty: "مصممة تعليمية",
    initial: "ر",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "غزيل الهداب",
    role: "UI/UX",
    specialty: "تقنية المعلومات",
    initial: "غ",
    color: "from-amber-500 to-orange-600",
  },
];

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "تحليل نواتج التعلم",
    desc: "تحلل المنصة نواتج التعلم وتفهم السياق الأكاديمي السعودي تلقائياً بالذكاء الاصطناعي",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "توليد نشاطين لكل ناتج",
    desc: "يقترح نموذج نهى نشاطين تعليميين متنوعين لكل ناتج تعلم مع سلالم التقدير المناسبة",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "تحويل النواتج لأهداف",
    desc: "يحوّل نواتج التعلم إلى أهداف إجرائية سلوكية قابلة للقياس بتصنيفاتها الثلاثة",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "سلالم التقدير الذكية",
    desc: "يولّد سلالم تقدير مفصلة لكل نشاط بمعايير واضحة مرتبطة مباشرة بنواتج التعلم",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "دعم اللغة العربية",
    desc: "مبني خصيصاً للبيئة الأكاديمية السعودية مع دعم كامل للغة العربية والسياق المحلي",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "تصدير قابل للتعديل",
    desc: "تصدير الأنشطة وسلالم التقدير بصيغة Word قابلة للتعديل لتسهيل التطبيق الفعلي",
    color: "bg-rose-50 text-rose-600",
  },
];

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container flex items-center gap-4 h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 nasaq-gradient rounded-md flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">من نحن</span>
          </div>
        </div>
      </header>

      <div className="container py-10 max-w-4xl space-y-12">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 flex items-center justify-center mx-auto">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663150332667/4Jdv7YAi4CxEHy7WKEefP5/nasaq_logo_ffeffc76.png"
              alt="شعار نسق"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">مشروع "نسق"</h1>
          <p className="text-xl text-primary font-semibold">مساعد التصميم التعليمي الذكي</p>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            منصة ذكية مبنية بتقنية الذكاء الاصطناعي، تُمكّن أعضاء هيئة التدريس في جامعة الأميرة نورة بنت عبدالرحمن من تصميم أنشطة تعليمية وسلالم تقدير احترافية في دقائق، بدلاً من ساعات.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="bg-primary/10 text-primary text-sm px-4 py-1.5 rounded-full font-medium">هاكثون ذكاءثون 2026</span>
            <span className="bg-muted text-muted-foreground text-sm px-4 py-1.5 rounded-full">جامعة الأميرة نورة بنت عبدالرحمن</span>
          </div>
        </div>

        {/* Project Idea */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-nasaq overflow-hidden">
          <div className="nasaq-gradient p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">فكرة المشروع</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-foreground leading-relaxed">
              يواجه أعضاء هيئة التدريس صعوبة في تكييف المقررات واختيار الأنشطة وسلالم التقدير التي تخدم نواتج التعلم مع بداية كل فصل دراسي. <strong>نسق</strong> يقدم حلاً ذكياً يعتمد على تقارير وتحليلات المتعلمين لاقتراح الأنشطة وسلالم التقدير المناسبة والتي حققت نواتج التعلم المأمولة سابقاً.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                { label: "المشكلة", text: "صعوبة تصميم الأنشطة وسلالم التقدير يدوياً لكل مقرر في بداية كل فصل", icon: <AlertTriangle className="w-5 h-5" />, bg: "bg-amber-50", color: "text-amber-600" },
                { label: "الحل", text: 'نموذج "نهى" - نموذج لغوي (LLM) صممته شركة علم - يحلل نواتج التعلم ويقترح نشاطين متنوعين مع سلم تقدير جاهز لكل نشاط', icon: <CheckCircle2 className="w-5 h-5" />, bg: "bg-teal-50", color: "text-teal-600" },
                { label: "الأثر", text: "توفير وقت عضو هيئة التدريس والتركيز على تطوير المحتوى وتقديم تغذية راجعة فعالة", icon: <TrendingUp className="w-5 h-5" />, bg: "bg-violet-50", color: "text-violet-600" },
              ].map((item) => (
                <div key={item.label} className="bg-muted/40 rounded-xl p-4 border border-border/50">
                  <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>{item.icon}</div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Nasaq Section */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-nasaq p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-primary text-xl font-bold">ن</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">لماذا نسق؟</h2>
          </div>

          <div className="bg-gradient-to-l from-primary/5 to-transparent border border-primary/20 rounded-xl p-5 mb-6">
            <p className="text-foreground font-semibold text-lg leading-relaxed">
              "نسق" اسم مستوحى من مفهوم التنسيق والتكامل — فالمنصة لا تعمل بشكل معزول بل تتكامل مع أنظمة إدارة التعلم (LMS) لتستقي بيانات المتعلمين وتحللها، وتنسق بين نواتج التعلم والأنشطة وسلالم التقدير في منظومة واحدة متسقة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Link2 className="w-5 h-5" />,
                bg: "bg-teal-50", color: "text-teal-600",
                title: "تكامل مع LMS",
                desc: "تتصل نسق بأنظمة إدارة التعلم لتستقي بيانات المتعلمين وأداءهم الفعلي"
              },
              {
                icon: <Puzzle className="w-5 h-5" />,
                bg: "bg-violet-50", color: "text-violet-600",
                title: "تنسيق شامل",
                desc: "تربط نسق بين نواتج التعلم والأنشطة وسلالم التقدير في منظومة واحدة متكاملة"
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                bg: "bg-blue-50", color: "text-blue-600",
                title: "قرارات مبنية على بيانات",
                desc: "يقترح نسق أنشطة حققت نواتج تعلم مأمولة لدى متعلمين سابقين في نفس السياق"
              },
            ].map((item) => (
              <div key={item.title} className="bg-muted/40 rounded-xl p-4 border border-border/50">
                <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>{item.icon}</div>
                <p className="text-sm font-bold text-primary mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unique Value */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-nasaq p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">الميزة الفريدة</h2>
          </div>

          <div className="bg-gradient-to-l from-primary/5 to-transparent border border-primary/20 rounded-xl p-5 mb-6">
            <p className="text-foreground font-semibold text-lg leading-relaxed">
              "نسق" هو المنصة الأولى المبنية خصيصاً للبيئة الأكاديمية السعودية التي تربط بين نواتج التعلم وتوليد الأنشطة وسلالم التقدير في خطوة واحدة، مع دعم كامل للغة العربية والسياق المحلي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-nasaq p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">فريق نسق</h2>
              <p className="text-sm text-muted-foreground">كلية التربية والتنمية البشرية — الماجستير المهني في تصميم التعليم والتكنولوجيا</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${member.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-nasaq group-hover:scale-105 transition-transform`}>
                  <span className="text-white text-3xl font-bold">{member.initial}</span>
                </div>
                <h3 className="font-bold text-foreground text-base">{member.name}</h3>
                <p className="text-sm text-primary font-medium mt-0.5">{member.role}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{member.specialty}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">المشرفة الأكاديمية</p>
              <p className="font-bold text-foreground">أ.د. سهام الجريوي</p>
              <p className="text-xs text-muted-foreground mt-0.5">كلية التربية والتنمية البشرية</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">الجهة المنظمة</p>
              <p className="font-bold text-foreground">جامعة الأميرة نورة بنت عبدالرحمن</p>
              <p className="text-xs text-muted-foreground mt-0.5">هاكثون ذكاءثون 2026</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground">
            © 2026 · <span className="font-semibold text-foreground">فريق نسق</span> · جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            جامعة الأميرة نورة بنت عبدالرحمن · كلية التربية والموارد البشرية
          </p>
        </div>
      </div>
    </div>
  );
}
