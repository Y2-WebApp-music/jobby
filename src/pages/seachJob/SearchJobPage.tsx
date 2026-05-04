import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
const now = Date.now();
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  categoryOptions,
  pageSize,
  skillOptions,
  useSearchJobState,
  workOptionOptions,
  workTypeOptions,
} from "@/types/job";
import type { Job, SearchType } from "@/types/job";
import { ANY_PLACE, placeOfJobOptions } from "@/types/placeofjob";
import PageLayout from "@/components/layout/PageLayout";
import { cn } from "@/lib/utils";
import SkillinfoDialog from "@/features/profile/dialog/SkillinfoDialog";
import { CgClose } from "react-icons/cg";
import { IoIosMore, IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { HiOutlineSelector } from "react-icons/hi";

const normalizeTerm = (value: string) => value.trim().toLowerCase();
const filterFieldClassName =
  "flex h-10 w-full min-w-0 items-center rounded-full border border-[#e5e5e5] bg-white px-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)]";
const filterChipClassName =
  "inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900";
const gradientOutlineChipClassName =
  "inline-flex items-center rounded-full border border-transparent px-3 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(90deg,var(--color-main),var(--color-second))_border-box]";

type SearchSuggestion = {
  term: string;
  type: Exclude<SearchType, "any">;
  normalizedTerm: string;
  score: number;
};

const levenshteinDistance = (a: string, b: string) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
};

export default function SearchJobPage() {
  const {
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
    workTypeOpen,
    setWorkTypeOpen,
    workOptionOpen,
    setWorkOptionOpen,
    filterMode,
    setFilterMode,
    currentPage,
    setCurrentPage,
  } = useSearchJobState();

  const query = searchQuery.trim().toLowerCase();
  const skillInfoRef = useRef<HTMLDivElement | null>(null);
  const jobListScrollRef = useRef<HTMLDivElement | null>(null);
  const categoryAnchorRef = useComboboxAnchor();
  const categoryChipMeasureRefs = useRef<Record<string, HTMLSpanElement | null>>(
    {},
  );
  const categoryOverflowMeasureRefs = useRef<
    Record<number, HTMLSpanElement | null>
  >({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [skillInfoOpen, setSkillInfoOpen] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(0);

  const getSearchSuggestionClassName = (
    type: Exclude<SearchType, "any">,
  ) =>
    type === "skill"
      ? "border-[var(--color-second)] text-[var(--color-second)]"
      : "border-[var(--color-main)] text-[var(--color-main)]";

  const searchableTerms = useMemo(() => {
    const terms = new Map<string, Omit<SearchSuggestion, "score">>();

    if (searchType !== "skill") {
      jobs.forEach((job) => {
        const normalizedTerm = normalizeTerm(job.title);
        terms.set(`job:${normalizedTerm}`, {
          term: job.title,
          type: "job",
          normalizedTerm,
        });
      });
    }

    if (searchType !== "job") {
      jobs.forEach((job) => {
        job.skills.forEach((skill) => {
          const normalizedTerm = normalizeTerm(skill);
          terms.set(`skill:${normalizedTerm}`, {
            term: skill,
            type: "skill",
            normalizedTerm,
          });
        });
      });
      skillOptions.forEach((skill) => {
        const normalizedTerm = normalizeTerm(skill);
        terms.set(`skill:${normalizedTerm}`, {
          term: skill,
          type: "skill",
          normalizedTerm,
        });
      });
    }

    return Array.from(terms.values());
  }, [jobs, searchType]);

  const searchSuggestions = useMemo(() => {
    const normalizedQuery = normalizeTerm(searchQuery);
    if (!normalizedQuery) return [];

    const scored = searchableTerms
      .map((item) => {
        const normalizedTerm = item.normalizedTerm;
        if (!normalizedTerm || normalizedTerm === normalizedQuery) return null;

        let score = -1;

        if (normalizedTerm.startsWith(normalizedQuery)) {
          score = 100 - (normalizedTerm.length - normalizedQuery.length) * 0.2;
        } else if (normalizedTerm.includes(normalizedQuery)) {
          score = 80 - normalizedTerm.indexOf(normalizedQuery) * 0.5;
        } else if (normalizedQuery.length >= 3) {
          const distance = levenshteinDistance(normalizedQuery, normalizedTerm);
          const maxLen = Math.max(
            normalizedQuery.length,
            normalizedTerm.length,
          );
          const similarity = 1 - distance / maxLen;

          if (distance <= 2 || similarity >= 0.65) {
            score = 60 + similarity * 10 - distance;
          }
        }

        if (score < 0) return null;
        return { ...item, score };
      })
      .filter((item): item is SearchSuggestion => item !== null)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 6);
  }, [searchQuery, searchableTerms]);

  const showSearchSuggestions = isSearchFocused && searchSuggestions.length > 0;

  const filteredJobs = jobs
    .filter((job) => {
      const matchesCategory =
        selectedCategories.size === 0 || selectedCategories.has(job.category);
      const matchesPlace =
        placeFilter === ANY_PLACE || job.place === placeFilter;
      const matchesWorkType =
        selectedWorkTypes.size === 0 || selectedWorkTypes.has(job.workType);
      const matchesWorkOption =
        selectedWorkOptions.size === 0 ||
        selectedWorkOptions.has(job.workOption);

      if (!query) {
        return (
          matchesCategory &&
          matchesPlace &&
          matchesWorkType &&
          matchesWorkOption
        );
      }

      const queryInJob = job.title.toLowerCase().includes(query);
      const queryInSkill = job.skills.some((skill) =>
        skill.toLowerCase().includes(query),
      );

      const matchesQuery =
        searchType === "skill"
          ? queryInSkill
          : searchType === "job"
            ? queryInJob
            : queryInJob || queryInSkill;

      return (
        matchesCategory &&
        matchesPlace &&
        matchesWorkType &&
        matchesWorkOption &&
        matchesQuery
      );
    })
    .sort((a, b) => {
      if (filterMode === "date") {
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
      if (filterMode === "unviewed") {
        const aViewed = viewed.has(a.id) ? 1 : 0;
        const bViewed = viewed.has(b.id) ? 1 : 0;
        return aViewed - bViewed;
      }

      const score = (job: Job) => {
        let points = 0;
        const queryInJob = job.title.toLowerCase().includes(query);
        const queryInSkill = job.skills.some((skill) =>
          skill.toLowerCase().includes(query),
        );

        if (query) {
          if (searchType === "skill" && queryInSkill) points += 2;
          if (searchType === "job" && queryInJob) points += 2;
          if (searchType === "any") {
            if (queryInJob) points += 2;
            if (queryInSkill) points += 1;
          }
        }

        const skillMatchCount = job.skills.filter((skill) =>
          selectedSkills.has(skill),
        ).length;
        points += skillMatchCount;
        return points;
      };

      return score(b) - score(a);
    })
    .filter((job) => (filterMode === "unviewed" ? !viewed.has(job.id) : true));

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);
  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) ??
    filteredJobs[0] ??
    null;

  const selectedSkillsList = Array.from(selectedSkills);
  const selectedCategoriesList = Array.from(selectedCategories);
  const selectedWorkTypesList = Array.from(selectedWorkTypes);
  const selectedWorkOptionsList = Array.from(selectedWorkOptions);
  const visibleCategories = selectedCategoriesList.slice(0, visibleCategoryCount);
  const hiddenCategoryCount = Math.max(
    0,
    selectedCategoriesList.length - visibleCategoryCount,
  );

  useLayoutEffect(() => {
    const container = categoryAnchorRef.current;

    if (!container) return;

    const calculateVisibleCategories = () => {
      if (selectedCategoriesList.length === 0) {
        setVisibleCategoryCount(0);
        return;
      }

      const availableWidth = container.clientWidth - 72 - 32;

      if (availableWidth <= 0) {
        setVisibleCategoryCount(0);
        return;
      }

      const chipGap = 6;
      let nextVisibleCount = 0;

      for (let count = selectedCategoriesList.length; count >= 0; count -= 1) {
        const hiddenCount = selectedCategoriesList.length - count;
        let usedWidth = 0;

        for (let index = 0; index < count; index += 1) {
          const item = selectedCategoriesList[index];
          const chipWidth =
            categoryChipMeasureRefs.current[item]?.offsetWidth ?? 0;
          usedWidth += chipWidth;
          if (index < count - 1) usedWidth += chipGap;
        }

        if (hiddenCount > 0) {
          if (count > 0) usedWidth += chipGap;
          usedWidth +=
            categoryOverflowMeasureRefs.current[hiddenCount]?.offsetWidth ?? 0;
        }

        if (usedWidth <= availableWidth) {
          nextVisibleCount = count;
          break;
        }
      }

      setVisibleCategoryCount((prev) =>
        prev === nextVisibleCount ? prev : nextVisibleCount,
      );
    };

    calculateVisibleCategories();

    const observer = new ResizeObserver(calculateVisibleCategories);
    observer.observe(container);

    return () => observer.disconnect();
  }, [categoryAnchorRef, selectedCategoriesList]);

  useEffect(() => {
    jobListScrollRef.current?.scrollTo({ top: 0 });
  }, [currentPage]);

  const headerSkills = selectedSkillsList.slice(0, 4);
  const headerSkillsOverflow = Math.max(0, selectedSkillsList.length - 4);

  const handleSelect = (id: number) => {
    setSelectedJobId(id);
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleDelete = (id: number) => {
    setJobs((prev) => {
      const nextJobs = prev.filter((job) => job.id !== id);
      if (selectedJobId === id) {
        setSelectedJobId(nextJobs[0]?.id ?? null);
      }
      const nextTotalPages = Math.max(1, Math.ceil(nextJobs.length / pageSize));
      setCurrentPage((prevPage) => Math.min(prevPage, nextTotalPages));
      return nextJobs;
    });
    setViewed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleWorkType = (value: string) => {
    setSelectedWorkTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleWorkOption = (value: string) => {
    setSelectedWorkOptions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleScrollToSkillInfo = () => {
    if (!skillInfoRef.current) return;
    skillInfoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenSkillInfo = (skill: string) => {
    setSelectedSkillName(skill);
    setSkillInfoOpen(true);
  };

  const applySuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.term);
    setIsSearchFocused(false);
  };

  const handleToggleSave = (jobId: number) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, saved: !job.saved } : job,
      ),
    );
  };

  const handleApplyJob = (jobId: number) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || job.applied) return job;

        return {
          ...job,
          saved: false,
          applied: true,
          archived: false,
          status: "inreview",
          appliedDate: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).replace(",", ""),
        };
      }),
    );
  };

  const formatPostedAt = (postedAt: string) => {
    const postedTime = new Date(postedAt).getTime();
    const diffDays = Math.max(
      0,
      Math.floor((now - postedTime) / (1000 * 60 * 60 * 24)),
    );

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    const weeks = Math.floor(diffDays / 7);
    if (weeks === 1) return "Posted 1 week ago";
    if (weeks < 5) return `Posted ${weeks} weeks ago`;
    const months = Math.floor(diffDays / 30);
    if (months === 1) return "Posted 1 month ago";
    return `Posted ${months} months ago`;
  };

  return (
    <PageLayout>
      <div className="h-[calc(100vh-56px)] min-h-0 overflow-hidden bg-white">
        <div className="flex h-full w-full flex-col px-6 pt-4 pb-3">
          <div className="mb-3 flex items-center gap-4">
            <h1 className="shrink-0 text-[32px] font-semibold tracking-tight text-slate-950">
              Search Job
            </h1>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="relative flex min-w-[420px] flex-1 items-center gap-3 rounded-[18px] border border-[#d9d9d9] px-4 py-2">
                <Input
                  placeholder="Software Engineer"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveSuggestionIndex(0);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setActiveSuggestionIndex(0);
                  }}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyDown={(e) => {
                    if (!showSearchSuggestions) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) =>
                        prev >= searchSuggestions.length - 1 ? 0 : prev + 1,
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSuggestionIndex((prev) =>
                        prev <= 0 ? searchSuggestions.length - 1 : prev - 1,
                      );
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();
                      const selectedSuggestion =
                        searchSuggestions[activeSuggestionIndex];
                      if (selectedSuggestion) {
                        applySuggestion(selectedSuggestion);
                      }
                    }

                    if (e.key === "Escape") {
                      setIsSearchFocused(false);
                    }
                  }}
                  className="h-5 min-w-0 flex-1 rounded-full border-0 bg-white px-0 text-sm shadow-none focus-visible:ring-0"
                />
                <div className="relative shrink-0">
                  <select
                    value={searchType}
                    onChange={(e) =>
                      setSearchType(e.target.value as "any" | "skill" | "job")
                    }
                    className={`h-8 appearance-none rounded-full border px-3 pr-7 text-xs shadow-sm outline-none ${
                      searchType === "skill"
                        ? "border-[var(--color-second)] text-[var(--color-second)]"
                        : searchType === "job"
                          ? "border-[var(--color-main)] text-[var(--color-main)]"
                          : "border-[#d7d7d7] text-[#A1A1A1]"
                    }`}
                  >
                    <option value="any">Any</option>
                    <option value="skill">Skill</option>
                    <option value="job">Job</option>
                  </select>
                  <HiOutlineSelector
                    className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
                      searchType === "skill"
                        ? "text-[var(--color-second)]"
                        : searchType === "job"
                          ? "text-[var(--color-main)]"
                          : "text-[#A1A1A1]"
                    }`}
                  />
                </div>

                {showSearchSuggestions ? (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white py-1 shadow-lg">
                    {searchSuggestions.map((suggestion, index) => {
                      const isActive = index === activeSuggestionIndex;
                      return (
                        <button
                          key={`${suggestion.type}-${suggestion.term}-${index}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applySuggestion(suggestion)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${
                            isActive
                              ? "bg-[#f6f6f6] text-slate-950"
                              : "text-[#666666] hover:bg-[#f6f6f6]"
                          }`}
                        >
                          <span className="truncate text-[15px] font-medium text-[#2b2b2b]">
                            {suggestion.term}
                          </span>
                          <span
                            className={cn(
                              "inline-flex h-7 shrink-0 items-center rounded-full border bg-white px-5 text-sm font-medium",
                              getSearchSuggestionClassName(suggestion.type),
                            )}
                          >
                            {suggestion.type === "skill" ? "Skill" : "Job"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="h-12.5 relative flex min-w-0 flex-1 items-center gap-3 rounded-[18px] border border-[#d9d9d9] bg-white px-4 py-2 shadow-[0_2px_14px_rgba(0,0,0,0.09)]">
                <button
                  type="button"
                  onClick={handleScrollToSkillInfo}
                  className="whitespace-nowrap text-sm text-slate-900 hover:text-slate-700"
                >
                  Skill Use:
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  {headerSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`${gradientOutlineChipClassName} h-7 whitespace-nowrap`}
                    >
                      {skill}
                    </button>
                  ))}
                  {headerSkillsOverflow > 0 ? (
                    <span className="inline-flex h-7 items-center rounded-full border border-[#e2e2e2] bg-[#f5f5f5] px-3 text-xs text-[#8a8a8a]">
                      +{headerSkillsOverflow}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setSkillOpen((v) => !v)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#b3b3b3] hover:bg-slate-100"
                  aria-label="toggle skill list"
                >
                  <HiOutlineSelector className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#999999] hover:bg-slate-100"
                  aria-label="clear skill use"
                  onClick={() => setSelectedSkills(new Set())}
                >
                  <CgClose />
                </button>

                {skillOpen ? (
                  <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-2xl border border-[#e2e2e2] bg-white p-3 shadow-lg">
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((skill) => {
                        const active = selectedSkills.has(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`h-8 rounded-full border px-3 text-xs ${
                              active
                                ? "border-transparent text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(90deg,var(--color-main),var(--color-second))_border-box]"
                                : "border-[#e2e2e2] bg-white text-[#666666]"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="relative min-w-0">
              <Combobox
                multiple
                items={categoryOptions}
                value={selectedCategoriesList}
                onValueChange={(value) =>
                  setSelectedCategories(new Set((value ?? []) as string[]))
                }
              >
                <ComboboxChips
                  ref={categoryAnchorRef}
                  className="min-h-10 w-full flex-nowrap overflow-hidden rounded-full border border-[#e5e5e5] bg-white px-4 py-1 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.06)] focus-within:border-[#e5e5e5] focus-within:ring-0"
                >
                  {visibleCategories.map((item) => (
                    <ComboboxChip
                      key={item}
                      showRemove={false}
                      className="h-6 shrink-0 rounded-full bg-[#efefef] px-2 text-xs text-slate-900"
                    >
                      {item}
                    </ComboboxChip>
                  ))}
                  {hiddenCategoryCount > 0 ? (
                    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900">
                      +{hiddenCategoryCount}
                    </span>
                  ) : null}
                  <ComboboxChipsInput
                    aria-label="Search categories"
                    placeholder={
                      selectedCategoriesList.length === 0 ? "Any Category" : ""
                    }
                    className="w-0 min-w-[72px] flex-1 bg-transparent text-sm text-slate-900 placeholder:text-[#A1A1A1]"
                  />
                </ComboboxChips>

                <ComboboxTrigger className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-[#A1A1A1]" />

                <ComboboxContent
                  anchor={categoryAnchorRef}
                  className="rounded-2xl border border-[#e2e2e2] bg-white p-1 shadow-lg"
                >
                  <ComboboxEmpty>No categories found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>

                <div className="pointer-events-none absolute -z-10 overflow-hidden opacity-0">
                  {selectedCategoriesList.map((item) => (
                    <span
                      key={`measure-${item}`}
                      ref={(node) => {
                        categoryChipMeasureRefs.current[item] = node;
                      }}
                      className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900"
                    >
                      {item}
                    </span>
                  ))}
                  {Array.from(
                    { length: selectedCategoriesList.length },
                    (_, index) => index + 1,
                  ).map((count) => (
                    <span
                      key={`measure-overflow-${count}`}
                      ref={(node) => {
                        categoryOverflowMeasureRefs.current[count] = node;
                      }}
                      className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900"
                    >
                      +{count}
                    </span>
                  ))}
                </div>
              </Combobox>
            </div>

            <div className="relative min-w-0">
              <div className={`${filterFieldClassName} relative pr-18`}>
                <select
                  value={placeFilter}
                  onChange={(e) => setPlaceFilter(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-full opacity-0 outline-none"
                >
                  <option value={ANY_PLACE}>{ANY_PLACE}</option>
                  {placeOfJobOptions.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>

                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  {placeFilter !== ANY_PLACE ? (
                    <span className="inline-flex h-8 max-w-full items-center truncate rounded-full bg-[rgba(193,193,193,0.3)] px-3 text-[13px] text-[#000000]">
                      {placeFilter}
                    </span>
                  ) : (
                    <span className="truncate text-[#A1A1A1]">{ANY_PLACE}</span>
                  )}
                </div>

                {placeFilter !== ANY_PLACE ? (
                  <button
                    type="button"
                    onClick={() => setPlaceFilter(ANY_PLACE)}
                    className="absolute right-4 top-1/2 z-20 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#A1A1A1] hover:bg-slate-100"
                    aria-label="clear place filter"
                  >
                    <CgClose className="h-4 w-4" />
                  </button>
                ) : null}

                <HiOutlineSelector className="pointer-events-none absolute right-10 top-1/2 z-20 h-4 w-4 -translate-y-1/2 text-[#A1A1A1]" />
              </div>
            </div>

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setWorkTypeOpen((prev) => !prev)}
                className={filterFieldClassName}
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  {selectedWorkTypesList.length === 0 ? (
                    <span className="truncate text-[#A1A1A1]">Any Work Type</span>
                  ) : (
                    <>
                      {selectedWorkTypesList.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className={filterChipClassName}
                        >
                          {item}
                        </span>
                      ))}
                      {selectedWorkTypesList.length > 2 ? (
                        <span className={filterChipClassName}>
                          +{selectedWorkTypesList.length - 2}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                <HiOutlineSelector className="ml-auto h-4 w-4 shrink-0 text-[#A1A1A1]" />
              </button>
              {workTypeOpen ? (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-2xl border border-[#e2e2e2] bg-white p-2 shadow-lg">
                  <div className="flex flex-wrap gap-2">
                    {workTypeOptions.map((option) => {
                      const active = selectedWorkTypes.has(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleWorkType(option)}
                          className={`h-7 rounded-full border px-3 text-xs ${
                            active
                              ? "border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                              : "border-[#e2e2e2] bg-white text-[#666666]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setWorkOptionOpen((prev) => !prev)}
                className={filterFieldClassName}
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  {selectedWorkOptionsList.length === 0 ? (
                    <span className="truncate text-[#A1A1A1]">Any Work Option</span>
                  ) : (
                    <>
                      {selectedWorkOptionsList.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className={filterChipClassName}
                        >
                          {item}
                        </span>
                      ))}
                      {selectedWorkOptionsList.length > 2 ? (
                        <span className={filterChipClassName}>
                          +{selectedWorkOptionsList.length - 2}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                <HiOutlineSelector className="ml-auto h-4 w-4 shrink-0 text-[#A1A1A1]" />
              </button>
              {workOptionOpen ? (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-2xl border border-[#e2e2e2] bg-white p-2 shadow-lg">
                  <div className="flex flex-wrap gap-2">
                    {workOptionOptions.map((option) => {
                      const active = selectedWorkOptions.has(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleWorkOption(option)}
                          className={`h-7 rounded-full border px-3 text-xs ${
                            active
                              ? "border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                              : "border-[#e2e2e2] bg-white text-[#666666]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 grid-cols-[minmax(0,420px)_minmax(0,1fr)] overflow-hidden border-t border-[#e5e5e5]">
            <div className="flex h-full min-h-0 flex-col border-r border-[#e5e5e5] pr-0 pb-3">
              <div className="flex items-center gap-3 py-4">
                <span className="text-sm font-medium text-slate-950">
                  {filteredJobs.length} Results
                </span>
                <div className="inline-flex overflow-hidden rounded-full border border-[#d7d7d7] bg-white text-sm">
                  <button
                    type="button"
                    onClick={() => setFilterMode("relevance")}
                    className={`border-r border-[#d7d7d7] px-4 py-2 ${
                      filterMode === "relevance"
                        ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    Relevance
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("date")}
                    className={`border-r border-[#d7d7d7] px-4 py-2 ${
                      filterMode === "date"
                        ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("unviewed")}
                    className={`px-4 py-2 ${
                      filterMode === "unviewed"
                        ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    No browsed yet
                  </button>
                </div>
              </div>

              <div ref={jobListScrollRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-0">
                  {pagedJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <Card
                        key={job.id}
                        onClick={() => handleSelect(job.id)}
                        className={`group relative w-full cursor-pointer rounded-none border-x-0 border-b border-t-0 border-[#e5e5e5] bg-white transition ${
                          isSelected ? "bg-[#fafafa]" : "hover:bg-[#fcfcfc]"
                        }`}
                      >
                        {isSelected ? (
                          <div className="absolute left-0 top-0 h-full w-1 bg-[var(--color-main)]" />
                        ) : null}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(job.id);
                          }}
                          className="absolute right-3 top-3 text-slate-500 transition hover:text-slate-950"
                          aria-label="delete"
                          type="button"
                        >
                          <CgClose />
                        </button>

                        <CardContent className="p-4 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#e6e6e6]" />
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
                                {viewed.has(job.id) ? "Viewed • " : ""}{job.meta}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

              </div>

              <div className="relative -mt-[1px] flex min-h-[52px] items-center border-t border-[#e5e5e5] bg-white py-2 text-sm">
                <button
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  
                  disabled={currentPage === 1}
                  type="button"
                >
                  <IoIosArrowBack />
                  Previous
                </button>

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    const active = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-lg text-sm ${
                          active
                            ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        type="button"
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <div className="ml-auto flex justify-end">
                  <button
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    type="button"
                  >
                    Next
                    <IoIosArrowForward />
                  </button>
                </div>
              </div>
            </div>
            <div className="h-full overflow-y-auto border-l border-[#e5e5e5] pl-4">
              {filteredJobs.length === 0 || !selectedJob ? (
                <div className="pt-6 text-sm text-slate-500">
                  No jobs to display.
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#e0e0e0]" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-500">
                        {selectedJob.company}
                      </div>
                    </div>
                    <button className="ml-auto text-slate-700 hover:text-slate-950" type="button">
                      <IoIosMore size={20} />
                    </button>
                  </div>

                  <div className="mt-3 text-[22px] font-semibold leading-tight text-slate-950">
                    {selectedJob.title}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{selectedJob.location}</span>
                    <span>•</span>
                    <span>{formatPostedAt(selectedJob.postedAt)}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex h-7 items-center rounded-full bg-[#f1f1f1] px-3 text-xs text-slate-700">
                      {selectedJob.workOption}
                    </span>
                    <span className="inline-flex h-7 items-center rounded-full bg-[#f1f1f1] px-3 text-xs text-slate-700">
                      {selectedJob.workType}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      onClick={() => {
                        handleApplyJob(selectedJob.id);
                      }}
                      disabled={selectedJob.applied}
                      className="h-10 rounded-full bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-5 text-sm font-medium text-white shadow-none hover:opacity-90"
                    >
                      {selectedJob.applied ? "Applied" : "Apply This Job"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleToggleSave(selectedJob.id)}
                      className="h-10 rounded-full border border-[#ff9ad3] px-5 text-sm text-[#ff5db1] hover:bg-[#fff4fa]"
                    >
                      {selectedJob.saved ? "Saved" : "Save"}
                    </Button>
                  </div>

                  <div ref={skillInfoRef} className="mt-5">
                    <h3 className="mb-2 text-base font-medium text-slate-950">
                      Skill Use
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills?.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleOpenSkillInfo(skill)}
                          className={`${gradientOutlineChipClassName} h-8 hover:bg-[#fff8fc]`}
                        >
                          {skill}
                        </button>
                      ))}
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
                      {selectedJob.companyDescription}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {selectedJob.extraDescription}
                    </p>
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
    </PageLayout>
  );
}
