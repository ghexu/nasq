import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
      <div className="text-center max-w-md px-4">
        {/* Logo */}
        <div className="w-16 h-16 nasaq-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-nasaq">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        {/* 404 */}
        <div className="text-8xl font-bold nasaq-text-gradient mb-4">٤٠٤</div>

        <h1 className="text-2xl font-bold text-foreground mb-3">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setLocation("/")}
            className="nasaq-gradient text-white border-0 shadow-nasaq gap-2"
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            لوحة التحكم
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-10">
          © {new Date().getFullYear()} <span className="font-semibold text-foreground">فريق نسق</span> · جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
