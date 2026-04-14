import { Sparkles } from "lucide-react";

const teamMembers = [
  "ندى المطيري",
  "رهف السويد",
  "أمل العتيبي",
  "غزيل الهداب",
];

export default function NasaqFooter() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto" dir="rtl">
      <div className="container py-8">
        {/* Team Section */}
        <div className="flex flex-col items-center gap-5">
          {/* Logo + Team Name */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663150332667/4Jdv7YAi4CxEHy7WKEefP5/nasaq_logo_ffeffc76.png"
              alt="شعار نسق"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-foreground text-lg tracking-wide">فريق نسق</span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full max-w-sm">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">أعضاء الفريق</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Team Members */}
          <div className="flex flex-wrap justify-center gap-3">
            {teamMembers.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-full px-4 py-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="w-1.5 h-1.5 nasaq-gradient rounded-full flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{name}</span>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-foreground">فريق نسق</span>
              {" "}· جميع الحقوق محفوظة ·
            </p>
            <p className="text-xs text-muted-foreground">
              جامعة الأميرة نورة بنت عبدالرحمن
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
