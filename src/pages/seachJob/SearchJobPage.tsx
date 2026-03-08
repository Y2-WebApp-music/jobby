import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoIosMore } from "react-icons/io";
import { HiOutlineSelector } from "react-icons/hi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { ApplyDialog } from "@/features/searchJob/dialogs/ApplyDialog";
import SkillinfoDialog from "@/features/profile/dialog/SkillinfoDialog";

export default function SearchJobPage() {
  const navItem = [
    { label: "Message", href: "/message" },
    { label: "Profile", href: "/profile" },
    { label: "Resume", href: "/resume" },
  ];

  // jobs data + state
  const initialJobs = [
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

  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    initialJobs[0]?.id ?? null,
  );
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(["Front-End", "Back-End", "React"]),
  );
  const [searchType, setSearchType] = useState<"any" | "skill" | "job">("any");
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
  const [filterMode, setFilterMode] = useState<
    "relevance" | "date" | "unviewed"
  >("relevance");
  const [messageCount, setMessageCount] = useState<number>(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDialogKey, setApplyDialogKey] = useState(0);

  const skillOptions = [
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
  const categoryOptions = ["Technology", "Design", "Data", "Security"];
  const workTypeOptions = ["Full-time", "Contract"];
  const workOptionOptions = ["On-site", "Hybrid", "Remote"];
  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const query = searchQuery.trim().toLowerCase();

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

      const score = (job: (typeof jobs)[number]) => {
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
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const toggleWorkType = (value: string) => {
    setSelectedWorkTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const toggleWorkOption = (value: string) => {
    setSelectedWorkOptions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  useEffect(() => {
    // àª×èÍÁµèÍ¡Ñº API à¾×èÍ´Ö§¨Ó¹Ç¹¢éÍ¤ÇÒÁ·ÕèÂÑ§äÁèä´éÍèÒ¹ÁÒáÊ´§
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessageCount(100);
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Top Navbar */}
      <div className="fixed w-full h-14 bg-white flex items-center border-b border-gray-200 shadow z-20">
        <div className="px-4">
          <JobbyLogo height={40} width={110} />
        </div>

        <div className="ml-auto px-4 flex items-center gap-3">
          <Button className="h-8 rounded-full px-4 text-white bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] hover:opacity-90">
            Find Job
          </Button>
          {navItem.map((item, idx) => (
            <Link to={item.href} key={idx}>
              <Button variant="ghost" size="sm" className="relative">
                {item.label}
                {item.label === "Message" && messageCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                )}
              </Button>
            </Link>
          ))}
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Header Search */}
      <div className="border-b bg-white sticky top-14 z-10">
        <div className="w-full px-6 py-4 flex items-start gap-6">
          <h1 className="text-2xl font-bold">Search Job</h1>

          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
                <Input
                  placeholder="Software Engineer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input max-w-full rounded-full border-0 h-9 focus-visible:ring-0"
                />
                <div className="relative">
                  <select
                    value={searchType}
                    onChange={(e) =>
                      setSearchType(e.target.value as "any" | "skill" | "job")
                    }
                    className={`h-9 px-3 border rounded-full bg-transparent appearance-none pr-8 text-sm ${
                      searchType === "skill"
                        ? "text-[var(--color-second)] border-[var(--color-second)]"
                        : searchType === "job"
                          ? "text-[var(--color-main)] border-[var(--color-main)]"
                          : "text-c-a1a1a1 border-c-e5e5e5"
                    }`}
                  >
                    <option value="any" className="text-c-a1a1a1">
                      Any
                    </option>
                    <option value="skill" className="text-c-a1a1a1">
                      Skill
                    </option>
                    <option value="job" className="text-c-a1a1a1">
                      Job
                    </option>
                  </select>
                  <HiOutlineSelector
                    className={`pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 ${
                      searchType === "skill"
                        ? "text-[var(--color-second)]"
                        : searchType === "job"
                          ? "text-[var(--color-main)]"
                          : "text-c-a1a1a1"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Skill Use:
                </span>
                <div className="relative w-[540px] min-h-[54px]">
                  <div className="flex items-center gap-2 rounded-full border border-c-e2e2e2 bg-white px-3 py-2 shadow-sm w-full min-h-[54px]">
                    <div className="flex items-center gap-2 min-w-0">
                      {(() => {
                        const selected = Array.from(selectedSkills);
                        return selected.slice(0, 5).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className="h-7 inline-flex items-center justify-center rounded-full border border-transparent px-3 text-xs text-white bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] whitespace-nowrap"
                          >
                            {skill}
                          </button>
                        ));
                      })()}

                      {(() => {
                        const total = selectedSkills.size;
                        const remaining = Math.max(0, total - 5);
                        return (
                          remaining > 0 && (
                            <span className="h-7 rounded-full border px-3 text-xs bg-c-f5f5f5 text-c-8a8a8a border-c-e2e2e2 inline-flex items-center">
                              +{remaining}
                            </span>
                          )
                        );
                      })()}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSkillOpen((v) => !v)}
                      className="ml-auto h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                      aria-label="toggle skill list"
                    >
                      <HiOutlineSelector className="h-4 w-4 text-c-b3b3b3" />
                    </button>
                    <button
                      type="button"
                      className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-muted-foreground"
                      aria-label="clear skill use"
                      onClick={() => setSelectedSkills(new Set())}
                    >
                      <CgClose />
                    </button>
                  </div>
                  {skillOpen && (
                    <div className="absolute left-0 top-full mt-2 w-full rounded-2xl border border-c-e2e2e2 bg-white shadow-lg p-3 z-20">
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
                                  ? "bg-c-fff4f9 text-second border-c-f7c3e8"
                                  : "bg-white text-c-b3b3b3 border-c-e2e2e2"
                              }`}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className="h-10 w-full px-3 border rounded-full border-c-e5e5e5 bg-transparent text-sm shadow-sm flex items-center"
                >
                  <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    {selectedCategories.size === 0 ? (
                      <span className="text-c-a1a1a1">Any Category</span>
                    ) : (
                      <>
                        {Array.from(selectedCategories)
                          .slice(0, 3)
                          .map((item) => (
                            <span
                              key={item}
                              className="h-6 px-2 rounded-full bg-c-eeeeee text-black inline-flex items-center whitespace-nowrap text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        {selectedCategories.size > 3 && (
                          <span className="h-6 px-2 rounded-full bg-c-eeeeee text-black inline-flex items-center whitespace-nowrap text-xs">
                            +{selectedCategories.size - 3}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <HiOutlineSelector className="ml-auto h-4 w-4 text-c-a1a1a1" />
                </button>
                {categoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full rounded-2xl border border-c-e2e2e2 bg-white shadow-lg p-2 z-30">
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((option) => {
                        const active = selectedCategories.has(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleCategory(option)}
                            className={`h-7 px-3 rounded-full text-xs ${
                              active
                                ? "bg-c-e5e5e5 text-black"
                                : "bg-white text-c-666 border border-c-e2e2e2"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <select
                  value={placeFilter}
                  onChange={(e) => setPlaceFilter(e.target.value)}
                  className="h-10 w-full px-4 border rounded-full text-c-a1a1a1 border-c-e5e5e5 bg-transparent appearance-none pr-8 text-sm shadow-sm"
                >
                  <option>Any Place</option>
                  <option>Bangkok</option>
                </select>
                <HiOutlineSelector className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-c-a1a1a1" />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setWorkTypeOpen((prev) => !prev)}
                  className="h-10 w-full px-3 border rounded-full border-c-e5e5e5 bg-transparent text-sm shadow-sm flex items-center"
                >
                  <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    {selectedWorkTypes.size === 0 ? (
                      <span className="text-c-a1a1a1">Any Work Type</span>
                    ) : (
                      <>
                        {Array.from(selectedWorkTypes)
                          .slice(0, 3)
                          .map((item) => (
                            <span
                              key={item}
                              className="h-6 px-2 rounded-full bg-c-eeeeee text-black inline-flex items-center whitespace-nowrap text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        {selectedWorkTypes.size > 3 && (
                          <span className="h-6 px-2 rounded-full bg-c-eeeeee text-black inline-flex items-center whitespace-nowrap text-xs">
                            +{selectedWorkTypes.size - 3}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <HiOutlineSelector className="ml-auto h-4 w-4 text-c-a1a1a1" />
                </button>
                {workTypeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full rounded-2xl border border-c-e2e2e2 bg-white shadow-lg p-2 z-30">
                    <div className="flex flex-wrap gap-2">
                      {workTypeOptions.map((option) => {
                        const active = selectedWorkTypes.has(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleWorkType(option)}
                            className={`h-7 px-3 rounded-full text-xs ${
                              active
                                ? "bg-c-e5e5e5 text-black"
                                : "bg-white text-c-666 border border-c-e2e2e2"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setWorkOptionOpen((prev) => !prev)}
                  className="h-10 w-full px-3 border rounded-full border-c-e5e5e5 bg-transparent text-sm shadow-sm flex items-center"
                >
                  <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    {selectedWorkOptions.size === 0 ? (
                      <span className="text-c-a1a1a1">Any Work Option</span>
                    ) : (
                      <>
                        {Array.from(selectedWorkOptions)
                          .slice(0, 3)
                          .map((item) => (
                            <span
                              key={item}
                              className="h-6 px-2 rounded-full bg-c-eeeeee text-black inline-flex items-center whitespace-nowrap text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        {selectedWorkOptions.size > 3 && (
                          <span className="h-6 px-2 rounded-full bg-c-eeeeee text-black inline-flex items-center whitespace-nowrap text-xs">
                            +{selectedWorkOptions.size - 3}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <HiOutlineSelector className="ml-auto h-4 w-4 text-c-a1a1a1" />
                </button>
                {workOptionOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full rounded-2xl border border-c-e2e2e2 bg-white shadow-lg p-2 z-30">
                    <div className="flex flex-wrap gap-2">
                      {workOptionOptions.map((option) => {
                        const active = selectedWorkOptions.has(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleWorkOption(option)}
                            className={`h-7 px-3 rounded-full text-xs ${
                              active
                                ? "bg-c-e5e5e5 text-black"
                                : "bg-white text-c-666 border border-c-e2e2e2"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 py-6 grid grid-cols-[460px_1fr] gap-0">
        {/* Job List */}
        <div className="job-list bg-white divide-y divide-gray-100">
          <div className="flex items-center gap-3 mt-15 px-4 py-5">
            <span className="text-sm">{filteredJobs.length} Results</span>
            <div className="inline-flex overflow-hidden rounded-full border border-c-cfcfcf bg-white">
              <button
                type="button"
                onClick={() => setFilterMode("relevance")}
                className={`px-5 py-2.5 text-[14px] leading-none whitespace-nowrap border-r border-c-d8d8d8 ${
                  filterMode === "relevance"
                    ? "text-white border-r-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))]"
                    : "text-c-555 bg-white hover:bg-c-f7f7f7"
                }`}
              >
                Relevance
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("date")}
                className={`px-5 py-2.5 text-[14px] leading-none whitespace-nowrap border-r border-c-d8d8d8 ${
                  filterMode === "date"
                    ? "text-white border-r-transparent bg-[linear-gradient(90deg,var(--color-main),var(--color-second))]"
                    : "text-c-555 bg-white hover:bg-c-f7f7f7"
                }`}
              >
                Date
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("unviewed")}
                className={`px-5 py-2.5 text-[14px] leading-none whitespace-nowrap ${
                  filterMode === "unviewed"
                    ? "text-white bg-[linear-gradient(90deg,var(--color-main),var(--color-second))]"
                    : "text-c-555 bg-white hover:bg-c-f7f7f7"
                }`}
              >
                No browsed yet
              </button>
            </div>
          </div>

          {pagedJobs.map((job) => (
            <Card
              key={job.id}
              onClick={() => handleSelect(job.id)}
              className={`job-card relative min-h-[137px] w-full overflow-hidden cursor-pointer border border-gray-100 rounded-none ${
                selectedJob?.id === job.id
                  ? "shadow-md bg-slate-50"
                  : "hover:bg-white"
              }`}
            >
              {/* rectangular orange bar: sharp corners, full card height, only for selected */}
              {selectedJob?.id === job.id && (
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{ width: 4, background: "var(--color-main)" }}
                />
              )}

              {/* close button top-right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(job.id);
                }}
                className="close-btn absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                aria-label="delete"
              >
                <CgClose />
              </button>

              <CardContent className="p-4 pl-10">
                <div className="flex gap-3">
                  {/* avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

                  <div className="flex-1">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.company}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {job.location}
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      {viewed.has(job.id) && <span>Viewed • </span>}
                      {job.meta}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <div className="relative flex items-center mt-2 text-sm px-4 py-3">
            <button
              className="px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <IoIosArrowBack />
              Previous
            </button>

            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const active = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg ${
                      active
                        ? "text-white bg-[linear-gradient(90deg,var(--color-main),var(--color-second))]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto">
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1 disabled:opacity-40"
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

        {/* Job Detail */}
        <div className="border rounded-none p-6 mt-6 min-h-[720px]">
          {filteredJobs.length === 0 || !selectedJob ? (
            <div className="text-sm text-muted-foreground">
              No jobs to display.
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    {selectedJob.company}
                  </div>
                  <h2 className="text-lg font-semibold">{selectedJob.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedJob.location} • posted 1 week ago
                  </p>
                </div>
                <button className="ml-auto text-muted-foreground hover:text-foreground">
                  <IoIosMore size={20} />
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                <Badge className="rounded-full">On-site</Badge>
                <Badge variant="outline" className="rounded-full">
                  Internship
                </Badge>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => {
                    setApplyDialogKey((prev) => prev + 1);
                    setApplyOpen(true);
                  }}
                  className="rounded-full px-4 py-2 bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white hover:opacity-90"
                >
                  Apply This Job
                </Button>
                <Button variant="outline" className="rounded-full">
                  Saved
                </Button>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-medium mb-2">Skill Use</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedJob.skills?.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="rounded-full"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-medium mb-2">{selectedJob.aboutTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Company Description
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                  {selectedJob.companyDescription}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                  {selectedJob.extraDescription}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedJob && <>{/* <ApplyDialog /> */}</>}
    </div>
  );
}




