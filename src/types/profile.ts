import type { ProfileFormValue } from "@/features/profile/dialog/ProfileDialog";
import type { EducationItem } from "@/features/profile/dialog/EducateDialog";
import type { WorkExperienceItem } from "@/features/profile/dialog/WorkexpDialog";
import type { ProjectItem } from "@/features/profile/dialog/ProjectDialog";


export type AchievementItem = {
    id: number;
    name: string;
    from: string;
    description: string;
    skills: string[];
    images: string[];
    date: string;
};

export type ApplicationItem = {
    id: number;
    title: string;
    company: string;
    note: string;
};

export const defaultEducation: EducationItem[] = Array.from({ length: 3 }).map(
    (_, i) => ({
    id: i,
    school: "School Name",
    degree: "Associate's degree",
    fieldOfStudy: "Computer Science",
    startDate: "2022-03-01",
    endDate: "2026-09-01",
    gpax: "",
    date: "01 Mar 2022 - 01 Sep 2026",
}),
);

export const defaultWorkExperience: WorkExperienceItem[] = Array.from({
    length: 3,
}).map((_, i) => ({
    id: i,
    position: "Position",
    company: "Company",
    workType: "",
    skills: [],
    startDate: "2022-03-01",
    endDate: "2026-09-01",
    isFinished: true,
    date: "01 Mar 2022 - 01 Sep 2026",
}));

export const defaultProjects: ProjectItem[] = Array.from({ length: 2 }).map(
    (_, i) => ({
    id: i,
    name: "Project Name",
    description: "Description",
    skills: [],
    startDate: "2026-09-01",
    endDate: "2026-11-01",
    images: [],
    date: "01 Sep 2026 - 01 Nov 2026",
}),
);

export const defaultAchievements: AchievementItem[] = Array.from({
    length: 2,
}).map((_, i) => ({
    id: i,
    name: "Reward Name",
    from: "Project Name",
    description: "Description",
    skills: ["React"],
    images: [],
    date: "Mar 2022",
}));

export const defaultApplications: ApplicationItem[] = [
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

export const defaultProfileForm: ProfileFormValue = {
    firstName: "Nut",
    lastName: "Somwang",
    region: "THA",
    tel: "66896474467",
    email: "kunguy.159@gmail.com",
    addressLine: "King Mongkut's University of Technology Thonburi",
    addressNo: "",
    moo: "ping",
    soi: "homyai",
    street: "food",
    province: "monky",
    district: "line",
    subDistrict: "My made nate",
    postalCode: "67",
    links: [{ id: 1, label: "linkedIn", url: "www.linkedin.com/*******" }],
};



export const defaultAboutText =
    "putang ina mo";
