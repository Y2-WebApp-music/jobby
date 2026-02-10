import { Link } from "react-router-dom";
import { useState } from "react";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";

const skills = [
    "React",
    "Front-End",
    "Node.JS",
    "express",
    "TypeScript",
    "SQL",
    "noSQL",
];

const education = Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    school: "School Name",
    degree: "Associate's degree, Computer Science",
    date: "Mar 2022 - Sep 2026",
}));

const experiences = Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    role: "Position",
    company: "Company",
    date: "Mar 2022 - Sep 2026",
}));

const projects = Array.from({ length: 2 }).map((_, i) => ({
    id: i,
    name: "Project Name",
    desc: "Description",
    date: "Sep 2026 - Nov 2026",
}));

const achievements = Array.from({ length: 2 }).map((_, i) => ({
    id: i,
    name: "Reward Name",
    from: "Project Name",
    date: "Mar 2022",
}));

const applications = [
    {
        id: 1,
        title: "Personal Assistant 25 - 35 K (WFH 80%)",
        company: "Select Service Partner Ltd.",
        note: "Applied 7month ago",
    },
    {
        id: 2,
        title: "Operations Manager",
        company: "Select Service Partner Ltd.",
        note: "Applied 7month ago",
    },
    {
        id: 3,
        title: "Personal Assistant 25 - 35 K (WFH 80%)",
        company: "Select Service Partner Ltd.",
        note: "Applied 7month ago",
    },
];

function SectionHeader({ title }: { title: string }) {
    return (
    <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
        className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        aria-label={`Edit ${title}`}>
        ✎
        </button>
    </div>
    );
}

function CardItem({
    title,
    subtitle,
    meta,
}: {
    title: string;
    subtitle: string;
    meta: string;
}) {
    return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="h-11 w-11 rounded-full bg-slate-200" />
        <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-600">{subtitle}</div>
        <div className="text-xs text-slate-500">{meta}</div>
        </div>
    </div>
);
}

    export default function Profile() {
    const [profileUrl, setProfileUrl] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const navItem = [
        { label: "Find Job", href: "/find" },
        { label: "Message", href: "/message", badge: "99+" },
        { label: "Profile", href: "/profile", active: true },
        { label: "Resume", href: "/resume" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
        <div className="fixed inset-x-0 top-0 z-40 h-14 bg-white border-b border-slate-200">
            <div className="mx-auto flex h-full max-w-7xl items-center px-4">
            <JobbyLogo height={36} width={110} />
            <div className="ml-auto flex items-center gap-2">
                {navItem.map((item) => (
                <Link
                    key={item.label}
                    to={item.href}
                    className={`relative rounded-full px-3 py-1 text-sm ${
                    item.active
                        ? "bg-[#F335EC] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                    {item.label}
                    {item.badge && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                        {item.badge}
                    </span>
                    )}
                </Link>
                ))}
                <div className="ml-2 h-8 w-8 rounded-full bg-slate-300" />
            </div>
            </div>
        </div>

        <div className="relative mx-auto h-[396px] w-full max-w-[1584px] overflow-hidden bg-slate-100">
                {/* input upload */}
                <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        setBannerUrl(url);
                    }}
                />

                {/* banner image */}
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt="Banner"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        Upload Banner
                    </div>
                )}

                {/* hover overlay */}
                <label
                    htmlFor="banner-upload"
                    className="absolute inset-0 flex cursor-pointer items-center justify-center
                    bg-black/50 text-sm font-medium text-white opacity-0
                    transition-opacity hover:opacity-100"
                >
                    Upload Banner
                </label>
            </div>


            <div className="relative px-6 pb-6 pt-0">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:gap-6">
                <div className="relative -mt-12 h-24 w-24">
                    <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        setProfileUrl(url);
                    }}
                    />
                    <div className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-300 shadow-md">
                    {profileUrl ? (
                        <img
                        src={profileUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        />
                    ) : null}
                    <label
                        htmlFor="profile-upload"
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        Upload Profile
                    </label>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Nut Somwang
                    </h2>
                    <button
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Edit profile"
                    >
                        ✎
                    </button>
                    </div>
                    <p className="text-sm text-slate-600">
                    King Mongkut's University of Technology Thonburi{" "}
                    <span className="text-slate-400">
                        (Current Education/Current Position)
                    </span>
                    </p>
                    <p className="text-sm text-slate-500">Bangkok, Thailand</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    {[
                        "kunguy.159@gmail.com",
                        "+66624311671",
                        "linkedin",
                        "github",
                        "facebook",
                        "Instagram",
                    ].map((item) => (
                        <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1"
                        >
                        {item}
                        </span>
                    ))}
                    </div>
                </div>
                <button className="h-9 rounded-full bg-[#FF8E00] px-4 text-sm font-medium text-white shadow-sm">
                    Your Resume
                </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <SectionHeader title="About" />
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Aliquam neque nunc, vestibulum rutrum ornare vitae, suscipit
                        non lacus. Donec eget ultrices ante. Aenean in sem nulla.
                        Proin sit amet libero sit amet libero hendrerit ornare.
                        Suspendisse sed eros at justo bibendum euismod sit amet nec
                        tellus. Maecenas tincidunt nisi pharetra eros semper
                        finibus. Aliquam mattis ipsum sem, elementum venenatis leo
                        faucibus a. Sed nec elit nibh. Nunc et sapien sit amet odio
                        tincidunt pharetra. Curabitur quam metus, molestie ut nunc
                        nec, placerat blandit nulla id cursus lobortis. Quisque
                        egestas magna non sem condimentum volutpat. Donec erat erat,
                        lobortis id feugiat.
                    </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <SectionHeader title="Education" />
                    <div className="mt-3 space-y-3">
                        {education.map((item) => (
                        <CardItem
                            key={item.id}
                            title={item.school}
                            subtitle={item.degree}
                            meta={item.date}
                        />
                        ))}
                    </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <SectionHeader title="Work Experience" />
                    <div className="mt-3 space-y-3">
                        {experiences.map((item) => (
                        <CardItem
                            key={item.id}
                            title={item.role}
                            subtitle={item.company}
                            meta={item.date}
                        />
                        ))}
                    </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <SectionHeader title="Project" />
                    <div className="mt-3 space-y-3">
                        {projects.map((item) => (
                        <CardItem
                            key={item.id}
                            title={item.name}
                            subtitle={item.desc}
                            meta={item.date}
                        />
                        ))}
                    </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <SectionHeader title="Achievement" />
                    <div className="mt-3 space-y-3">
                        {achievements.map((item) => (
                        <CardItem
                            key={item.id}
                            title={item.name}
                            subtitle={item.from}
                            meta={item.date}
                        />
                        ))}
                    </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">
                        Your Skill
                        </h3>
                        <button className="rounded-full bg-[#FF8E00] px-3 py-1 text-xs font-medium text-white">
                        + New Skill
                        </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-full border border-[#F335EC] px-3 py-1 text-xs text-[#F335EC]"
                        >
                            {skill}
                        </span>
                        ))}
                    </div>
                    <button className="mt-3 text-xs text-[#FF8E00]">
                        Show more
                    </button>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Your Application
                    </h3>
                    <div className="mt-3 space-y-3">
                        {applications.map((app) => (
                        <div
                            key={app.id}
                            className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-slate-300" />
                            <div>
                            <div className="text-sm font-semibold text-slate-900">
                                {app.title}
                            </div>
                            <div className="text-xs text-slate-600">
                                {app.company}
                            </div>
                            <div className="text-xs text-slate-500">{app.note}</div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
    
    );
}
