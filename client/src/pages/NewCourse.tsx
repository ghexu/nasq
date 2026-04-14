/**
 * حقوق الملكية الفكرية © 2025 فريق نسق | جامعة الأميرة نورة بنت عبدالرحمن
 * جميع الحقوق محفوظة - يُحظر النسخ أو إعادة التوزيع دون إذن كتابي
 */
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  GraduationCap, Plus, Trash2, ArrowRight, Brain, BookOpen,
  CheckCircle2, Loader2, Upload, FileText, X, Wand2, PenLine, ClipboardList
} from "lucide-react";

type OutcomeInput = {
  text: string;
  domain: "cognitive" | "skill" | "value";
  bloomLevel: string;
  actionVerb: string;
};

const domainOptions = [
  { value: "cognitive", label: "معرفي", desc: "المعرفة والفهم والتحليل", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "skill",     label: "مهاري", desc: "التطبيق والمهارات العملية", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "value",     label: "وجداني", desc: "الاتجاهات والقيم والمواقف", color: "bg-amber-50 text-amber-700 border-amber-200" },
];

const bloomLevels = [
  "التذكر", "الفهم", "التطبيق", "التحليل", "التقييم", "الإبداع"
];

const actionVerbs: Record<string, string[]> = {
  cognitive: ["يعرّف", "يصف", "يشرح", "يحلل", "يقارن", "يقيّم", "يصمم", "يستنتج"],
  skill:     ["يطبّق", "ينفّذ", "يبني", "يستخدم", "يظهر", "يمارس", "يجري", "يحل"],
  value:     ["يقدّر", "يتبنى", "يلتزم", "يدافع", "يختار", "يؤمن", "يعتز", "يتعاون"],
};

const levelOptions = [
  { value: "bachelor",  label: "بكالوريوس" },
  { value: "diploma",   label: "دبلوم" },
  { value: "masters",   label: "ماجستير" },
  { value: "doctorate", label: "دكتوراه" },
];

export default function NewCourse() {
  const [, navigate] = useLocation();

  const [step, setStep] = useState<1 | 2>(1);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode]   = useState("");
  const [courseLevel, setCourseLevel] = useState<"bachelor" | "masters" | "diploma" | "doctorate">("bachelor");
  const [description, setDescription] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([
    { text: "", domain: "cognitive", bloomLevel: "", actionVerb: "" },
  ]);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Study plan state
  const [studyPlanText, setStudyPlanText] = useState("");
  const [studyPlanFile, setStudyPlanFile] = useState<File | null>(null);
  const studyPlanFileRef = useRef<HTMLInputElement>(null);

  const utils               = trpc.useUtils();
  const createCourseMutation = trpc.courses.create.useMutation();
  const addOutcomeMutation   = trpc.outcomes.add.useMutation();
  const aiMutation           = trpc.ai.analyzeAndGenerate.useMutation();
  const genDescMutation      = trpc.ai.generateDescription.useMutation();

  // ── File upload handlers ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    if (!allowed.includes(file.type)) {
      toast.error("يُسمح فقط بملفات PDF أو Word أو TXT");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
      return;
    }
    setUploadedFile(file);
    toast.success(`تم رفع الملف: ${file.name}`);
  };

  // ── Study plan file handler ──
  const handleStudyPlanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    if (!allowed.includes(file.type)) {
      toast.error("يُسمح فقط بملفات PDF أو Word أو TXT");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
      return;
    }
    setStudyPlanFile(file);
    // Read file text for TXT files
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setStudyPlanText(ev.target?.result as string || "");
      reader.readAsText(file);
    }
    toast.success(`تم رفع الخطة الدراسية: ${file.name}`);
  };

  // ── Auto-generate description ──
  const handleGenerateDescription = async () => {
    if (!courseTitle.trim() && !studyPlanText.trim() && !studyPlanFile) {
      toast.error("يرجى إدخال اسم المقرر أو الخطة الدراسية أولاً");
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const result = await genDescMutation.mutateAsync({
        courseTitle: courseTitle || "مقرر دراسي",
        courseLevel,
        courseCode: courseCode || undefined,
        studyPlan: studyPlanText || undefined,
      });
      setDescription(result.description);
      toast.success("تم توليد وصف المقرر بنجاح!");
    } catch {
      toast.error("حدث خطأ أثناء توليد الوصف");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // ── Outcomes helpers ──
  const addOutcome = () => {
    setOutcomes([...outcomes, { text: "", domain: "cognitive", bloomLevel: "", actionVerb: "" }]);
  };

  const removeOutcome = (idx: number) => {
    if (outcomes.length === 1) return;
    setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const updateOutcome = (idx: number, field: keyof OutcomeInput, value: string) => {
    const updated = [...outcomes];
    updated[idx] = { ...updated[idx], [field]: value };
    setOutcomes(updated);
  };

  // ── Step 1 submit ──
  const handleStep1 = async () => {
    if (!courseTitle.trim()) { toast.error("يرجى إدخال اسم المقرر"); return; }
    if (outcomes.some((o) => !o.text.trim())) { toast.error("يرجى إدخال نص جميع نواتج التعلم"); return; }
    if (outcomes.some((o) => !o.domain))      { toast.error("يرجى تحديد مجال جميع نواتج التعلم"); return; }

    try {
      const course = await createCourseMutation.mutateAsync({
        title: courseTitle,
        courseCode: courseCode || undefined,
        level: courseLevel,
        description: description || undefined,
      });

      if (!course) throw new Error("فشل إنشاء المقرر");
      const courseId = (course as any).insertId ?? (course as any).id;

      for (let i = 0; i < outcomes.length; i++) {
        const o = outcomes[i];
        await addOutcomeMutation.mutateAsync({
          courseId,
          text: o.text,
          domain: o.domain,
          bloomLevel: o.bloomLevel || undefined,
          actionVerb: o.actionVerb || undefined,
          orderIndex: i,
        });
      }

      setCreatedCourseId(courseId);
      setStep(2);
    } catch {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  // ── Step 2: generate activities ──
  const handleGenerate = async () => {
    if (!createdCourseId) return;
    setIsGenerating(true);
    try {
      // جلب النواتج الحقيقية من قاعدة البيانات للحصول على IDs الصحيحة
      const dbOutcomes = await utils.outcomes.list.fetch({ courseId: createdCourseId });
      const savedOutcomes = dbOutcomes.map((o: any) => ({
        id: o.id,
        text: o.text,
        domain: o.domain,
        bloomLevel: o.bloomLevel || null,
        actionVerb: o.actionVerb || null,
      }));

      await aiMutation.mutateAsync({
        courseId: createdCourseId,
        courseTitle,
        courseLevel,
        outcomes: savedOutcomes,
      });

      toast.success("تم توليد الأنشطة وسلالم التقدير بنجاح!");
      navigate(`/courses/${createdCourseId}`);
    } catch {
      toast.error("حدث خطأ أثناء توليد الأنشطة، يرجى المحاولة مرة أخرى");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate("/dashboard"))}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            {step === 2 ? "العودة" : "لوحة التحكم"}
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 nasaq-gradient rounded-md flex items-center justify-center">
              <PenLine className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">إنشاء مقرر جديد</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-3 max-w-lg">
            {[
              { num: 1, label: "بيانات المقرر ونواتج التعلم" },
              { num: 2, label: "توليد الأنشطة بالذكاء الاصطناعي" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-3 flex-1">
                <div className={`flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step > s.num ? "nasaq-gradient text-white" : step === s.num ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 1 && <div className={`flex-1 h-0.5 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        {step === 1 && (
          <div className="space-y-8">
            {/* Course Info */}
            <div className="bg-card rounded-2xl p-6 shadow-nasaq border border-border/50">
              <h2 className="font-semibold text-foreground text-lg mb-5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                بيانات المقرر
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm font-medium mb-1.5 block">اسم المقرر *</Label>
                  <Input
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="أدخل اسم المقرر كاملاً"
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">رمز المقرر</Label>
                  <Input
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="أدخل رمز المقرر"
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">المستوى الأكاديمي</Label>
                  <Select value={courseLevel} onValueChange={(v) => setCourseLevel(v as any)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Study Plan Section */}
                <div className="col-span-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">الخطة الدراسية للتخصص</p>
                        <p className="text-xs text-amber-700">أضف الخطة الدراسية لتوليد وصف دقيق للمقرر بالذكاء الاصطناعي</p>
                      </div>
                    </div>

                    {/* Study plan text input */}
                    <div>
                      <p className="text-xs text-amber-700 mb-1.5">الصق محتوى الخطة الدراسية أو وصف التخصص هنا لتوليد وصف دقيق للمقرر:</p>
                      <Textarea
                        value={studyPlanText}
                        onChange={(e) => setStudyPlanText(e.target.value)}
                        placeholder="مثال: تخصص تصميم التعليم والتكنولوجيا - مستوى الماجستير المهني. يشمل مقررات: أسس تصميم التعليم، تكنولوجيا التعليم، التقييم التربوي..."
                        className="resize-none h-24 text-sm bg-white border-amber-200 focus:border-amber-400"
                      />
                    </div>

                    {/* Study plan file upload */}
                    <div
                      onClick={() => studyPlanFileRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-3 cursor-pointer transition-all ${
                        studyPlanFile
                          ? "border-amber-400 bg-amber-50"
                          : "border-amber-200 hover:border-amber-400 hover:bg-amber-50/50"
                      }`}
                    >
                      <input
                        ref={studyPlanFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleStudyPlanFile}
                        className="hidden"
                      />
                      {studyPlanFile ? (
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-amber-900 truncate">{studyPlanFile.name}</p>
                            <p className="text-xs text-amber-700">{(studyPlanFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setStudyPlanFile(null); setStudyPlanText(""); if (studyPlanFileRef.current) studyPlanFileRef.current.value = ""; }}
                            className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <p className="text-xs text-amber-700">أو ارفع ملف الخطة الدراسية (PDF أو Word أو TXT)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description with AI generation */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-medium">وصف المقرر</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDesc}
                      className="h-7 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                    >
                      {isGeneratingDesc ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      توليد بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أدخل وصف المقرر يدوياً، أو أضف الخطة الدراسية أعلاه ثم اضغط 'توليد بالذكاء الاصطناعي'"
                    className="resize-none h-24"
                  />
                </div>

                {/* Course Specification File Upload */}
                <div className="col-span-2">
                  <Label className="text-sm font-medium mb-1.5 block">ملف توصيف المقرر (اختياري)</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                      uploadedFile
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {uploadedFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">ارفع ملف توصيف المقرر</p>
                          <p className="text-xs text-muted-foreground">PDF أو Word أو TXT – حتى 5 ميجابايت</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-card rounded-2xl p-6 shadow-nasaq border border-border/50">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  الأهداف الإجرائية
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {outcomes.length} ناتج
                </span>
              </div>

              <div className="space-y-4">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-4 bg-muted/20 relative group">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 nasaq-gradient rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          value={outcome.text}
                          onChange={(e) => updateOutcome(idx, "text", e.target.value)}
                          placeholder="أن يكون الطالب قادراً على..."
                          className="resize-none h-16 text-sm"
                        />

                        <div className="grid grid-cols-3 gap-3">
                          {/* Domain */}
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">التصنيف</Label>
                            <Select
                              value={outcome.domain}
                              onValueChange={(v) => updateOutcome(idx, "domain", v)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {domainOptions.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>
                                    <span className="flex items-center gap-1.5">
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${d.color}`}>{d.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Bloom Level */}
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">المستوى</Label>
                            <Select
                              value={outcome.bloomLevel || "__none__"}
                              onValueChange={(v) => updateOutcome(idx, "bloomLevel", v === "__none__" ? "" : v)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="اختر المستوى" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">— اختر —</SelectItem>
                                {bloomLevels.map((b) => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Action Verb */}
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">الفعل الإجرائي</Label>
                            <Select
                              value={outcome.actionVerb || "__none__"}
                              onValueChange={(v) => updateOutcome(idx, "actionVerb", v === "__none__" ? "" : v)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="اختر الفعل" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">— اختر —</SelectItem>
                                {(actionVerbs[outcome.domain] || []).map((v) => (
                                  <SelectItem key={v} value={v}>{v}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {outcomes.length > 1 && (
                        <button
                          onClick={() => removeOutcome(idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white mt-1 flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addOutcome}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary"
              >
                <Plus className="w-4 h-4" />
                إضافة ناتج تعلم
              </button>
            </div>

            <Button
              onClick={handleStep1}
              disabled={createCourseMutation.isPending || addOutcomeMutation.isPending}
              className="w-full nasaq-gradient text-white border-0 shadow-nasaq h-12 text-base gap-2"
            >
              {(createCourseMutation.isPending || addOutcomeMutation.isPending) ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
              ) : (
                <><Brain className="w-5 h-5" /> التالي: توليد الأنشطة</>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-card rounded-2xl p-8 shadow-nasaq border border-border/50 text-center">
            <div className="w-16 h-16 nasaq-gradient rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-bold text-foreground text-xl mb-3">جاهز لتوليد الأنشطة</h2>
            <p className="text-muted-foreground mb-2 text-sm leading-relaxed max-w-md mx-auto">
              سيقوم نموذج نهى بتحليل <strong>{outcomes.length}</strong> ناتج تعلم وتوليد{" "}
              <strong>نشاطين لكل ناتج</strong> مع سلالم التقدير المناسبة.
            </p>
            <div className="bg-muted/40 rounded-xl p-4 mb-6 text-right max-w-md mx-auto">
              <p className="text-xs font-semibold text-foreground mb-2">نواتج التعلم المُدخلة:</p>
              {outcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="w-4 h-4 nasaq-gradient rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{o.text}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="nasaq-gradient text-white border-0 shadow-nasaq h-12 px-8 text-base gap-2"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> نموذج نهى يعمل...</>
              ) : (
                <><Wand2 className="w-5 h-5" /> توليد الأنشطة وسلالم التقدير</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
