import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApplyDialog } from "@/features/searchJob/dialogs/ApplyDialog";
import searchJobService from "@/services/searchJobService";
import userService from "@/services/userService";
import { useAuthStore } from "@/store/auth";
import { pageSize, type Job } from "@/types/job";
import {
  initialApplyDialogJob,
  initialApplyPayload,
  type ApplyPayload,
} from "@/types/searchJob";
import { useEffect, useMemo, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoIosArrowBack, IoIosArrowForward, IoIosMore } from "react-icons/io";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const now = Date.now();

type JobView = "saved" | "applied" | "archived";
type JobStatus = "inreview" | "interview" | "reject" | "accept";
const parseJobView = (rawJobView: string | null): JobView =>
  rawJobView === "saved" ||
  rawJobView === "applied" ||
  rawJobView === "archived"
    ? rawJobView
    : "saved";

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
const isJobStatus = (status: Job["status"]): status is JobStatus =>
  status === "inreview" ||
  status === "interview" ||
  status === "reject" ||
  status === "accept";

const gradientOutlineChipClassName =
  "inline-flex items-center rounded-full border border-transparent px-3 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(90deg,var(--color-main),var(--color-second))_border-box]";

const searchInputClassName =
  "h-10 max-w-[220px] rounded-full border border-[#e5e5e5] bg-white px-4 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.06)]";

const mapStatus = (status: number | null): JobStatus | undefined => {
  if (status === 1) return "inreview";
  if (status === 2) return "interview";
  if (status === 3) return "reject";
  if (status === 4) return "accept";
  return undefined;
};

const formatPostedAt = (postedAt: string) => {
  const postedTime = new Date(postedAt).getTime();
  const diffDays = Math.max(
    0,
    Math.floor((now - postedTime) / (1000 * 60 * 60 * 24)),
  );

  if (diffDays === 0) return "posted today";
  if (diffDays === 1) return "posted 1 day ago";
  if (diffDays < 7) return `posted ${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "posted 1 week ago";
  return `posted ${weeks} weeks ago`;
};

const mapResultToJob = (
  item: Awaited<
    ReturnType<typeof userService.getSavedJobs>
  >["data"]["job_result"][number],
  view: JobView,
): Job => {
  const status = mapStatus(item.status);

  return {
    id: item.id,
    nodeId: item.node_id,
    title: item.name,
    company: item.company.name,
    companyId: item.company.id,
    companyLogo: item.company.logo,
    location: [item.district_name, item.province_name]
      .filter(Boolean)
      .join(", "),
    provinceName: item.province_name,
    districtName: item.district_name,
    meta: `${item.match_skill_count} Skills Match - ${formatPostedAt(item.created_at)}`,
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
    saved: view === "saved",
    applied: view === "applied",
    archived: view === "archived",
    status,
    appliedDate: item.created_at,
  };
};

export default function MyJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyData, setApplyData] = useState<ApplyPayload>(initialApplyPayload);
  const [applyDetail, setApplyDetail] = useState(initialApplyDialogJob);
  const [resumesInJobby, setResumesInJobby] = useState<
    { id: string; name: string; create_date: string }[]
  >([]);
  const jobListRef = useRef<HTMLDivElement | null>(null);

  const rawJobView = searchParams.get("view");
  const jobView: JobView = parseJobView(rawJobView);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null,
    [jobs, selectedJobId],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [jobView, statusFilter]);

  useEffect(() => {
    jobListRef.current?.scrollTo({ top: 0 });
  }, [currentPage]);

  useEffect(() => {
    if (!selectedJobId || !user?.id) return;

    let cancelled = false;

    const loadJobDetail = async () => {
      try {
        const response = await searchJobService.getSearchJobDetail(
          selectedJobId,
          user.id,
        );
        if (cancelled) return;
        setJobs((prev) =>
          prev.map((job) =>
            job.id === selectedJobId
              ? {
                  ...job,
                  skills: response.data.skills.map((item) => item.name),
                  category: response.data.categories
                    .map((item) => item.text_eng)
                    .join(", "),
                  workType: response.data.work_types
                    .map((item) => item.text_eng)
                    .join(", "),
                  workOption: response.data.work_options
                    .map((item) => item.text_eng)
                    .join(", "),
                  companyDescription: response.data.description ?? "",
                  extraDescription: response.data.description_rtf ?? "",
                }
              : job,
          ),
        );
      } catch {
        return;
      }
    };

    void loadJobDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedJobId, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage - 1,
          limit: pageSize,
          search_text: searchQuery.trim(),
        };

        const response =
          jobView === "saved"
            ? await userService.getSavedJobs(user.id, params)
            : jobView === "archived"
              ? await userService.getArchivedJobs(user.id, params)
              : await userService.getAppliedJobs(user.id, {
                  ...params,
                  applied_status:
                    statusFilter === "all"
                      ? undefined
                      : statusFilter === "inreview"
                        ? 1
                        : statusFilter === "interview"
                          ? 2
                          : statusFilter === "reject"
                            ? 3
                            : 4,
                });

        if (cancelled) return;
        const nextJobs = response.data.job_result.map((item) =>
          mapResultToJob(item, jobView),
        );
        setJobs(nextJobs);
        setTotalPages(Math.max(1, response.data.total_page ?? 1));
        setSelectedJobId((prev) => {
          if (prev && nextJobs.some((job) => job.id === prev)) return prev;
          return nextJobs[0]?.id ?? null;
        });
      } catch {
        if (!cancelled) {
          setJobs([]);
          setTotalPages(1);
          setSelectedJobId(null);
          toast.error("Failed to load my jobs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, [currentPage, jobView, searchQuery, statusFilter, user?.id]);

  const handleJobViewChange = (view: JobView) => {
    setSearchParams({ view }, { replace: true });
  };

  const handleRemoveFromView = async (id: string) => {
    if (!user?.id) return;

    try {
      if (jobView === "saved") {
        await searchJobService.unsaveJob(user.id, id);
      }
      setJobs((prev) => {
        const nextJobs = prev.filter((job) => job.id !== id);
        if (selectedJobId === id) {
          setSelectedJobId(nextJobs[0]?.id ?? null);
        }
        return nextJobs;
      });
    } catch {
      toast.error("Failed to update job list");
    }
  };

  const handleOpenApply = async () => {
    if (!user?.id || !selectedJob) {
      toast.error("Please sign in before applying");
      return;
    }

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
      setApplyOpen(true);
    } catch {
      toast.error("Failed to load apply information");
    }
  };

  const handleSubmitApply = async () => {
    if (!user?.id || !selectedJob) {
      throw new Error("User is not signed in");
    }

    await searchJobService.applyJob(user.id, selectedJob.id, applyData);
    toast.success("Application submitted successfully");
    setSearchParams({ view: "applied" }, { replace: true });
  };

  const renderStatusPanel = (job: Job) => {
    if (!isJobStatus(job.status)) return null;

    const statusMeta = STATUS_META[job.status];
    const infoLabel =
      jobView === "archived" ? "Result Updated" : "Applied Date";
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
          <div className={`mt-1 text-sm ${statusMeta.textClass}`}>
            {statusMeta.desc}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4 xl:flex-1">
          <div>
            <div className="text-sm font-medium text-slate-950">
              {infoLabel}
            </div>
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
            <h1 className="text-[20px] font-semibold text-slate-950">
              My Jobs
            </h1>

            <Input
              placeholder="Search Job"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={searchInputClassName}
            />

            <div className="flex flex-wrap items-center gap-2">
              {JOB_VIEW_TABS.map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  variant={jobView === tab.value ? "default" : "outline"}
                  onClick={() => handleJobViewChange(tab.value)}
                  className="inline-flex h-9 items-center rounded-full px-4 text-sm"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {jobView === "applied" ? (
            <div className="mb-4 overflow-x-auto">
              <div className="inline-flex overflow-hidden rounded-full border border-[#d7d7d7] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                {STATUS_FILTERS.map((filter, index) => {
                  const active = statusFilter === filter;
                  const label =
                    filter === "all" ? "All" : STATUS_META[filter].label;

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
                  {jobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    const statusMeta = job.status
                      ? STATUS_META[job.status]
                      : null;

                    return (
                      <Card
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
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
                            void handleRemoveFromView(job.id);
                          }}
                          className="absolute right-3 top-3 text-slate-500 transition hover:text-slate-950"
                          aria-label="delete"
                        >
                          <CgClose />
                        </button>

                        <CardContent className="p-4 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-300">
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <IoIosArrowForward />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-full overflow-y-auto border-l border-[#e5e5e5] pl-4">
              {loading ? (
                <div className="pt-6 text-sm text-slate-500">
                  Loading jobs...
                </div>
              ) : jobs.length === 0 || !selectedJob ? (
                <div className="pt-6 text-sm text-slate-500">
                  No jobs to display.
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-[#e0e0e0]">
                      {selectedJob.companyLogo ? (
                        <img
                          src={selectedJob.companyLogo}
                          alt={selectedJob.company}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-500">
                        {selectedJob.company}
                      </div>
                    </div>
                    <button
                      className="ml-auto text-slate-700 hover:text-slate-950"
                      type="button"
                    >
                      <IoIosMore size={20} />
                    </button>
                  </div>

                  <div className="mt-3 text-[22px] font-semibold leading-tight text-slate-950">
                    {selectedJob.title}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{selectedJob.location}</span>
                    <span>-</span>
                    <span>{formatPostedAt(selectedJob.postedAt)}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
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

                  {jobView === "saved" ? (
                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        type="button"
                        onClick={() => void handleOpenApply()}
                        className="h-10 rounded-full bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] px-5 text-sm font-medium text-white shadow-none hover:opacity-90"
                      >
                        Apply This Job
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void handleRemoveFromView(selectedJob.id)
                        }
                        className="h-10 rounded-full border border-[#dcdcdc] px-5 text-sm text-slate-500 hover:bg-slate-50"
                      >
                        Unsave
                      </Button>
                    </div>
                  ) : (
                    renderStatusPanel(selectedJob)
                  )}

                  <div className="mt-5">
                    <h3 className="mb-2 text-base font-medium text-slate-950">
                      Skill Use
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.length > 0 ? (
                        selectedJob.skills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            className={`${gradientOutlineChipClassName} h-8 cursor-default`}
                          >
                            {skill}
                          </button>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          No skills available.
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

      <ApplyDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        applyDetail={applyDetail}
        applyData={applyData}
        setApplyData={setApplyData}
        resumesInJobby={resumesInJobby}
        onApply={handleSubmitApply}
      />
    </PageLayout>
  );
}
