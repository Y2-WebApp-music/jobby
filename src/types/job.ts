import { useState } from "react";
import type {
  SearchJobPayload,
  SearchSuggestItem,
  SearchTypeCode,
} from "@/types/search-job";

export type JobStatus = "inreview" | "interview" | "reject" | "accept";

export type Job = {
  id: string;
  nodeId: string;
  title: string;
  company: string;
  companyId: string;
  companyLogo: string;
  location: string;
  provinceName: string;
  districtName: string;
  meta: string;
  skills: { index: number; skill_name: string; skill_id: string }[];
  category: string;
  workType: string;
  workOption: string;
  postedAt: string;
  aboutTitle: string;
  companyDescription: string;
  extraDescription: string;
  matchSkillCount: number;
  viewed: boolean;
  detailLoaded?: boolean;
  saved?: boolean;
  applied?: boolean;
  archived?: boolean;
  status?: JobStatus;
  appliedDate?: string;
};

export const searchTypeOptions = [
  { label: "Any", value: 0 as SearchTypeCode },
  { label: "Skill", value: 1 as SearchTypeCode },
  { label: "Job", value: 2 as SearchTypeCode },
];

export const pageSize = 10;

export const buildInitialSearchPayload = (): SearchJobPayload => ({
  user_id: "",
  search_text: "",
  search_type: null,
  skill: [],
  category: [],
  place: {
    province_id: null,
    district_id: null,
  },
  type: [],
  option: [],
  sort_type: 0,
  page: 0,
  limit: pageSize,
});

export const useSearchJobState = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [searchPayload, setSearchPayload] = useState<SearchJobPayload>(
    buildInitialSearchPayload(),
  );
  const [skillSuggestions, setSkillSuggestions] = useState<SearchSuggestItem[]>(
    [],
  );
  const [skillOpen, setSkillOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDialogKey, setApplyDialogKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  return {
    jobs,
    setJobs,
    selectedJobId,
    setSelectedJobId,
    viewed,
    setViewed,
    searchPayload,
    setSearchPayload,
    skillSuggestions,
    setSkillSuggestions,
    skillOpen,
    setSkillOpen,
    applyOpen,
    setApplyOpen,
    applyDialogKey,
    setApplyDialogKey,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
  };
};
