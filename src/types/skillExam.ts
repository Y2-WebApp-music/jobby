import {
  EXAM_QUESTION_COUNT,
  normalizeExamSkillKey,
  type ExamQuestion,
} from "./examQuestion";
import { questionKeMou } from "./questionKeMou";
import { questionKeMouYesMa } from "./questionKeMouYesMa";
import { questionKeYes } from "./questionKeYes";

export type SkillExam = {
  key: string;
  skillName: string;
  title: string;
  description: string;
  questionCount: number;
  passScore: number;
  questions: ExamQuestion[];
};

const skillExams: SkillExam[] = [
  {
    key: "ke yes",
    skillName: "Ke yes",
    title: "Ke yes Test",
    description:
      "This exam checks whether you can recognize blind agreement, give honest feedback, and respond with thoughtful collaboration instead of saying yes too quickly.",
    questionCount: EXAM_QUESTION_COUNT,
    passScore: 6,
    questions: questionKeYes,
  },
  {
    key: "ke mou",
    skillName: "Ke mou",
    title: "Ke mou Test",
    description:
      "This exam checks whether you can identify exaggeration, describe work accurately, and communicate your value with evidence instead of empty boasting.",
    questionCount: EXAM_QUESTION_COUNT,
    passScore: 6,
    questions: questionKeMou,
  },
  {
    key: "ke mou yes ma",
    skillName: "Ke mou yes ma",
    title: "Ke mou yes ma Test",
    description:
      "This exam checks whether you can spot unbelievable claims, keep communication realistic, and protect trust with clear facts and believable scope.",
    questionCount: EXAM_QUESTION_COUNT,
    passScore: 6,
    questions: questionKeMouYesMa,
  },
];

const skillExamAliases: Record<string, string> = {
  "ke yes": "ke yes",
  keyes: "ke yes",
  "ke mou": "ke mou",
  kemou: "ke mou",
  "ke mou yes ma": "ke mou yes ma",
};

export const getSkillExam = (skillName: string | null | undefined) => {
  if (!skillName) return null;

  const normalizedSkillName = normalizeExamSkillKey(skillName);
  const resolvedKey = skillExamAliases[normalizedSkillName] ?? normalizedSkillName;

  return skillExams.find((exam) => exam.key === resolvedKey) ?? null;
};
