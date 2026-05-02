import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { CgClose } from "react-icons/cg";
import { IoIosMore, IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useSearchParams } from "react-router-dom";

import {
    pageSize,
    useSearchJobState,
} from "@/types/job";

const now = Date.now();

type JobStatus = "inreview" | "interview" | "reject" | "accept";
type JobView = "saved" | "applied" | "archived";

const JOB_VIEW_TABS: JobView[] = ["saved", "applied", "archived"];
const STATUS_FILTERS: Array<"all" | JobStatus> = [
    "all",
    "inreview",
    "interview",
    "reject",
    "accept",
];

const STATUS_META: Record<JobStatus, { label: string; desc: string }> = {
    inreview: { label: "In Review", desc: "Company reviewing your applied" },
    interview: { label: "Interview", desc: "Company will contact you" },
    reject: { label: "Reject", desc: "Company reject your applied" },
    accept: { label: "Accept", desc: "Company will contact you" },
};

export default function MyJobsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        jobs,
        setJobs,
        selectedJobId,
        setSelectedJobId,
        setViewed,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
    } = useSearchJobState();

    const rawJobView = searchParams.get("view");
    const jobView: JobView =
        rawJobView === "applied" || rawJobView === "archived" || rawJobView === "saved"
            ? rawJobView
            : "saved";
    const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");

    const jobListRef = useRef<HTMLDivElement | null>(null);

    const query = searchQuery.toLowerCase();

    // Reset to page 1 when switching views or filters
    useEffect(() => {
        setCurrentPage(1);
    }, [jobView, statusFilter, setCurrentPage]);

    const handleJobViewChange = (view: JobView) => {
        setSearchParams({ view }, { replace: true });
    };

    const filteredJobs = useMemo(() => {
        return jobs
            .filter((job) => {
                if (jobView === "saved" && !job.saved) return false;
                if (jobView === "applied" && !job.applied) return false;
                if (jobView === "archived" && !job.archived) return false;

                if (jobView === "applied" && statusFilter !== "all") {
                    if (job.status !== statusFilter) return false;
                }

                if (!query) return true;

                return [job.title, job.company, job.location]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            });
    }, [jobs, jobView, statusFilter, query]);

    const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pagedJobs = filteredJobs.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    const selectedJob =
        filteredJobs.find((j) => j.id === selectedJobId) ||
        pagedJobs[0] ||
        null;

    useEffect(() => {
        jobListRef.current?.scrollTo({ top: 0 });
    }, [currentPage]);

    const handleSelect = (id: number) => {
        setSelectedJobId(id);
        setViewed((prev) => new Set(prev).add(id));
    };

    const handleDelete = (id: number) => {
        setJobs((prev) => prev.filter((j) => j.id !== id));
    };

    const formatPostedAt = (postedAt: string) => {
        const diffDays = Math.floor(
            (now - new Date(postedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0) return "Today";
        if (diffDays < 7) return `${diffDays} days ago`;
        return `${Math.floor(diffDays / 7)} weeks ago`;
    };

    return (
        <PageLayout>
            <div className="h-[calc(100vh-56px)] flex flex-col px-6 pt-4">

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-[28px] font-semibold">My Jobs</h1>

                    <Input
                        placeholder="Search Job"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-[260px] rounded-full"
                    />

                    <div className="ml-auto flex gap-2">
                        {JOB_VIEW_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleJobViewChange(tab)}
                                className={`px-4 py-1 rounded-full text-sm ${jobView === tab
                                        ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                                        : "border text-gray-500"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* STATUS FILTER */}
                {jobView === "applied" && (
                    <div className="flex gap-2 mb-2">
                        {STATUS_FILTERS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 text-xs rounded-full ${statusFilter === s
                                        ? "bg-pink-500 text-white"
                                        : "border text-gray-500"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* MAIN */}
                <div className="grid grid-cols-[420px_1fr] flex-1 border-t">

                    {/* LEFT LIST */}
                    <div className="border-r flex flex-col">
                        <div className="p-3 text-sm text-gray-500">
                            {filteredJobs.length} Results
                        </div>

                        <div ref={jobListRef} className="flex-1 overflow-y-auto">
                            {pagedJobs.map((job) => {
                                const selected = selectedJob?.id === job.id;

                                return (
                                    <Card
                                        key={job.id}
                                        onClick={() => handleSelect(job.id)}
                                        className={`cursor-pointer border-b ${selected ? "bg-gray-100" : ""
                                            }`}
                                    >
                                        <CardContent className="flex gap-3 p-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-xl" />

                                            <div className="flex-1">
                                                <div className="text-sm font-medium">
                                                    {job.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {job.company}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {job.location}
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-1">
                                                    {job.skills.length} Skills •{" "}
                                                    {formatPostedAt(job.postedAt)}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(job.id);
                                                }}
                                            >
                                                <CgClose />
                                            </button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        
                        <div className="relative -mt-[1px] flex min-h-[52px] items-center border-t border-[#e5e5e5] bg-white py-2 text-sm">
                            {/* PREV */}
                            <button
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
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-8 w-8 rounded-lg text-sm ${active
                                                    ? "bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                                                    : "text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* NEXT */}
                            <div className="ml-auto flex justify-end">
                                <button
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

                    
                    <div className="p-4 overflow-y-auto">
                        {!selectedJob ? (
                            <div>No job selected</div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                    <div>{selectedJob.company}</div>
                                    <IoIosMore className="ml-auto" />
                                </div>

                                <h2 className="text-xl font-semibold mt-3">
                                    {selectedJob.title}
                                </h2>

                                <div className="text-sm text-gray-500 mt-1">
                                    {selectedJob.location} •{" "}
                                    {formatPostedAt(selectedJob.postedAt)}
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                                        {selectedJob.workType}
                                    </span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                                        {selectedJob.workOption}
                                    </span>
                                </div>

                                {/* STATUS */}
                                {jobView === "applied" && selectedJob.status && STATUS_META[selectedJob.status] && (
                                    <div className="mt-3 border p-3 rounded-xl">
                                        <div className="text-pink-500 font-medium">
                                            {STATUS_META[selectedJob.status as JobStatus].label}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {STATUS_META[selectedJob.status as JobStatus].desc}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-4">
                                    <Button className="rounded-full">
                                        Apply This Job
                                    </Button>
                                    <Button variant="outline" className="rounded-full">
                                        Save
                                    </Button>
                                </div>

                                <div className="mt-5">
                                    <h3 className="font-medium mb-2">Skills</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedJob.skills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-3 py-1 text-xs border rounded-full"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <h3 className="font-medium">About</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {selectedJob.companyDescription}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>  
            </div>  
        </PageLayout>
    );
}
