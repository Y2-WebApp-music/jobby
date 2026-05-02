export type ExamQuestionSeed = {
  prompt: string;
  choices: string[];
  correctAnswer: number;
};

export type ExamQuestion = ExamQuestionSeed & {
  id: string;
};

export const EXAM_QUESTION_COUNT = 10;

export const normalizeExamSkillKey = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const createExamQuestions = (
  skillKey: string,
  seeds: ExamQuestionSeed[],
): ExamQuestion[] =>
  seeds.map((seed, index) => ({
    id: `${skillKey}-${index + 1}`,
    ...seed,
  }));

export const shuffleExamQuestions = <T,>(items: T[]) => {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }

  return cloned;
};
