import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  categoryOptions,
  pageSize,
  skillOptions,
  useSearchJobState,
  workOptionOptions,
  workTypeOptions,
} from "@/types/job";
import type { Job } from "@/types/job";
import PageLayout from "@/components/layout/PageLayout";
import { CgClose } from "react-icons/cg";
import { IoIosMore, IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { HiOutlineSelector } from "react-icons/hi";

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
    categoryOpen,
    setCategoryOpen,
    workTypeOpen,
    setWorkTypeOpen,
    workOptionOpen,
    setWorkOptionOpen,
    filterMode,
    setFilterMode,
    setApplyOpen,
    setApplyDialogKey,
    currentPage,
    setCurrentPage,
  } = useSearchJobState();

  const query = searchQuery.trim().toLowerCase();
  const skillInfoRef = useRef<HTMLDivElement | null>(null);
  const jobListScrollRef = useRef<HTMLDivElement | null>(null);

  const filteredJobs = jobs
    .filter((job) => {
      const matchesCategory =
        selectedCategories.size === 0 || selectedCategories.has(job.category);
      const matchesPlace =
        placeFilter === "Any Place" || job.place === placeFilter;
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

      const queryInJob = [job.title, job.company, job.location]
        .join(" ")
        .toLowerCase()
        .includes(query);
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
        const queryInJob = [job.title, job.company, job.location]
          .join(" ")
          .toLowerCase()
          .includes(query);
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

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
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

  return (
    <PageLayout>
      <div className="h-[calc(100vh-56px)] min-h-0 overflow-hidden bg-white">
        <div className="flex h-full w-full flex-col px-6 pt-4 pb-3">
          <div className="mb-3 flex items-center gap-4">
            <h1 className="shrink-0 text-[32px] font-semibold tracking-tight text-slate-950">
              Search Job
            </h1>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="flex min-w-[420px] flex-1 items-center gap-3 rounded-[18px] border border-[#d9d9d9] bg-white px-4 py-2 shadow-[0_2px_14px_rgba(0,0,0,0.09)]">
                <Input
                  placeholder="Software Engineer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-full border-0 px-0 text-sm shadow-none focus-visible:ring-0"
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
              </div>

              <div className="relative flex min-w-0 flex-1 items-center gap-3 rounded-[18px] border border-[#d9d9d9] bg-white px-4 py-2 shadow-[0_2px_14px_rgba(0,0,0,0.09)]">
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
                      className="inline-flex h-7 items-center rounded-full border border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-3 text-xs whitespace-nowrap text-white"
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
                                ? "border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex h-10 w-full items-center rounded-full border border-[#e5e5e5] bg-white px-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  {selectedCategoriesList.length === 0 ? (
                    <span className="truncate text-[#A1A1A1]">Any Category</span>
                  ) : (
                    <>
                      {selectedCategoriesList.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900"
                        >
                          {item}
                        </span>
                      ))}
                      {selectedCategoriesList.length > 2 ? (
                        <span className="inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900">
                          +{selectedCategoriesList.length - 2}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                <HiOutlineSelector className="ml-auto h-4 w-4 shrink-0 text-[#A1A1A1]" />
              </button>
              {categoryOpen ? (
                <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-2xl border border-[#e2e2e2] bg-white p-2 shadow-lg">
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((option) => {
                      const active = selectedCategories.has(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleCategory(option)}
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

            <div className="relative">
              <select
                value={placeFilter}
                onChange={(e) => setPlaceFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-full border border-[#e5e5e5] bg-white px-4 pr-8 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)] outline-none"
              >
                <option>Any Place</option>
                <option>Bangkok</option>
              </select>
              <HiOutlineSelector className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1A1]" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkTypeOpen((prev) => !prev)}
                className="flex h-10 w-full items-center rounded-full border border-[#e5e5e5] bg-white px-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  {selectedWorkTypesList.length === 0 ? (
                    <span className="truncate text-[#A1A1A1]">Any Work Type</span>
                  ) : (
                    <>
                      {selectedWorkTypesList.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900"
                        >
                          {item}
                        </span>
                      ))}
                      {selectedWorkTypesList.length > 2 ? (
                        <span className="inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900">
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

            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkOptionOpen((prev) => !prev)}
                className="flex h-10 w-full items-center rounded-full border border-[#e5e5e5] bg-white px-4 text-sm text-[#A1A1A1] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  {selectedWorkOptionsList.length === 0 ? (
                    <span className="truncate text-[#A1A1A1]">Any Work Option</span>
                  ) : (
                    <>
                      {selectedWorkOptionsList.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900"
                        >
                          {item}
                        </span>
                      ))}
                      {selectedWorkOptionsList.length > 2 ? (
                        <span className="inline-flex h-6 items-center rounded-full bg-[#efefef] px-2 text-xs text-slate-900">
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
                          className="absolute right-3 top-3 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-slate-950"
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
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#e0e0e0]" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-500">
                        {selectedJob.company}
                      </div>
                      <h2 className="text-[22px] font-semibold leading-tight text-slate-950">
                        {selectedJob.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedJob.location} • posted 1 week ago
                      </p>
                    </div>
                    <button className="ml-auto text-slate-700 hover:text-slate-950" type="button">
                      <IoIosMore size={20} />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <span className="inline-flex h-7 items-center rounded-full bg-[#f1f1f1] px-3 text-xs text-slate-700">
                      On-site
                    </span>
                    <span className="inline-flex h-7 items-center rounded-full bg-[#f1f1f1] px-3 text-xs text-slate-700">
                      Internship
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setApplyDialogKey((prev) => prev + 1);
                        setApplyOpen(true);
                      }}
                      className="h-10 rounded-full bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-5 text-sm font-medium text-white shadow-none hover:opacity-90"
                    >
                      Apply This Job
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-full border border-[#ff9ad3] px-5 text-sm text-[#ff5db1] hover:bg-[#fff4fa]"
                    >
                      Save
                    </Button>
                  </div>

                  <div ref={skillInfoRef} className="mt-5">
                    <h3 className="mb-2 text-base font-medium text-slate-950">
                      Skill Use
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex h-8 items-center rounded-full border border-[#ff9ad3] bg-white px-3 text-xs text-[#ff5db1]"
                        >
                          {skill}
                        </span>
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
    </PageLayout>
  );
}
















