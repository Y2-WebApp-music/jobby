import apiService from "./apiService";

export type SubmitExamAnswerItem = {
  id: number;
  selected_index: number;
};

export type SubmitExamPayload = {
  answers: SubmitExamAnswerItem[];
};

export type SubmitExamResponse = {
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  is_pass: boolean;
};

export const SUBMIT_EXAM_ENDPOINT = "/graph/skills";

export const submitExam = (skillId: string, data: SubmitExamPayload) => {
  return apiService.fetchData<SubmitExamResponse>({
    url: `${SUBMIT_EXAM_ENDPOINT}/${encodeURIComponent(skillId)}/exams/submit`,
    method: "post",
    data,
  });
};

const submitExamService = {
  submitExam,
};

export default submitExamService;
