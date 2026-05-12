import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import SkillinfoDialog from "@/features/profile/dialog/SkillinfoDialog";
import { ApplyDialog } from "@/features/searchJob/dialogs/ApplyDialog";
import { cn } from "@/lib/utils";
import searchJobService from "@/services/searchJobService";
import { useAuthStore } from "@/store/auth";
import type {
  FilterOptionItem,
  PlaceSearchItem,
  SearchJobPayload,
  SearchJobResult,
  SearchSuggestItem,
  SearchTypeCode,
  SortTypeCode,
} from "@/types/search-job";
import {
  initialApplyDialogJob,
  initialApplyPayload,
  type ApplyPayload,
} from "@/types/searchJob";
import {
  pageSize,
  searchTypeOptions,
  type Job,
  useSearchJobState,
} from "@/types/job";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { HiOutlineSelector } from "react-icons/hi";
import { IoIosArrowBack, IoIosArrowForward, IoIosMore } from "react-icons/io";
import { toast } from "sonner";

const sortTypeToMode = (sortType: SortTypeCode) => {
  if (sortType === 1) return "date";
  if (sortType === 2) return "unviewed";
  return "relevance";
};

const modeToSortType = (
  mode: "relevance" | "date" | "unviewed",
): SortTypeCode => {
  if (mode === "date") return 1;
  if (mode === "unviewed") return 2;
  return 0;
};

const formatPostedLabel = (value: string) => {
  const postedAt = new Date(value);
  if (Number.isNaN(postedAt.getTime())) return "posted recently";

  const diffMs = Date.now() - postedAt.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return "posted today";
  if (diffDays === 1) return "posted 1 day ago";
  if (diffDays < 7) return `posted ${diffDays} days ago`;

  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "posted 1 week ago";
  return `posted ${weeks} weeks ago`;
};

const mapSearchResultToJob = (item: SearchJobResult): Job => ({
  id: item.id,
  nodeId: item.node_id,
  title: item.name,
  company: item.company.name,
  companyId: item.company.id,
  companyLogo: item.company.logo,
  location: [item.district_name, item.province_name].filter(Boolean).join(", "),
  provinceName: item.province_name,
  districtName: item.district_name,
  meta: `${item.match_skill_count} Skills Match - ${formatPostedLabel(item.created_at)}`,
  skills: [],
  category: "",
  workType: "",
  workOption: "",
  postedAt: item.created_at,
  aboutTitle: "About this job",
  companyDescription: "",
  extraDescription: "",
  matchSkillCount: item.match_skill_count ?? 0,
  viewed: item.is_viewed,
});

export default function SearchJobPage() {
  const user = useAuthStore((state) => state.user);
  const {
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
    setMessageCount,
  } = useSearchJobState();

  const skillInfoRef = useRef<HTMLDivElement | null>(null);
  const skillFilterRef = useRef<HTMLDivElement | null>(null);
  const jobListScrollRef = useRef<HTMLDivElement | null>(null);

  const [skillInfoOpen, setSkillInfoOpen] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [applyData, setApplyData] = useState<ApplyPayload>(initialApplyPayload);
  const [applyDetail, setApplyDetail] = useState(initialApplyDialogJob);
  const [resumesInJobby, setResumesInJobby] = useState<
    { id: string; name: string; create_date: string }[]
  >([]);
  const [categoryOptions, setCategoryOptions] = useState<FilterOptionItem[]>(
    [],
  );
  const [workTypeOptions, setWorkTypeOptions] = useState<FilterOptionItem[]>(
    [],
  );
  const [workOptionOptions, setWorkOptionOptions] = useState<
    FilterOptionItem[]
  >([]);
  const [placeOptions, setPlaceOptions] = useState<PlaceSearchItem[]>([]);
  const [placeInput, setPlaceInput] = useState("");
  const [selectedPlaceLabel, setSelectedPlaceLabel] = useState("Any Place");
  const [selectedSkillItems, setSelectedSkillItems] = useState<
    SearchSuggestItem[]
  >([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);

  const currentPage = searchPayload.page ? searchPayload.page + 1 : 1;
  const filterMode = sortTypeToMode(searchPayload.sort_type);
  const selectedSkillIds = useMemo(
    () => new Set(searchPayload.skill),
    [searchPayload.skill],
  );
  const selectedSkillNames = useMemo(
    () =>
      selectedSkillItems
        .filter((item) => selectedSkillIds.has(item.id))
        .map((item) => item.name),
    [selectedSkillIds, selectedSkillItems],
  );
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null,
    [jobs, selectedJobId],
  );
  const searchSuggestionNames = useMemo(
    () => skillSuggestions.map((item) => item.name),
    [skillSuggestions],
  );
  const skillOptionItems = useMemo(
    () => skillSuggestions.filter((item) => item.type === "skill"),
    [skillSuggestions],
  );
  const headerSkills = selectedSkillNames.slice(0, 4);
  const headerSkillsOverflow = Math.max(0, selectedSkillNames.length - 4);

  const updatePayload = useCallback(
    (partial: Partial<SearchJobPayload>) => {
      setSearchPayload((prev) => ({
        ...prev,
        ...partial,
        user_id: user?.id ?? prev.user_id,
      }));
    },
    [setSearchPayload, user?.id],
  );

  useEffect(() => {
    setSearchPayload((prev) => ({
      ...prev,
      user_id: user?.id ?? "",
      limit: pageSize,
    }));
  }, [setSearchPayload, user?.id]);

  useEffect(() => {
    setMessageCount(100);
  }, [setMessageCount]);

  useEffect(() => {
    let cancelled = false;

    const loadFilterOptions = async () => {
      try {
        const response = await searchJobService.getSearchFilterOptions();
        if (cancelled) return;
        setCategoryOptions(response.data.category);
        setWorkTypeOptions(response.data.work_type);
        setWorkOptionOptions(response.data.work_option);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load search filters");
        }
      }
    };

    void loadFilterOptions();

    return () => {
      cancelled = true;
    };
  }, [updatePayload]);

  useEffect(() => {
    const searchText = searchPayload.search_text.trim();
    if (searchText.length < 2) {
      setSkillSuggestions([]);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchJobService.getSearchNameOptions({
          search_text: searchText,
        });
        if (cancelled) return;
        setSkillSuggestions(response.data.search_result);
        setSelectedSkillItems((prev) => {
          const merged = new Map(prev.map((item) => [item.id, item]));
          response.data.search_result
            .filter((item) => item.type === "skill")
            .forEach((item) => merged.set(item.id, item));
          return Array.from(merged.values());
        });
      } catch {
        if (!cancelled) {
          setSkillSuggestions([]);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchPayload.search_text, setSkillSuggestions]);

  useEffect(() => {
    const searchText = placeInput.trim();
    if (searchText.length < 2) {
      setPlaceOptions([]);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchJobService.getSearchAddressOptions({
          search_text: searchText,
          limit: 100,
        });
        if (!cancelled) {
          setPlaceOptions(response.data.search_result);
        }
      } catch {
        if (!cancelled) {
          setPlaceOptions([]);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [placeInput]);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await searchJobService.searchJobs({
          ...searchPayload,
          user_id: user?.id ?? "",
          limit: pageSize,
        });
        if (cancelled) return;

        const nextJobs = response.data.job_result.map(mapSearchResultToJob);
        setJobs(nextJobs);
        setViewed(
          new Set(
            response.data.job_result
              .filter((item) => item.is_viewed)
              .map((item) => item.id),
          ),
        );
        setTotalPages(Math.max(1, response.data.total_page ?? 0));
        setSelectedJobId((prev) => {
          if (prev && nextJobs.some((job) => job.id === prev)) return prev;
          return nextJobs[0]?.id ?? null;
        });
      } catch {
        if (!cancelled) {
          setJobs([]);
          setTotalPages(1);
          setSelectedJobId(null);
          toast.error("Failed to load jobs");
        }
      } finally {
        if (!cancelled) {
          setLoadingJobs(false);
        }
      }
    };

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, [searchPayload, setJobs, setSelectedJobId, setViewed, user?.id]);

  useEffect(() => {
    if (!selectedJobId) return;
    if (!user?.id) return;

    fetcJobDetail(selectedJobId);
  
  }, [selectedJobId, setJobs]);

  useEffect(() => {
    jobListScrollRef.current?.scrollTo({ top: 0 });
  }, [currentPage]);

  useEffect(() => {
    if (!skillOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (skillFilterRef.current?.contains(target)) return;
      setSkillOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [setSkillOpen, skillOpen]);

  useEffect(() => {
    const handler = () => updatePayload({ search_text: "", page: 0 });
    window.addEventListener("combobox-clear", handler);
    return () => window.removeEventListener("combobox-clear", handler);
  }, [updatePayload]);

  const toggleSkill = (skill: SearchSuggestItem) => {
    setSelectedSkillItems((prev) => {
      if (prev.some((item) => item.id === skill.id)) return prev;
      return [...prev, skill];
    });
    setSearchPayload((prev) => {
      const exists = prev.skill.includes(skill.id);
      const nextSkills = exists
        ? prev.skill.filter((item) => item !== skill.id)
        : [...prev.skill, skill.id];
      return { ...prev, user_id: user?.id ?? "", skill: nextSkills, page: 0 };
    });
  };

  const fetcJobDetail = async (id: string) => {
    setSelectedJobId(id);
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    if (!user?.id) return;

    try {
      await searchJobService.getSearchJobDetail(id, user.id);
    } catch (e){
      console.log('e ',e)
    }
  };

  const handleDelete = (id: string) => {
    setJobs((prev) => {
      const nextJobs = prev.filter((job) => job.id !== id);
      if (selectedJobId === id) {
        setSelectedJobId(nextJobs[0]?.id ?? null);
      }
      return nextJobs;
    });
  };

  const handleScrollToSkillInfo = () => {
    if (!skillInfoRef.current) return;
    skillInfoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenSkillInfo = (skillName: string) => {
    setSelectedSkillName(skillName);
    setSkillInfoOpen(true);
  };

  const handlePlaceSelect = (label: string) => {
    if (label === "Any Place") {
      setSelectedPlaceLabel("Any Place");
      setPlaceInput("");
      updatePayload({
        place: { province_id: 0, district_id: 0 },
        page: 0,
      });
      return;
    }

    const selected = placeOptions.find(
      (option) => `${option.province_name}, ${option.district_name}` === label,
    );
    if (!selected) return;

    setSelectedPlaceLabel(label);
    setPlaceInput("");
    updatePayload({
      place: {
        province_id: selected.province_code,
        district_id: selected.district_code,
      },
      page: 0,
    });
  };

  const handleToggleSave = async () => {
    if (!user?.id || !selectedJob) {
      toast.error("Please sign in before saving jobs");
      return;
    }

    const isSaved = savedJobIds.has(selectedJob.id);
    try {
      if (isSaved) {
        await searchJobService.unsaveJob(user.id, selectedJob.id);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(selectedJob.id);
          return next;
        });
      } else {
        await searchJobService.saveJob(user.id, selectedJob.id);
        setSavedJobIds((prev) => new Set(prev).add(selectedJob.id));
      }
    } catch {
      toast.error("Failed to update saved job");
    }
  };

  const handleOpenApply = async () => {
    if (!user?.id || !selectedJob) {
      toast.error("Please sign in before applying");
      return;
    }

    setLoadingApply(true);
    try {
      const [needResponse, resumeResponse] = await Promise.all([
        searchJobService.getApplyNeed(user.id, selectedJob.id),
        searchJobService.getUserResumesForSearchJob(user.id),
      ]);

      setApplyDetail(
        searchJobService.mapApplyNeedToDialogJob(needResponse.data, {
          jobId: selectedJob.id,
          companyName: selectedJob.company,
          jobTitle: selectedJob.title,
        }),
      );
      setApplyData(
        searchJobService.createApplyPayloadFromNeed(needResponse.data),
      );
      setResumesInJobby(
        resumeResponse.data.map(
          searchJobService.mapSearchJobResumeToResumeListItem,
        ),
      );
      setApplyDialogKey((prev) => prev + 1);
      setApplyOpen(true);
    } catch {
      toast.error("Failed to load apply information");
    } finally {
      setLoadingApply(false);
    }
  };

  const handleSubmitApply = async () => {
    if (!user?.id || !selectedJob) {
      throw new Error("User is not signed in");
    }

    await searchJobService.applyJob(user.id, selectedJob.id, applyData);
  };

  return (
    <PageLayout>
      <div className="h-[calc(100vh-56px)] min-h-0 overflow-hidden bg-white">
        <div className="flex h-full w-full flex-col px-6 pb-3 pt-4">
          <div className="mb-3 flex items-center gap-4">
            <h1 className="shrink-0 text-[32px] font-medium tracking-tight text-slate-950">
              Search Job
            </h1>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="flex min-w-[420px] flex-1 items-center gap-1 rounded-xl border border-[#d9d9d9] bg-white px-2 py-2 shadow-[0_2px_14px_rgba(0,0,0,0.09)]">
                <Combobox items={searchSuggestionNames}>
                  <ComboboxInput
                    placeholder="Software Engineer"
                    value={searchPayload.search_text}
                    onChange={(e) =>
                      updatePayload({ search_text: e.target.value, page: 0 })
                    }
                    className="h-10 min-w-0 flex-1 border-0 bg-transparent px-1 text-xl outline-none focus-visible:ring-0 **:data-[slot=input-group-button]:bg-none! **:data-[slot=input-group-button]:bg-transparent! **:data-[slot=input-group-button]:hover:bg-transparent! **:data-[slot=input-group-control]:border-0 **:data-[slot=input-group-control]:bg-transparent **:data-[slot=input-group-control]:shadow-none"
                    showTrigger={false}
                    showClear
                  />
                  <ComboboxContent className="mt-2 rounded-xl p-1">
                    <ComboboxEmpty>No suggestions.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: string) => {
                        const option = skillSuggestions.find(
                          (s) => s.name === item,
                        );
                        const label =
                          option?.type === "job"
                            ? "Job"
                            : option?.type === "skill"
                              ? "Skill"
                              : "";
                        return (
                          <ComboboxItem
                            key={`${option?.id ?? item}-${item}`}
                            value={item}
                            onClick={() =>
                              updatePayload({ search_text: item, page: 0 })
                            }
                          >
                            <span>{item}</span>
                            <span
                              className={cn(
                                "ml-auto mr-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                                option?.type === "job"
                                  ? "border-main text-main"
                                  : "border-second text-second",
                              )}
                              role="status"
                            >
                              {label}
                            </span>
                          </ComboboxItem>
                        );
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <div className="relative shrink-0">
                  <select
                    value={searchPayload.search_type ?? ""}
                    onChange={(e) =>
                      updatePayload({
                        search_type: Number(e.target.value) as SearchTypeCode,
                        page: 0,
                      })
                    }
                    className={cn(
                      "h-8 appearance-none rounded-xl border bg-white px-3 pr-7 text-xs outline-none",
                      searchPayload.search_type === 1
                        ? "border-second text-second"
                        : searchPayload.search_type === 2
                          ? "border-main text-main"
                          : "border-[#d7d7d7] text-[#A1A1A1]",
                    )}
                  >
                    {searchTypeOptions.map((option) => (
                      <option key={option.value} value={option.value ?? ""}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <HiOutlineSelector
                    className={cn(
                      "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                      searchPayload.search_type === 1
                        ? "text-second"
                        : searchPayload.search_type === 2
                          ? "text-main"
                          : "text-[#A1A1A1]",
                    )}
                  />
                </div>
              </div>

                <div
                  ref={skillFilterRef}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("button")) return;
                    setSkillOpen(true);
                  }}
                  className="relative flex min-w-0 flex-1 items-center gap-3 rounded-[18px] border border-[#d9d9d9] bg-white px-4 py-2 shadow-[0_2px_14px_rgba(0,0,0,0.09)]"
                >
                <button
                  type="button"
                  onClick={handleScrollToSkillInfo}
                  className="whitespace-nowrap text-sm text-slate-900 hover:text-slate-700"
                >
                  Skill Use:
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  {headerSkills.map((skillName) => {
                    const skillItem = selectedSkillItems.find(
                      (item) => item.name === skillName,
                    );
                    return (
                      <button
                        key={skillName}
                        type="button"
                        onClick={() => skillItem && toggleSkill(skillItem)}
                        className="inline-flex h-7 items-center whitespace-nowrap rounded-full border border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-3 text-xs text-white"
                      >
                        {skillName}
                      </button>
                    );
                  })}
                  {headerSkillsOverflow > 0 ? (
                    <span className="inline-flex h-7 items-center rounded-full border border-[#e2e2e2] bg-[#f5f5f5] px-3 text-xs text-[#8a8a8a]">
                      +{headerSkillsOverflow}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setSkillOpen((value) => !value)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#b3b3b3] hover:bg-slate-100"
                  aria-label="toggle skill list"
                >
                  <HiOutlineSelector className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#999999] hover:bg-slate-100"
                  aria-label="clear skill use"
                  onClick={() => updatePayload({ skill: [], page: 0 })}
                >
                  <CgClose />
                </button>

                {skillOpen ? (
                  <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-2xl border border-[#e2e2e2] bg-white p-3 shadow-lg">
                    <div className="flex flex-wrap gap-2">
                      {skillOptionItems.length > 0 ? (
                        skillOptionItems.map((skill) => {
                          const active = selectedSkillIds.has(skill.id);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={cn(
                                "h-8 rounded-full border px-3 text-xs",
                                active
                                  ? "border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                                  : "border-[#e2e2e2] bg-white text-[#666666]",
                              )}
                            >
                              {skill.name}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-sm text-slate-500">
                          Type in the search box to load skill suggestions.
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <MultiSelect
                options={categoryOptions.map(
                  (option): MultiSelectOption => ({
                    label: option.text_eng,
                    value: String(option.id),
                  }),
                )}
                value={searchPayload.category?.map((id) => String(id)) ?? []}
                onValueChange={(vals) =>
                  updatePayload({
                    category: vals.map((value) => Number(value)),
                    page: 0,
                  })
                }
                placeholder="Any Category"
                className="h-10 w-full border border-[#e5e5e5] bg-white px-4 pr-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)] outline-none **:data-[slot=input-group-button]:bg-none! **:data-[slot=input-group-button]:bg-transparent! **:data-[slot=input-group-button]:hover:bg-transparent! **:data-[slot=input-group-control]:border-0 **:data-[slot=input-group-control]:bg-transparent **:data-[slot=input-group-control]:shadow-none"
                badgeClassName="bg-[#C1C1C1]/20 text-neutral-800"
                maxWidth="max-w-full"
                maxDisplay={2}
              />
            </div>

            <div className="relative">
              <Combobox
                items={[
                  "Any Place",
                  ...placeOptions.map(
                    (option) =>
                      `${option.province_name}, ${option.district_name}`,
                  ),
                ]}
              >
                <ComboboxInput
                  placeholder={selectedPlaceLabel}
                  value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-white px-4 pr-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)] outline-none **:data-[slot=input-group-button]:bg-none! **:data-[slot=input-group-button]:bg-transparent! **:data-[slot=input-group-button]:hover:bg-transparent! **:data-[slot=input-group-control]:border-0 **:data-[slot=input-group-control]:bg-transparent **:data-[slot=input-group-control]:shadow-none"
                />
                <ComboboxContent>
                  <ComboboxEmpty>No place found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: string) => (
                      <ComboboxItem
                        key={item}
                        value={item}
                        onClick={() => handlePlaceSelect(item)}
                      >
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="relative">
              <MultiSelect
                options={workTypeOptions.map(
                  (option): MultiSelectOption => ({
                    label: option.text_eng,
                    value: String(option.id),
                  }),
                )}
                value={searchPayload.type?.map((id) => String(id)) ?? []}
                onValueChange={(vals) =>
                  updatePayload({
                    type: vals.map((value) => Number(value)),
                    page: 0,
                  })
                }
                placeholder="Any Work Type"
                className="h-10 w-full border border-[#e5e5e5] bg-white px-4 pr-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)] outline-none **:data-[slot=input-group-button]:bg-none! **:data-[slot=input-group-button]:bg-transparent! **:data-[slot=input-group-button]:hover:bg-transparent! **:data-[slot=input-group-control]:border-0 **:data-[slot=input-group-control]:bg-transparent **:data-[slot=input-group-control]:shadow-none"
                badgeClassName="bg-[#C1C1C1]/20 text-neutral-800"
                maxWidth="max-w-full"
                maxDisplay={2}
              />
            </div>

            <div className="relative">
              <MultiSelect
                options={workOptionOptions.map(
                  (option): MultiSelectOption => ({
                    label: option.text_eng,
                    value: String(option.id),
                  }),
                )}
                value={searchPayload.option?.map((id) => String(id)) ?? []}
                onValueChange={(vals) =>
                  updatePayload({
                    option: vals.map((value) => Number(value)),
                    page: 0,
                  })
                }
                placeholder="Any Work Option"
                className="h-10 w-full border border-[#e5e5e5] bg-white px-4 pr-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)] outline-none **:data-[slot=input-group-button]:bg-none! **:data-[slot=input-group-button]:bg-transparent! **:data-[slot=input-group-button]:hover:bg-transparent! **:data-[slot=input-group-control]:border-0 **:data-[slot=input-group-control]:bg-transparent **:data-[slot=input-group-control]:shadow-none"
                badgeClassName="bg-[#C1C1C1]/20 text-neutral-800"
                maxWidth="max-w-full"
                maxDisplay={2}
              />
            </div>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 grid-cols-[minmax(0,420px)_minmax(0,1fr)] overflow-hidden border-t border-[#e5e5e5]">
            <div className="flex h-full min-h-0 flex-col border-r border-[#e5e5e5] pb-3 pr-0">
              <div className="flex items-center gap-3 py-4">
                <span className="text-sm font-medium text-slate-950">
                  {loadingJobs ? "Loading..." : `${jobs.length} Results`}
                </span>
                <div className="inline-flex overflow-hidden rounded-full border border-[#d7d7d7] bg-white text-sm">
                  {(["relevance", "date", "unviewed"] as const).map(
                    (mode, index) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          updatePayload({
                            sort_type: modeToSortType(mode),
                            page: 0,
                          })
                        }
                        className={cn(
                          index < 2 && "border-r border-[#d7d7d7]",
                          "px-4 py-2",
                          filterMode === mode
                            ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                            : "bg-white text-slate-600",
                        )}
                      >
                        {mode === "relevance"
                          ? "Relevance"
                          : mode === "date"
                            ? "Date"
                            : "No browsed yet"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div
                ref={jobListScrollRef}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                <div className="space-y-0">
                  {jobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <Card
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={cn(
                          "group relative w-full cursor-pointer rounded-none border-x-0 border-b border-t-0 border-[#e5e5e5] bg-white transition",
                          isSelected ? "bg-[#fafafa]" : "hover:bg-[#fcfcfc]",
                        )}
                      >
                        {isSelected ? (
                          <div className="absolute left-0 top-0 h-full w-1 bg-main" />
                        ) : null}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(job.id);
                          }}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-950"
                          aria-label="delete"
                          type="button"
                        >
                          <CgClose />
                        </button>

                        <CardContent className="p-4 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-[#e6e6e6]">
                              {job.companyLogo ? (
                                <img
                                  src={job.companyLogo}
                                  alt={job.company}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="max-w-[320px] text-[15px] font-medium leading-snug text-slate-950">
                                {job.title}
                              </div>
                              <div className="mt-1 text-sm text-slate-600">
                                {job.company}
                              </div>
                              <div className="text-sm text-slate-500">
                                {job.location}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">
                                {viewed.has(job.id) ? "Viewed - " : ""}
                                {job.meta}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="relative -mt-px flex min-h-[52px] items-center justify-center border-t border-[#e5e5e5] bg-white py-2 text-sm">
                {(() => {
                  const generatePageNumbers = () => {
                    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
                    
                    if (totalPages <= 3) {
                      // Show all pages if 3 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      // Determine which pages to show around current page
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      
                      // Add ellipsis if there's a gap after page 1
                      if (start > 2) {
                        pages.push("ellipsis-start");
                      }
                      
                      // Add pages around current page
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      
                      // Add ellipsis if there's a gap before last page
                      if (end < totalPages - 1) {
                        pages.push("ellipsis-end");
                      }
                      
                      // Always show last page
                      pages.push(totalPages);
                    }
                    
                    return pages;
                  };
                  
                  return (
                    <Pagination className="flex justify-center">
                      <PaginationContent>
                        <PaginationItem>
                          <button
                            onClick={() =>
                              updatePayload({ page: Math.max(0, currentPage - 2) })
                            }
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            type="button"
                          >
                            <IoIosArrowBack />
                            Previous
                          </button>
                        </PaginationItem>
                        
                        {generatePageNumbers().map((page, idx) => {
                          if (page === "ellipsis-start" || page === "ellipsis-end") {
                            return (
                              <PaginationItem key={`${page}-${idx}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          
                          const isActive = page === currentPage;
                          return (
                            <PaginationItem key={page}>
                              <button
                                onClick={() => updatePayload({ page: page - 1 })}
                                className={cn(
                                  "h-8 w-8 rounded-lg text-sm flex items-center justify-center",
                                  isActive
                                    ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                                    : "text-slate-600 hover:bg-slate-100",
                                )}
                                type="button"
                              >
                                {page}
                              </button>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <button
                            onClick={() =>
                              updatePayload({
                                page: Math.min(totalPages - 1, currentPage),
                              })
                            }
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            type="button"
                          >
                            Next
                            <IoIosArrowForward />
                          </button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  );
                })()}
              </div>
            </div>

            <div className="h-full overflow-y-auto border-l border-[#e5e5e5] pl-4">
              {jobs.length === 0 || !selectedJob ? (
                <div className="pt-6 text-sm text-slate-500">
                  No jobs to display.
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-[#e0e0e0]">
                      {selectedJob.companyLogo ? (
                        <img
                          src={selectedJob.companyLogo}
                          alt={selectedJob.company}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-500">
                        {selectedJob.company}
                      </div>
                      <h2 className="text-[22px] font-semibold leading-tight text-slate-950">
                        {selectedJob.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedJob.location} -{" "}
                        {formatPostedLabel(selectedJob.postedAt)}
                      </p>
                    </div>
                    <button
                      className="ml-auto text-slate-700 hover:text-slate-950"
                      type="button"
                    >
                      <IoIosMore size={20} />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {selectedJob.workOption ? (
                      <span className="inline-flex h-7 items-center rounded-full bg-[#f1f1f1] px-3 text-xs text-slate-700">
                        {selectedJob.workOption}
                      </span>
                    ) : null}
                    {selectedJob.workType ? (
                      <span className="inline-flex h-7 items-center rounded-full bg-[#f1f1f1] px-3 text-xs text-slate-700">
                        {selectedJob.workType}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      onClick={() => void handleOpenApply()}
                      disabled={loadingApply}
                      className="h-10 rounded-full bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-5 text-sm font-medium text-white shadow-none hover:opacity-90"
                    >
                      {loadingApply ? "Loading..." : "Apply This Job"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleToggleSave()}
                      className="h-10 rounded-full border border-[#ff9ad3] px-5 text-sm text-[#ff5db1] hover:bg-[#fff4fa]"
                    >
                      {savedJobIds.has(selectedJob.id) ? "Saved" : "Save"}
                    </Button>
                  </div>

                  <div ref={skillInfoRef} className="mt-5">
                    <h3 className="mb-2 text-base font-medium text-slate-950">
                      Skill Use
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.length > 0 ? (
                        selectedJob.skills.map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant="outline_gradient"
                            size="sm"
                            onClick={() => handleOpenSkillInfo(skill)}
                          >
                            {skill}
                          </Button>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          No skill details provided for this job.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="my-6 h-px bg-[#e5e5e5]" />

                  <div>
                    <h3 className="mb-2 text-base font-medium text-slate-950">
                      {selectedJob.aboutTitle}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      Company Description
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {selectedJob.companyDescription ||
                        "No description available."}
                    </p>
                    {selectedJob.extraDescription ? (
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        {selectedJob.extraDescription}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SkillinfoDialog
        open={skillInfoOpen}
        onClose={() => setSkillInfoOpen(false)}
        skillName={selectedSkillName}
      />
      <ApplyDialog
        key={applyDialogKey}
        open={applyOpen}
        onOpenChange={(open) => setApplyOpen(open)}
        applyDetail={applyDetail}
        applyData={applyData}
        setApplyData={setApplyData}
        resumesInJobby={resumesInJobby}
        onApply={handleSubmitApply}
      />
    </PageLayout>
  );
}
