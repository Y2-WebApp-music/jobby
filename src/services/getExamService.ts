import apiService from "./apiService";

export type ExamQuestionItem = {
  id: number;
  question: string;
  choices: string[];
  eid: string;
};

export type GetExamResponse = ExamQuestionItem[];

export type SubmitExamAnswerItem = {
  id: ExamQuestionItem["id"];
  selected_index: number;
};

export type SubmitExamRequest = {
  user_id: string;
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

export const GET_EXAM_ENDPOINT = "/graph/skills";

export const getExam = (skillId: string) => {
  return apiService.fetchData<GetExamResponse>({
    url: `${GET_EXAM_ENDPOINT}/${skillId}/exams`,
    method: "get",
  });
};

export const submitExam = (skillId: string, body: SubmitExamRequest) => {
  return apiService.fetchData<SubmitExamResponse>({
    url: `${GET_EXAM_ENDPOINT}/${skillId}/exams/submit`,
    method: "post",
    data: body,
  });
};

const getExamService = {
  getExam,
  submitExam,
};

export default getExamService;
