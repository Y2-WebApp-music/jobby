import apiService from "./apiService";

export type ExamQuestionItem = {
  id: number;
  question: string;
  choices: string[];
  eid: string;
};

export type GetExamResponse = ExamQuestionItem[];

export const GET_EXAM_ENDPOINT = "/graph/skills";

export const getExam = (skillId: string) => {
  return apiService.fetchData<GetExamResponse>({
    url: `${GET_EXAM_ENDPOINT}/${encodeURIComponent(skillId)}/exams`,
    method: "get",
  });
};

const getExamService = {
  getExam,
};

export default getExamService;
