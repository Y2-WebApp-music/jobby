import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { CgClose } from "react-icons/cg";
import { IoIosArrowBack, IoIosArrowForward, IoIosMore } from "react-icons/io";
import { pageSize, useSearchJobState, type Job, type JobStatus } from "@/types/job";

const now = Date.now();

type JobView = "saved" | "applied" | "archived";

const JOB_VIEW_TABS: Array<{ value: JobView; label: string }> = [
  { value: "saved", label: "Save" },
  { value: "applied", label: "Applied" },
  { value: "archived", label: "Archived" },
];

const STATUS_FILTERS: Array<"all" | JobStatus> = [
  "all",
  "inreview",
  "interview",
  "reject",
  "accept",
];

const STATUS_META: Record<
  JobStatus,
  {
    label: string;
    desc: string;
    textClass: string;
    borderClass: string;
    bgClass: string;
  }
> = {
  inreview: {
    label: "In Review",
    desc: "Company reviewing your applied",
    textClass: "text-[var(--color-main)]",
    borderClass: "border-[var(--color-main)]",
    bgClass: "bg-[#fff6ec]",
  },
  interview: {
    label: "Interview",
    desc: "Company will contact you. see in Message",
    textClass: "text-[var(--color-second)]",
    borderClass: "border-[var(--color-second)]",
    bgClass: "bg-[#fff2fb]",
  },
  reject: {
    label: "Reject",
    desc: "Company reject your applied",
    textClass: "text-[#D8111A]",
    borderClass: "border-[#D8111A]",
    bgClass: "bg-[#fff1f2]",
  },
  accept: {
    label: "Accept",
    desc: "Company will contact you. see in Message",
    textClass: "text-[#00A63E]",
    borderClass: "border-[#00A63E]",
    bgClass: "bg-[#edfdf3]",
  },
};

const gradientOutlineChipClassName =
  "inline-flex items-center rounded-full border border-transparent px-3 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(90deg,var(--color-main),var(--color-second))_border-box]";

const searchInputClassName =
  "h-10 max-w-[220px] rounded-full border border-[#e5e5e5] bg-white px-4 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.06)]";

export default function MyJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    jobs,
    setJobs,
    selectedJobId,
    setSelectedJobId,
    viewed,
    setViewed,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
  } = useSearchJobState();
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const jobListRef = useRef<HTMLDivElement | null>(null);

  const rawJobView = searchParams.get("view");
  const jobView: JobView =
    rawJobView === "saved" || rawJobView === "applied" || rawJobView === "archived"
      ? rawJobView
      : "saved";

  const query = searchQuery.trim().toLowerCase();

  useEffect(() => {
    setCurrentPage(1);
  }, [jobView, statusFilter, setCurrentPage]);

  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0 });
  }, [currentPage]);

  const handleJobViewChange = (view: JobView) => {
    setSearchParams({ view }, { replace: true });
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (jobView === "saved" && !job.saved) return false;
        if (jobView === "applied" && !job.applied) return false;
        if (
          jobView === "archived" &&
          (!job.archived || (job.status !== "reject" && job.status !== "accept"))
        ) {
          return false;
        }

        if (jobView === "applied" && statusFilter !== "all" && job.status !== statusFilter) {
          return false;
        }

        if (!query) return true;

        return [job.title, job.company, job.location]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [jobs, jobView, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);
  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) ??
    pagedJobs[0] ??
    null;

  const formatPostedAt = (postedAt: string) => {
    const postedTime = new Date(postedAt).getTime();
    const diffDays = Math.max(0, Math.floor((now - postedTime) / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return "posted today";
    if (diffDays === 1) return "posted 1 day ago";
    if (diffDays < 7) return `posted ${diffDays} days ago`;
    const weeks = Math.floor(diffDays / 7);
    if (weeks === 1) return "posted 1 week ago";
    return `posted ${weeks} weeks ago`;
  };

  const handleSelect = (id: number) => {
    setSelectedJobId(id);
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
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
        if (job.id !== jobId) return job;

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

    setSearchParams({ view: "applied" }, { replace: true });
    setStatusFilter("inreview");
  };

  const handleRemoveFromView = (id: number) => {
    setJobs((prev) => {
      const nextJobs = prev.map((job) => {
        if (job.id !== id) return job;

        if (jobView === "saved") {
          return { ...job, saved: false };
        }

        return {
          ...job,
          applied: false,
          archived: false,
          status: undefined,
          appliedDate: undefined,
        };
      });

      const nextFilteredJobs = nextJobs.filter((job) => {
        if (jobView === "saved" && !job.saved) return false;
        if (jobView === "applied" && !job.applied) return false;
        if (
          jobView === "archived" &&
          (!job.archived || (job.status !== "reject" && job.status !== "accept"))
        ) {
          return false;
        }
        if (jobView === "applied" && statusFilter !== "all" && job.status !== statusFilter) {
          return false;
        }
        if (!query) return true;

        return [job.title, job.company, job.location]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });

      if (selectedJobId === id) {
        setSelectedJobId(nextFilteredJobs[0]?.id ?? null);
      }

      const nextTotalPages = Math.max(1, Math.ceil(nextFilteredJobs.length / pageSize));
      setCurrentPage((prevPage) => Math.min(prevPage, nextTotalPages));

      return nextJobs;
    });
  };

  const renderStatusPanel = (job: Job) => {
    if (!job.status) return null;

    const statusMeta = STATUS_META[job.status];
    const infoLabel = jobView === "archived" ? "Result Updated" : "Applied Date";
    const infoValue = job.appliedDate ?? "-";
    const actionLabel = jobView === "archived" ? "View Result" : "See Applied";

    return (
      <div className="mt-6 flex flex-col gap-3 xl:flex-row">
        <div
          className={`w-full rounded-2xl border px-4 py-4 xl:flex-1 ${statusMeta.borderClass} ${statusMeta.bgClass}`}
        >
          <div className={`text-[22px] font-medium ${statusMeta.textClass}`}>
            {statusMeta.label}
          </div>
          <div className={`mt-1 text-sm ${statusMeta.textClass}`}>{statusMeta.desc}</div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4 xl:flex-1">
          <div>
            <div className="text-sm font-medium text-slate-950">{infoLabel}</div>
            <div className="mt-1 text-sm text-slate-500">{infoValue}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-[#e5e5e5] px-4 text-xs text-slate-600"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="h-[calc(100vh-56px)] px-6 pb-4 pt-4">
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-semibold text-slate-950">My Jobs</h1>

            <Input
              placeholder="Search Job"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={searchInputClassName}
            />

            <div className="flex flex-wrap items-center gap-2">
              {JOB_VIEW_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleJobViewChange(tab.value)}
                  className={`inline-flex h-9 items-center rounded-full border px-4 text-sm transition ${
                    jobView === tab.value
                      ? "border-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                      : "border-[#dcdcdc] bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {jobView === "applied" ? (
            <div className="mb-4 overflow-x-auto">
              <div className="inline-flex overflow-hidden rounded-full border border-[#d7d7d7] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                {STATUS_FILTERS.map((filter, index) => {
                  const active = statusFilter === filter;
                  const label = filter === "all" ? "All" : STATUS_META[filter].label;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`min-w-[60px] px-4 py-[10px] text-[13px] font-medium leading-none transition-colors md:min-w-[98px] ${
                        index !== 0 ? "border-l border-[#d7d7d7]" : ""
                      } ${
                        active
                          ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                          : "bg-white text-[#5f5f5f] hover:bg-[#fafafa]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 grid-cols-[420px_minmax(0,1fr)] overflow-hidden">
            <div className="flex min-h-0 flex-col border-r border-[#e5e5e5]">
              <div ref={jobListRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-0">
                  {pagedJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    const statusMeta = job.status ? STATUS_META[job.status] : null;

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
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromView(job.id);
                          }}
                          className="absolute right-3 top-3 text-slate-500 transition hover:text-slate-950"
                          aria-label="delete"
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
                              <div className="mt-1 text-sm text-slate-600">{job.company}</div>
                              <div className="text-sm text-slate-500">{job.location}</div>
                              <div className="mt-2 text-xs text-slate-500">
                                {viewed.has(job.id) ? "Viewed • " : ""}
                                {job.meta}
                              </div>
                              {jobView === "archived" && statusMeta ? (
                                <div
                                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs ${statusMeta.borderClass} ${statusMeta.textClass}`}
                                >
                                  {statusMeta.label}
                                </div>
                              ) : null}
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
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
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
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-lg text-sm ${
                          active
                            ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <div className="ml-auto flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <IoIosArrowForward />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-full overflow-y-auto border-l border-[#e5e5e5] pl-4">
              {filteredJobs.length === 0 || !selectedJob ? (
                <div className="pt-6 text-sm text-slate-500">No jobs to display.</div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#e0e0e0]" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-500">{selectedJob.company}</div>
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

                  {jobView === "saved" ? (
                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        type="button"
                        onClick={() => handleApplyJob(selectedJob.id)}
                        className="h-10 rounded-full bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-5 text-sm font-medium text-white shadow-none hover:opacity-90"
                      >
                        Apply This Job
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleToggleSave(selectedJob.id)}
                        className="h-10 rounded-full border border-[#dcdcdc] px-5 text-sm text-slate-500 hover:bg-slate-50"
                      >
                        {selectedJob.saved ? "Saved" : "Save"}
                      </Button>
                    </div>
                  ) : (
                    renderStatusPanel(selectedJob)
                  )}

                  <div className="mt-5">
                    <h3 className="mb-2 text-base font-medium text-slate-950">Skill Use</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className={`${gradientOutlineChipClassName} h-8 cursor-default`}
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
                    <p className="text-sm leading-relaxed text-slate-500">Company Description</p>
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
