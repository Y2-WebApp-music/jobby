import { useState } from "react";

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
    meta: "4 Skills Match • 3 weeks ago",
    skills: ["React", "TypeScript", "Tailwind", "Figma"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
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
    meta: "3 Skills Match • 2 weeks ago",
    skills: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
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
    meta: "2 Skills Match • 4 weeks ago",
    skills: ["Figma", "User Research", "Prototyping"],
    category: "Design",
    place: "Bangkok",
    workType: "Full-time",
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
    meta: "5 Skills Match • 1 week ago",
    skills: ["SQL", "Python", "Tableau", "Excel", "Statistics"],
    category: "Data",
    place: "Bangkok",
    workType: "Full-time",
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
    meta: "3 Skills Match • 5 days ago",
    skills: ["Playwright", "Jest", "CI/CD"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
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
    meta: "4 Skills Match • 6 days ago",
    skills: ["AWS", "Kubernetes", "Terraform", "GitHub Actions"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
    workOption: "Remote",
    postedAt: "2026-02-04",
    aboutTitle: "About this job",
    companyDescription:
      "Build CI/CD pipelines, manage cloud infrastructure, and improve deployment reliability and observability.",
    extraDescription:
      "You will optimize costs, harden security, and automate infrastructure with infrastructure-as-code.",
  },
  {
    id: 6,
    title: "Mobile Developer (iOS)",
    company: "Riverline Digital",
    location: "Rama 9, Bangkok",
    meta: "3 Skills Match • 2 days ago",
    skills: ["Swift", "UIKit", "REST APIs"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
    workOption: "On-site",
    postedAt: "2026-02-08",
    aboutTitle: "About this job",
    companyDescription:
      "Build iOS features with a focus on performance, accessibility, and polished user experience.",
    extraDescription:
      "You will collaborate with product, design, and QA to deliver reliable mobile releases.",
  },
  {
    id: 7,
    title: "Mobile Developer (Android)",
    company: "Skyline Works",
    location: "Ratchada, Bangkok",
    meta: "2 Skills Match • 1 week ago",
    skills: ["Kotlin", "Jetpack", "MVVM"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
    workOption: "Hybrid",
    postedAt: "2026-02-01",
    aboutTitle: "About this job",
    companyDescription:
      "Develop Android applications, optimize performance, and maintain a clean architecture.",
    extraDescription:
      "You will write reusable components and work closely with backend and QA teams.",
  },
  {
    id: 8,
    title: "UI/UX Researcher",
    company: "Nimble Labs",
    location: "Ari, Bangkok",
    meta: "2 Skills Match • 3 days ago",
    skills: ["Interviews", "Surveys", "Usability Testing"],
    category: "Design",
    place: "Bangkok",
    workType: "Contract",
    workOption: "On-site",
    postedAt: "2026-02-07",
    aboutTitle: "About this job",
    companyDescription:
      "Plan and run user research, analyze findings, and drive actionable product insights.",
    extraDescription:
      "You will build research plans and share results with cross-functional partners.",
  },
  {
    id: 9,
    title: "Full-stack Engineer",
    company: "Orbitsoft",
    location: "Onnut, Bangkok",
    meta: "4 Skills Match • 4 days ago",
    skills: ["React", "Node.js", "PostgreSQL", "Docker"],
    category: "Technology",
    place: "Bangkok",
    workType: "Full-time",
    workOption: "Remote",
    postedAt: "2026-02-06",
    aboutTitle: "About this job",
    companyDescription:
      "Work across frontend and backend, delivering features end-to-end for core products.",
    extraDescription:
      "You will collaborate on architecture decisions and improve developer workflows.",
  },
  {
    id: 10,
    title: "Security Engineer",
    company: "Fortress Cloud",
    location: "Silom, Bangkok",
    meta: "3 Skills Match • 5 days ago",
    skills: ["Threat Modeling", "SIEM", "Pen Testing"],
    category: "Security",
    place: "Bangkok",
    workType: "Full-time",
    workOption: "On-site",
    postedAt: "2026-02-02",
    aboutTitle: "About this job",
    companyDescription:
      "Strengthen security posture, monitor risks, and guide secure development practices.",
    extraDescription:
      "You will run security reviews and implement continuous monitoring controls.",
  },
  {
    id: 11,
    title: "Machine Learning Engineer",
    company: "Aether AI",
    location: "Asoke, Bangkok",
    meta: "5 Skills Match • 1 day ago",
    skills: ["Python", "PyTorch", "MLOps", "Data Pipelines"],
    category: "Data",
    place: "Bangkok",
    workType: "Full-time",
    workOption: "Hybrid",
    postedAt: "2026-02-09",
    aboutTitle: "About this job",
    companyDescription:
      "Develop ML models, improve data quality, and deploy solutions into production.",
    extraDescription:
      "You will iterate on experiments and collaborate with product to measure impact.",
  },
];

export const skillOptions = [
  "Front-End",
  "Back-End",
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "Figma",
  "SQL",
  "Docker",
  "AWS",
];
export const categoryOptions = ["Technology", "Design", "Data", "Security"];
export const workTypeOptions = ["Full-time", "Contract"];
export const workOptionOptions = ["On-site", "Hybrid", "Remote"];
export const pageSize = 6;

export type SearchType = "any" | "skill" | "job";
export type FilterMode = "relevance" | "date" | "unviewed";

export const useSearchJobState = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    initialJobs[0]?.id ?? null,
  );
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(["Front-End", "Back-End", "React"]),
  );
  const [searchType, setSearchType] = useState<SearchType>("any");
  const [skillOpen, setSkillOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [placeFilter, setPlaceFilter] = useState("Any Place");
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<Set<string>>(
    new Set(),
  );
  const [selectedWorkOptions, setSelectedWorkOptions] = useState<Set<string>>(
    new Set(),
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const [workOptionOpen, setWorkOptionOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("relevance");
  const [messageCount, setMessageCount] = useState<number>(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDialogKey, setApplyDialogKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  return {
    jobs,
    setJobs,
    selectedJobId,
    setSelectedJobId,
    viewed,
    setViewed,
    selectedSkills,
    setSelectedSkills,
    searchType,
    setSearchType,
    skillOpen,
    setSkillOpen,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    placeFilter,
    setPlaceFilter,
    selectedWorkTypes,
    setSelectedWorkTypes,
    selectedWorkOptions,
    setSelectedWorkOptions,
    categoryOpen,
    setCategoryOpen,
    workTypeOpen,
    setWorkTypeOpen,
    workOptionOpen,
    setWorkOptionOpen,
    filterMode,
    setFilterMode,
    messageCount,
    setMessageCount,
    applyOpen,
    setApplyOpen,
    applyDialogKey,
    setApplyDialogKey,
    currentPage,
    setCurrentPage,
  };
};
