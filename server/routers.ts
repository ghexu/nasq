import { z } from "zod";
/**
 * حقوق الملكية الفكرية © 2025 فريق نسق | جامعة الأميرة نورة بنت عبدالرحمن
 * جميع الحقوق محفوظة - يُحظر النسخ أو إعادة التوزيع دون إذن كتابي
 * Copyright © 2025 Nasaq Team | PNU | All Rights Reserved
 */
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeNahya } from "./_core/nahya";
import {
  getCoursesByUser,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getOutcomesByCourse,
  createOutcome,
  deleteOutcome,
  deleteOutcomesByCourse,
  getActivitiesByCourse,
  createActivity,
  updateActivitySelection,
  deleteActivitiesByCourse,
  deleteAiActivitiesByCourse,
  getRubricByActivity,
  createRubric,
  deleteRubricsByActivities,
  getObjectivesByCourse,
  createObjective,
  deleteObjectivesByCourse,
} from "./db";

// Guest user ID used when no authenticated user is present
const GUEST_USER_ID = 0;

const levelEnum = z.enum(["bachelor", "masters", "diploma", "doctorate"]);

// ---- Courses Router ----
const coursesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id ?? GUEST_USER_ID;
    return getCoursesByUser(userId);
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await getCourseById(input.id);
      if (!course) throw new Error("المقرر غير موجود");
      const outcomes = await getOutcomesByCourse(input.id);
      const activitiesList = await getActivitiesByCourse(input.id);
      const activitiesWithRubrics = await Promise.all(
        activitiesList.map(async (act) => {
          const rubric = await getRubricByActivity(act.id);
          return { ...act, rubric: rubric || null };
        })
      );
      const allObjectives = await getObjectivesByCourse(input.id);

      // Group objectives under their parent outcome
      const outcomesWithObjectives = outcomes.map((outcome) => ({
        ...outcome,
        objectives: allObjectives.filter((obj) => obj.outcomeId === outcome.id),
      }));

      // Group activities under their parent outcome
      const outcomesWithAll = outcomesWithObjectives.map((outcome) => ({
        ...outcome,
        activities: activitiesWithRubrics.filter((act) => act.outcomeId === outcome.id),
      }));

      return {
        ...course,
        outcomes: outcomesWithAll,
        activities: activitiesWithRubrics, // flat list kept for export
        objectives: allObjectives,          // flat list kept for export
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        courseCode: z.string().optional(),
        level: levelEnum.default("bachelor"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? GUEST_USER_ID;
      await createCourse({
        userId,
        title: input.title,
        courseCode: input.courseCode,
        level: input.level,
        description: input.description,
        status: "draft",
      });
      const courses = await getCoursesByUser(userId);
      return courses[0];
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        courseCode: z.string().optional(),
        level: levelEnum.optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseById(input.id);
      if (!course) throw new Error("المقرر غير موجود");
      const { id, ...data } = input;
      await updateCourse(id, data);
      return getCourseById(id);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseById(input.id);
      if (!course) throw new Error("المقرر غير موجود");
      const acts = await getActivitiesByCourse(input.id);
      await deleteRubricsByActivities(acts.map((a) => a.id));
      await deleteActivitiesByCourse(input.id);
      await deleteOutcomesByCourse(input.id);
      await deleteObjectivesByCourse(input.id);
      await deleteCourse(input.id);
      return { success: true };
    }),
});

// ---- Learning Outcomes Router ----
const outcomesRouter = router({
  list: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getOutcomesByCourse(input.courseId);
    }),

  add: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        text: z.string().min(1),
        domain: z.enum(["cognitive", "skill", "value"]),
        bloomLevel: z.string().optional(),
        actionVerb: z.string().optional(),
        orderIndex: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createOutcome(input);
      return getOutcomesByCourse(input.courseId);
    }),

  remove: publicProcedure
    .input(z.object({ id: z.number(), courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteOutcome(input.id);
      return getOutcomesByCourse(input.courseId);
    }),
});

// ---- AI Analysis Router ----
const aiRouter = router({
  // Generate course description based on title/level
  generateDescription: publicProcedure
    .input(
      z.object({
        courseTitle: z.string().min(1),
        courseLevel: levelEnum,
        courseCode: z.string().optional(),
        studyPlan: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const levelMap: Record<string, string> = {
        bachelor: "بكالوريوس",
        masters: "ماجستير",
        diploma: "دبلوم",
        doctorate: "دكتوراه",
      };

      const studyPlanSection = input.studyPlan
        ? `\n\nمعلومات الخطة الدراسية للتخصص:\n${input.studyPlan.slice(0, 2000)}`
        : "";

      const prompt = `أنت متخصص في المناهج وتوصيف المقررات الجامعية السعودية.
اكتب وصفاً أكاديمياً مختصراً (3-5 جمل) لمقرر بعنوان: "${input.courseTitle}"
المستوى: ${levelMap[input.courseLevel] || input.courseLevel}
${input.courseCode ? `رمز المقرر: ${input.courseCode}` : ""}${studyPlanSection}

الوصف يجب أن يشمل: محتوى المقرر الرئيسي، أهميته، وما يكتسبه الطالب.${input.studyPlan ? " استند في الوصف على محتوى الخطة الدراسية المقدمة." : ""}
اكتب الوصف باللغة العربية الفصحى فقط، دون عنوان أو مقدمة.`;

      const response = await invokeNahya({
        messages: [
          { role: "system", content: "أنت متخصص في توصيف المقررات الجامعية. أجب بالعربية الفصحى فقط." },
          { role: "user", content: prompt },
        ],
      });
      const description = (response.choices[0].message.content as string).trim();
      return { description };
    }),

  // Convert outcomes to instructional objectives
  convertToObjectives: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseTitle: z.string(),
        outcomes: z.array(
          z.object({
            id: z.number(),
            text: z.string(),
            domain: z.string(),
            bloomLevel: z.string().optional().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const domainMap: Record<string, string> = {
        cognitive: "معرفي",
        skill: "مهاري",
        value: "وجداني",
      };

      const outcomesText = input.outcomes
        .map((o, i) => `${i + 1}. [${domainMap[o.domain] || o.domain}] ${o.text}${o.bloomLevel ? ` - مستوى بلوم: ${o.bloomLevel}` : ""}`)
        .join("\n");

      const prompt = `أنت متخصص في التصميم التعليمي. حوّل نواتج التعلم التالية إلى أهداف إجرائية سلوكية محددة وقابلة للقياس.

المقرر: "${input.courseTitle}"
نواتج التعلم:
${outcomesText}

لكل ناتج تعلم، اكتب 2-3 أهداف إجرائية. كل هدف يجب أن:
- يبدأ بفعل سلوكي قابل للقياس
- يحدد التصنيف (معرفي / مهاري / وجداني)
- يحدد مستوى بلوم المناسب

أعد الرد بـ JSON:
{
  "objectives": [
    {
      "outcomeIndex": 0,
      "text": "نص الهدف الإجرائي",
      "domain": "cognitive|skill|affective",
      "bloomLevel": "التذكر|الفهم|التطبيق|التحليل|التقييم|الإبداع",
      "actionVerb": "الفعل الإجرائي"
    }
  ]
}`;

      const response = await invokeNahya({
        messages: [
          { role: "system", content: "أنت متخصص في التصميم التعليمي. أجب بـ JSON صحيح فقط." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "objectives_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                objectives: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      outcomeIndex: { type: "integer" },
                      text: { type: "string" },
                      domain: { type: "string" },
                      bloomLevel: { type: "string" },
                      actionVerb: { type: "string" },
                    },
                    required: ["outcomeIndex", "text", "domain", "bloomLevel", "actionVerb"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["objectives"],
              additionalProperties: false,
            },
          },
        },
      } as any);

      const content = response.choices[0].message.content;
      const parsed = typeof content === "string" ? JSON.parse(content) : content;

      // Delete old objectives for this course
      await deleteObjectivesByCourse(input.courseId);

      // Save new objectives
      const saved = [];
      for (let i = 0; i < parsed.objectives.length; i++) {
        const obj = parsed.objectives[i];
        const outcome = input.outcomes[obj.outcomeIndex];
        await createObjective({
          courseId: input.courseId,
          outcomeId: outcome?.id ?? 0,
          text: obj.text,
          domain: obj.domain as any,
          bloomLevel: obj.bloomLevel,
          actionVerb: obj.actionVerb,
          orderIndex: i,
        });
      }

      const allObjectives = await getObjectivesByCourse(input.courseId);
      return { objectives: allObjectives };
    }),

  // Main: analyze outcomes and generate 2 activities per outcome + rubrics
  analyzeAndGenerate: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseTitle: z.string(),
        courseLevel: z.string(),
        outcomes: z.array(
          z.object({
            id: z.number(),
            text: z.string(),
            domain: z.string(),
            bloomLevel: z.string().optional().nullable(),
            actionVerb: z.string().optional().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseById(input.courseId);
      if (!course) throw new Error("المقرر غير موجود");

      const levelMap: Record<string, string> = {
        bachelor: "بكالوريوس",
        masters: "ماجستير",
        diploma: "دبلوم",
        doctorate: "دكتوراه",
      };
      const domainMap: Record<string, string> = {
        cognitive: "معرفي",
        skill: "مهاري",
        value: "وجداني",
      };

      const outcomesText = input.outcomes
        .map(
          (o, i) =>
            `${i + 1}. [${domainMap[o.domain] || o.domain}] ${o.text}${o.actionVerb ? ` (الفعل: ${o.actionVerb})` : ""}${o.bloomLevel ? ` - مستوى بلوم: ${o.bloomLevel}` : ""}`
        )
        .join("\n");

      const prompt = `أنت نموذج نهى المتخصص في التصميم التعليمي للبيئة الأكاديمية السعودية.

المقرر الدراسي: "${input.courseTitle}"
المستوى: ${levelMap[input.courseLevel] || input.courseLevel}

نواتج التعلم (${input.outcomes.length} ناتج):
${outcomesText}

المطلوب: قم بتوليد نشاطين تعليميين متنوعين لكل ناتج تعلم (إجمالي ${input.outcomes.length * 2} نشاط).
لكل نشاط، أنشئ سلم تقدير (Rubric) مفصل بـ 3-4 معايير.

أعد الرد بصيغة JSON صارمة:
{
  "activities": [
    {
      "outcomeIndex": 0,
      "title": "عنوان النشاط",
      "type": "project|discussion|quiz|practical|presentation|research",
      "description": "وصف مختصر للنشاط",
      "duration": "مدة النشاط",
      "instructions": "تعليمات تفصيلية للنشاط",
      "rubric": {
        "totalPoints": 100,
        "criteria": [
          {
            "name": "معيار التقدير",
            "weight": 25,
            "excellent": "وصف الأداء الممتاز",
            "good": "وصف الأداء الجيد",
            "needsImprovement": "وصف ما يحتاج تحسين"
          }
        ]
      }
    }
  ]
}

ملاحظات:
- نشاطان لكل ناتج تعلم (outcomeIndex يتكرر مرتين لكل ناتج)
- تنوع في أنواع الأنشطة
- سلم التقدير يحتوي على 3-4 معايير واضحة
- استخدم اللغة العربية الفصحى
- راعِ السياق الأكاديمي السعودي وجامعة الأميرة نورة`;

      const response = await invokeNahya({
        messages: [
          {
            role: "system",
            content: "أنت نموذج نهى، متخصص في التصميم التعليمي والبيئة الأكاديمية السعودية. تجيب دائماً بـ JSON صحيح فقط.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "activities_and_rubrics",
            strict: true,
            schema: {
              type: "object",
              properties: {
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      outcomeIndex: { type: "integer" },
                      title: { type: "string" },
                      type: { type: "string" },
                      description: { type: "string" },
                      duration: { type: "string" },
                      instructions: { type: "string" },
                      rubric: {
                        type: "object",
                        properties: {
                          totalPoints: { type: "integer" },
                          criteria: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                weight: { type: "integer" },
                                excellent: { type: "string" },
                                good: { type: "string" },
                                needsImprovement: { type: "string" },
                              },
                              required: ["name", "weight", "excellent", "good", "needsImprovement"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["totalPoints", "criteria"],
                        additionalProperties: false,
                      },
                    },
                    required: ["outcomeIndex", "title", "type", "description", "duration", "instructions", "rubric"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["activities"],
              additionalProperties: false,
            },
          },
        },
      } as any);

      const content = response.choices[0].message.content;
      const parsed = typeof content === "string" ? JSON.parse(content) : content;

      // Delete only AI-generated activities and their rubrics
      const oldActivities = await getActivitiesByCourse(input.courseId);
      const oldAiActivities = oldActivities.filter((a) => a.isAiGenerated === 1);
      await deleteRubricsByActivities(oldAiActivities.map((a) => a.id));
      await deleteAiActivitiesByCourse(input.courseId);

      // Save new activities and rubrics
      const savedActivities = [];
      for (const act of parsed.activities) {
        const outcome = input.outcomes[act.outcomeIndex];
        await createActivity({
          courseId: input.courseId,
          outcomeId: outcome?.id ?? null,
          title: act.title,
          type: act.type as any,
          description: act.description,
          duration: act.duration,
          instructions: act.instructions,
          isSelected: 0,
          isAiGenerated: 1,
        });
        const newActivities = await getActivitiesByCourse(input.courseId);
        const newAct = newActivities[newActivities.length - 1];
        if (newAct && act.rubric) {
          await createRubric({
            activityId: newAct.id,
            criteria: act.rubric.criteria,
            totalPoints: act.rubric.totalPoints,
          });
        }
        const rubric = newAct ? await getRubricByActivity(newAct.id) : null;
        savedActivities.push({ ...newAct, rubric: rubric || null });
      }

      await updateCourse(input.courseId, { status: "active" });
      return { activities: savedActivities };
    }),

  toggleActivity: publicProcedure
    .input(z.object({ activityId: z.number(), isSelected: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await updateActivitySelection(input.activityId, input.isSelected ? 1 : 0);
      return { success: true };
    }),

  // Export activities as Word document (returns base64 docx)
  exportWord: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input }) => {
      const { Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle, Packer, ShadingType } = await import("docx");

      const course = await getCourseById(input.courseId);
      if (!course) throw new Error("المقرر غير موجود");
      const outcomes = await getOutcomesByCourse(input.courseId);
      const activitiesList = await getActivitiesByCourse(input.courseId);
      const activitiesWithRubrics = await Promise.all(
        activitiesList.map(async (act) => {
          const rubric = await getRubricByActivity(act.id);
          return { ...act, rubric: rubric || null };
        })
      );
      const objectives = await getObjectivesByCourse(input.courseId);

      const levelMap: Record<string, string> = {
        bachelor: "بكالوريوس",
        masters: "ماجستير",
        diploma: "دبلوم",
        doctorate: "دكتوراه",
      };
      const domainMap: Record<string, string> = {
        cognitive: "معرفي",
        skill: "مهاري",
        value: "وجداني",
        affective: "وجداني",
      };
      const typeMap: Record<string, string> = {
        project: "مشروع",
        discussion: "نقاش",
        quiz: "اختبار",
        practical: "مهمة تطبيقية",
        presentation: "عرض تقديمي",
        research: "بحث",
      };

      const selectedActs = activitiesWithRubrics.filter((a) => a.isSelected === 1);
      const actsToExport = selectedActs.length > 0 ? selectedActs : activitiesWithRubrics;

      // Helper to create a styled heading paragraph
      const makeHeading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) =>
        new Paragraph({
          text,
          heading: level,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        });

      // Helper to create a normal RTL paragraph
      const makePara = (text: string, bold = false) =>
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          children: [new TextRun({ text, bold, font: "Arial", size: 24 })],
        });

      // Helper to create a simple 2-col info row table
      const makeInfoTable = (rows: { label: string; value: string }[]) =>
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: rows.map(
            (r) =>
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: "1a5276", fill: "1a5276" },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [new TextRun({ text: r.label, bold: true, color: "FFFFFF", font: "Arial", size: 22 })] })],
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [new TextRun({ text: r.value, font: "Arial", size: 22 })] })],
                  }),
                ],
              })
          ),
        });

      const children: any[] = [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          children: [new TextRun({ text: "منصة نسق - تقرير المقرر الدراسي", bold: true, font: "Arial", size: 36, color: "1a5276" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          children: [new TextRun({ text: "جامعة الأميرة نورة بنت عبدالرحمن | كلية التربية والموارد البشرية", font: "Arial", size: 20, color: "666666" })],
        }),
        new Paragraph({ text: "" }),

        // Course info section
        makeHeading("بيانات المقرر", HeadingLevel.HEADING_1),
        makeInfoTable([
          { label: "اسم المقرر", value: course.title },
          ...(course.courseCode ? [{ label: "رمز المقرر", value: course.courseCode }] : []),
          { label: "المستوى الأكاديمي", value: levelMap[course.level] || course.level },
          ...(course.description ? [{ label: "وصف المقرر", value: course.description }] : []),
        ]),
        new Paragraph({ text: "" }),

        // Learning outcomes
        makeHeading("نواتج التعلم", HeadingLevel.HEADING_1),
        ...outcomes.map((o, i) =>
          makePara(`${i + 1}. ${o.text} [${domainMap[o.domain] || o.domain}${o.bloomLevel ? " - " + o.bloomLevel : ""}]`)
        ),
        new Paragraph({ text: "" }),

        // Objectives
        ...(objectives.length > 0
          ? [
              makeHeading("الأهداف الإجرائية", HeadingLevel.HEADING_1),
              ...objectives.map((obj, i) =>
                makePara(`${i + 1}. ${obj.text} [${domainMap[obj.domain] || obj.domain}${obj.bloomLevel ? " - " + obj.bloomLevel : ""}]`)
              ),
              new Paragraph({ text: "" }),
            ]
          : []),

        // Activities
        makeHeading(`الأنشطة التعليمية ${selectedActs.length > 0 ? "المختارة" : "المقترحة"} (${actsToExport.length} نشاط)`, HeadingLevel.HEADING_1),
      ];

      // Add each activity
      for (let i = 0; i < actsToExport.length; i++) {
        const act = actsToExport[i];
        const rubric = act.rubric as any;
        const criteria = rubric && Array.isArray(rubric.criteria) ? rubric.criteria : [];

        children.push(makeHeading(`${i + 1}. ${act.title} [${typeMap[act.type] || act.type}]`, HeadingLevel.HEADING_2));
        if (act.description) children.push(makePara(`الوصف: ${act.description}`));
        if (act.duration) children.push(makePara(`المدة: ${act.duration}`));
        if (act.instructions) children.push(makePara(`التعليمات: ${act.instructions}`));

        if (criteria.length > 0) {
          children.push(makeHeading(`سلم التقدير (${rubric.totalPoints} درجة)`, HeadingLevel.HEADING_3));
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: ["المعيار", "الوزن", "ممتاز", "جيد", "يحتاج تحسين"].map(
                    (h) =>
                      new TableCell({
                        shading: { type: ShadingType.SOLID, color: "1a5276", fill: "1a5276" },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: h, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
                      })
                  ),
                }),
                ...criteria.map(
                  (c: any) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [new TextRun({ text: c.name, font: "Arial", size: 20 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${c.weight}%`, font: "Arial", size: 20 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [new TextRun({ text: c.excellent || "", font: "Arial", size: 20 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [new TextRun({ text: c.good || "", font: "Arial", size: 20 })] })] }),
                        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [new TextRun({ text: c.needsImprovement || "", font: "Arial", size: 20 })] })] }),
                      ],
                    })
                ),
              ],
            })
          );
        }
        children.push(new Paragraph({ text: "" }));
      }

      // Footer
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          bidirectional: true,
          children: [new TextRun({ text: "© فريق نسق - جامعة الأميرة نورة بنت عبدالرحمن | جميع الحقوق محفوظة", font: "Arial", size: 18, color: "666666" })],
        })
      );

      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 720, bottom: 720, left: 1080, right: 1080 } } },
          children,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const base64 = buffer.toString("base64");
      return { base64, filename: `نسق-${course.title.replace(/\s+/g, "-")}.docx` };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  courses: coursesRouter,
  outcomes: outcomesRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
