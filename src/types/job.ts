import { useState } from "react";
import type {
  FilterOptionItem,
  PlaceSearchItem,
  SearchJobPayload,
  SearchSuggestItem,
  SearchTypeCode,
} from "@/types/search-job";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  meta: string;
  skills: string[];
  category: string;
  place: string;
  workType: string;
  workOption: string;
  postedAt: string;
  aboutTitle: string;
  companyDescription: string;
  extraDescription: string;
};

export const initialJobs: Job[] = [
  {
    id: 0,
    title: "Frontend Engineer (React)",
    company: "Select Service Partner Ltd.",
    location: "Lat Krabang, Bangkok",
    meta: "4 Skills Match - 3 weeks ago",
    skills: ["React", "TypeScript", "Tailwind", "Figma"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full time",
    workOption: "On-site",
    postedAt: "2026-02-03",
    aboutTitle: "About this job",
    companyDescription:
      "Build modern web interfaces with React and collaborate with product and design teams to ship customer-facing features.",
    extraDescription:
      "You will refine UI performance, improve accessibility, and maintain a reusable component system.",
  },
  {
    id: 1,
    title: "Backend Engineer (Node.js)",
    company: "Blue Orbit Tech",
    location: "Bang Na, Bangkok",
    meta: "3 Skills Match - 2 weeks ago",
    skills: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full time",
    workOption: "Hybrid",
    postedAt: "2026-01-28",
    aboutTitle: "About this job",
    companyDescription:
      "Design scalable APIs and data services, improve system reliability, and optimize performance across backend systems.",
    extraDescription:
      "You will own service health, write integrations, and help shape the data model across teams.",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Aurora Studio",
    location: "Phaya Thai, Bangkok",
    meta: "2 Skills Match - 4 weeks ago",
    skills: ["Figma", "User Research", "Prototyping"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full time",
    workOption: "On-site",
    postedAt: "2026-01-15",
    aboutTitle: "About this job",
    companyDescription:
      "Lead end-to-end product design, validate user needs, and create intuitive experiences across web and mobile.",
    extraDescription:
      "You will run workshops, prototype quickly, and translate feedback into clear design decisions.",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Nimbus Analytics",
    location: "Huai Khwang, Bangkok",
    meta: "5 Skills Match - 1 week ago",
    skills: ["SQL", "Python", "Tableau", "Excel", "Statistics"],
    category: "Finance",
    place: "Bangkok",
    workType: "Full time",
    workOption: "Hybrid",
    postedAt: "2026-02-06",
    aboutTitle: "About this job",
    companyDescription:
      "Analyze datasets, build dashboards, and deliver insights that guide business decisions and strategy.",
    extraDescription:
      "You will define metrics, automate reporting, and partner with stakeholders to validate hypotheses.",
  },
  {
    id: 4,
    title: "QA Engineer (Automation)",
    company: "Siam Mobile Labs",
    location: "Chatuchak, Bangkok",
    meta: "3 Skills Match - 5 days ago",
    skills: ["Playwright", "Jest", "CI/CD"],
    category: "Technology",
    place: "Bangkok",
    workType: "Contract",
    workOption: "On-site",
    postedAt: "2026-02-05",
    aboutTitle: "About this job",
    companyDescription:
      "Create automated test suites, ensure product quality, and collaborate with engineers to prevent regressions.",
    extraDescription:
      "You will expand coverage, maintain test infrastructure, and build reliable release checks.",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Cloud Harbor Co., Ltd.",
    location: "Sathorn, Bangkok",
    meta: "4 Skills Match - 6 days ago",
    skills: ["AWS", "Kubernetes", "Terraform", "GitHub Actions"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full time",
    workOption: "Remote",
    postedAt: "2026-02-04",
    aboutTitle: "About this job",
    companyDescription:
      "Build CI/CD pipelines, manage cloud infrastructure, and improve deployment reliability and observability.",
    extraDescription:
      "You will optimize costs, harden security, and automate infrastructure with infrastructure-as-code.",
  },
];

export const searchTypeOptions = [
  { label: "Any", value: 0 as SearchTypeCode },
  { label: "Skill", value: 1 as SearchTypeCode },
  { label: "Job", value: 2 as SearchTypeCode },
];

export const skillOptions: SearchSuggestItem[] = [
  {
    type: "job",
    id: "4:5d2e0108-be5f-4abc-8128-9f1bd6a6f70a:10879",
    name: "3D Graphics And Display Software Engineering Intern",
  },
  {
    type: "job",
    id: "4:5d2e0108-be5f-4abc-8128-9f1bd6a6f70a:2382",
    name: "Frontend Software Engineer",
  },
  {
    type: "job",
    id: "4:5d2e0108-be5f-4abc-8128-9f1bd6a6f70a:44",
    name: "Backend Software Engineer",
  },
  {
    type: "skill",
    id: "skill:react",
    name: "React",
  },
  {
    type: "skill",
    id: "skill:typescript",
    name: "TypeScript",
  },
  {
    type: "skill",
    id: "skill:nodejs",
    name: "Node.js",
  },
];

export const categoryOptions: FilterOptionItem[] = [
  { id: 1, text_th: "เทคโนโลยี", text_eng: "Technology" },
  { id: 2, text_th: "ธุรกิจ", text_eng: "Business" },
  { id: 3, text_th: "การเงิน", text_eng: "Finance" },
  { id: 4, text_th: "สุขภาพ", text_eng: "Healthcare" },
  { id: 5, text_th: "การศึกษา", text_eng: "Education" },
  { id: 6, text_th: "อุตสาหกรรม", text_eng: "Manufacturing" },
  { id: 7, text_th: "ค้าปลีก", text_eng: "Retail" },
  { id: 8, text_th: "อื่นๆ", text_eng: "Other" },
];

export const workTypeOptions: FilterOptionItem[] = [
  { id: 1, text_th: "เต็มเวลา", text_eng: "Full time" },
  { id: 2, text_th: "พาร์ทไทม์", text_eng: "Part-time" },
  { id: 3, text_th: "ฝึกงาน", text_eng: "Intern" },
  { id: 4, text_th: "สัญญาจ้าง", text_eng: "Contract" },
  { id: 5, text_th: "ฟรีแลนซ์", text_eng: "Freelance" },
  { id: 6, text_th: "ตามโครงการ", text_eng: "Project-based" },
  { id: 7, text_th: "ชั่วคราว", text_eng: "Temporary" },
];

export const workOptionOptions: FilterOptionItem[] = [
  { id: 1, text_th: "ไฮบริด", text_eng: "Hybrid" },
  { id: 2, text_th: "ออนไซต์", text_eng: "On-site" },
  { id: 3, text_th: "รีโมท", text_eng: "Remote" },
];

export const placeOptions: PlaceSearchItem[] = [
  {
    province_name: "BANGKOK",
    district_name: "KHLONG TOEI",
    province_code: 100000,
    district_code: 101001,
  },
  {
    province_name: "CHIANG RAI",
    district_name: "KHUN TAN",
    province_code: 570000,
    district_code: 571400,
  },
  {
    province_name: "CHIANG RAI",
    district_name: "CHIANG KHONG",
    province_code: 570000,
    district_code: 570300,
  },
];

export const pageSize = 10;

export const buildInitialSearchPayload = (): SearchJobPayload => ({
  user_id: "",
  search_text: "",
  search_type: 0,
  skill: [],
  category: [],
  place: {
    province_id: 0,
    district_id: 0,
  },
  type: [],
  option: [],
  sort_type: 0,
  page: 0,
  limit: pageSize,
});

export const useSearchJobState = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    initialJobs[0]?.id ?? null,
  );
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [searchPayload, setSearchPayload] = useState<SearchJobPayload>(
    buildInitialSearchPayload(),
  );
  const [skillOpen, setSkillOpen] = useState(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDialogKey, setApplyDialogKey] = useState(0);

  return {
    jobs,
    setJobs,
    selectedJobId,
    setSelectedJobId,
    viewed,
    setViewed,
    searchPayload,
    setSearchPayload,
    skillOpen,
    setSkillOpen,
    messageCount,
    setMessageCount,
    applyOpen,
    setApplyOpen,
    applyDialogKey,
    setApplyDialogKey,
  };
};
