export type searchJobPayloadProps = {
  search_text: string;
  search_type: number;
  skill: string[];
  category: number[]; // .map(category.id)
  place: { province_id: number; district_id: number };
  type: number[]; // .map(type.id)
  option: number[]; // .map(option.id)
  sort_type: number;
  page: number;
  limit: number;
};

export type searchJobResultProps = {
  id: string;
  name: string;
  company: {
    id: string;
    name: string;
    logo: string;
  };
};

export type searchJobResponseProps = {
  job_result: searchJobResultProps[];
  page: 0;
  total_page: 20;
};

// =================

/** Contact step form data */
export type ApplyContactForm = {
  first_name: string;
  last_name: string;
  logo: File | string;
  email: string;
  phone: string;
  resume_id: string;
  resume_file: File | null;
  cover_letter: File | null;
  has_cover_letter: boolean;
};

export const initialContact: ApplyContactForm = {
  first_name: "",
  last_name: "",
  logo: "",
  resume_id: "",
  email: "",
  phone: "",
  resume_file: null,
  cover_letter: null,
  has_cover_letter: false,
};

// type 1: Radio, 2: Checkbox, 3: Textarea
export type AdditionQuestions = {
  id: number;
  type: number;
  question: string;
  options: {
    id: number;
    label: string;
  }[];
  max_select: number;
};

export type QuestionsAnswer = {
  id: number;
  type: number;
  value: number | number[];
  open_answer?: string;
};

export type AdditionFile = {
  id: number;
  type: number;
  label: string;
  description: string;
};

export type AdditionFilePayload = {
  id: number;
  data: File | null;
};

/** Job application payload for opening the dialog */
// response from api/job/apply/detail
export type ApplyDialogJob = {
  id: string;
  company_name: string;
  job_title: string;
  first_name: string;
  last_name: string;
  logo: string;
  email: string;
  phone: string;
  has_cover_letter: boolean;
  addition_questions?: AdditionQuestions[];
  addition_file?: AdditionFile[];
};

export const initialApplyDialogJob: ApplyDialogJob = {
  id: "",
  company_name: "",
  job_title: "",
  first_name: "",
  last_name: "",
  logo: "",
  email: "",
  phone: "",
  has_cover_letter: false,
  addition_questions: [],
  addition_file: [],
};

export type ApplyPayload = {
  email: string;
  phone: string;
  resume_id: string; // null when user choose from device
  resume_file: File | null; // null when user choose from system
  cover_letter: File | null;
  questions: QuestionsAnswer[];
  addition_file: AdditionFilePayload[];
};

export const initialApplyPayload: ApplyPayload = {
  email: "",
  phone: "",
  resume_id: "",
  resume_file: null,
  cover_letter: null,
  questions: [],
  addition_file: [],
};
