import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { CgClose } from "react-icons/cg";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";
import ImageEditor from "../../features/profile/dialog/ImageEditorModel";
import ProfileDialog, {
  type ProfileFormValue,
} from "../../features/profile/dialog/ProfileDialog";
import AboutDialog from "../../features/profile/dialog/AboutDialog";
import EducateDialog, {
  type EducationItem,
} from "../../features/profile/dialog/EducateDialog";
import WorkexpDialog, {
  type WorkExperienceItem,
} from "../../features/profile/dialog/WorkexpDialog";
import ProjectDialog, {
  type ProjectItem,
} from "../../features/profile/dialog/ProjectDialog";
import Thumbnail from "@/assets/images/Thumbnail.svg";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

const skills = [
  "React",
  "Front-End",
  "Node.JS",
  "express",
  "TypeScript",
  "SQL",
  "noSQL",
];

const DEFAULT_EDUCATION: EducationItem[] = Array.from({ length: 3 }).map(
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

const DEFAULT_WORK_EXPERIENCE: WorkExperienceItem[] = Array.from({
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

const DEFAULT_PROJECTS: ProjectItem[] = Array.from({ length: 2 }).map(
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

const DEFAULT_PROFILE_FORM: ProfileFormValue = {
  firstName: "Nut",
  lastName: "Somwang",
  region: "THA",
  tel: "66624311671",
  email: "kunguy.159@gmail.com",
  addressLine: "King Mongkut's University of Technology Thonburi",
  addressNo: "",
  moo: "",
  soi: "",
  street: "",
  province: "",
  district: "",
  subDistrict: "",
  postalCode: "",
  links: [{ id: 1, label: "linkedIn", url: "www.linkedin.com/*******" }],
};

const DEFAULT_ABOUT_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam neque nunc, vestibulum rutrum ornare vitae, suscipit non lacus. Donec eget ultrices ante. Aenean in sem nulla. Proin sit amet libero sit amet libero hendrerit ornare. Suspendisse sed eros at justo bibendum euismod sit amet nec tellus. Maecenas tincidunt nisi pharetra eros semper finibus. Aliquam mattis ipsum sem, elementum venenatis leo faucibus a. Sed nec elit nibh. Nunc et sapien sit amet odio tincidunt pharetra.";

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <button
        type="button"
        onClick={onEdit}
        className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        aria-label={`Edit ${title}`}
      >
        <RiPencilFill className="mx-auto h-4 w-4" />
      </button>
    </div>
  );
}

function CardItem({
  title,
  subtitle,
  meta,
  onClick,
}: {
  title: string;
  subtitle: string;
  meta: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left ${
        onClick ? "cursor-pointer hover:bg-slate-100" : ""
      }`}
    >
      <div className="h-11 w-11 rounded-full bg-slate-200" />
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-600">{subtitle}</div>
        <div className="text-xs text-slate-500">{meta}</div>
      </div>
    </button>
  );
}

export default function Profile() {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>(Thumbnail);
  const [editorOpen, setEditorOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [workexpDialogOpen, setWorkexpDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectEditingId, setProjectEditingId] = useState<number | null>(null);
  const [projectPreviewOpen, setProjectPreviewOpen] = useState(false);
  const [previewProjectId, setPreviewProjectId] = useState<number | null>(null);
  const [projectDirectEditMode, setProjectDirectEditMode] = useState(false);
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT_TEXT);
  const [education, setEducation] =
    useState<EducationItem[]>(DEFAULT_EDUCATION);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>(
    DEFAULT_WORK_EXPERIENCE,
  );
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [profileForm, setProfileForm] =
    useState<ProfileFormValue>(DEFAULT_PROFILE_FORM);
  const [editingTarget, setEditingTarget] = useState<
    "profile" | "banner" | null
  >(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const projectImageListRef = useRef<HTMLDivElement | null>(null);
  const navItem = [
    { label: "Find Job", href: "/searchjob" },
    { label: "Message", href: "/message", badge: "99+" },
    { label: "Profile", href: "/profile", active: true },
    { label: "Resume", href: "/resume" },
  ];
  const isDefaultBanner = bannerUrl === Thumbnail;

  const handleSelectImage = (file: File, target: "profile" | "banner") => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert("Please select an image smaller than or equal to 15MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setEditingImage(url);
    setEditingTarget(target);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    if (editingImage?.startsWith("blob:")) {
      URL.revokeObjectURL(editingImage);
    }
    setEditingImage(null);
    setEditingTarget(null);
  };

  const handleSaveImage = (image: string) => {
    if (editingTarget === "profile") {
      setProfileUrl(image);
    } else if (editingTarget === "banner") {
      setBannerUrl(image);
    }
    handleCloseEditor();
  };

  const handleOpenProjectPreview = (projectId: number) => {
    setPreviewProjectId(projectId);
    setProjectPreviewOpen(true);
  };

  const handleScrollProjectImages = (direction: "left" | "right") => {
    const el = projectImageListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -260 : 260;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const previewProject =
    projects.find((item) => item.id === previewProjectId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-x-0 top-0 z-40 h-14 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4">
          <JobbyLogo height={36} width={110} />
          <div className="ml-auto flex items-center gap-2">
            {navItem.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`relative rounded-full px-3 py-1 text-sm ${
                  item.active
                    ? "bg-gradient-to-r from-[#FF8E00] to-[#F335EC] text-white shadow-sm"
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

      <div className="relative mx-auto mt-18 w-full max-w-[1411px] overflow-hidden rounded-[20px] bg-slate-100 aspect-[1411/275]">
        {/* input upload */}
        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleSelectImage(file, "banner");
          }}
        />

        {/* banner image */}
        <img
          src={bannerUrl}
          alt="Banner"
          className={`h-full w-full ${isDefaultBanner ? "object-contain" : "object-cover"}`}
        />

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
          <div className="relative -mt-14 h-30 w-40">
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleSelectImage(file, "profile");
              }}
            />
            <div className="group relative h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-slate-300 shadow-md">
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
          <div className="flex-1 md:mt-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {`${profileForm.firstName} ${profileForm.lastName}`.trim() ||
                  "Your Name"}
              </h2>
              <button
                type="button"
                onClick={() => setProfileDialogOpen(true)}
                className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
                aria-label="Edit profile"
              >
                <RiPencilFill className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              {profileForm.addressLine || "Current Education/Current Position"}{" "}
              <span className="text-slate-400">
                ({profileForm.addressNo || "Current Education/Current Position"}
                )
              </span>
            </p>
            <p className="text-sm text-slate-500">
              {profileForm.region || "Bangkok, Thailand"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              {[
                profileForm.email,
                profileForm.tel ? `+${profileForm.tel}` : "",
                ...profileForm.links
                  .map((link) => link.label || link.url)
                  .filter(Boolean),
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
          <button className="mt-3 h-9 rounded-full bg-gradient-to-r from-[#FF8E00] to-[#F335EC] px-4 text-sm font-medium text-white shadow-sm md:mt-3">
            Your Resume
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <SectionHeader
                title="About"
                onEdit={() => setAboutDialogOpen(true)}
              />
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {aboutText || "No about information yet."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <SectionHeader
                title="Education"
                onEdit={() => setEducationDialogOpen(true)}
              />
              <div className="mt-3 space-y-3">
                {education.map((item) => (
                  <CardItem
                    key={item.id}
                    title={item.school}
                    subtitle={[item.degree, item.fieldOfStudy]
                      .filter(Boolean)
                      .join(", ")}
                    meta={item.date}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <SectionHeader
                title="Work Experience"
                onEdit={() => setWorkexpDialogOpen(true)}
              />
              <div className="mt-3 space-y-3">
                {workExperience.map((item) => (
                  <CardItem
                    key={item.id}
                    title={item.position}
                    subtitle={item.company}
                    meta={item.date}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <SectionHeader
                title="Project"
                onEdit={() => {
                  setProjectEditingId(null);
                  setProjectDirectEditMode(false);
                  setProjectDialogOpen(true);
                }}
              />
              <div className="mt-3 space-y-3">
                {projects.map((item) => (
                  <CardItem
                    key={item.id}
                    title={item.name}
                    subtitle={item.description}
                    meta={item.date}
                    onClick={() => handleOpenProjectPreview(item.id)}
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
                <button className="rounded-full bg-gradient-to-r from-[#FF8E00] to-[#F335EC] text-white shadow-sm px-3 py-1 text-xs font-medium text-white">
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
              <button className="mt-3 block mx-auto text-xs text-[#FF8E00]">
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

      {editingImage && editingTarget ? (
        <ImageEditor
          open={editorOpen}
          image={editingImage}
          outputSize={
            editingTarget === "banner"
              ? { w: 1411, h: 275 }
              : { w: 320, h: 320 }
          }
          onClose={handleCloseEditor}
          onSave={handleSaveImage}
        />
      ) : null}

      <ProfileDialog
        key={profileDialogOpen ? "open" : "closed"}
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onSave={setProfileForm}
        initialData={profileForm}
      />

      <AboutDialog
        key={aboutDialogOpen ? "open" : "closed"}
        open={aboutDialogOpen}
        initialValue={aboutText}
        onClose={() => setAboutDialogOpen(false)}
        onSave={setAboutText}
      />

      <EducateDialog
        key={educationDialogOpen ? "open" : "closed"}
        open={educationDialogOpen}
        initialData={education}
        onClose={() => setEducationDialogOpen(false)}
        onSave={setEducation}
      />

      <WorkexpDialog
        key={workexpDialogOpen ? "open" : "closed"}
        open={workexpDialogOpen}
        initialData={workExperience}
        onClose={() => setWorkexpDialogOpen(false)}
        onSave={setWorkExperience}
      />

      <ProjectDialog
        key={projectDialogOpen ? "open" : "closed"}
        open={projectDialogOpen}
        initialData={projects}
        initialEditingId={projectEditingId}
        directEditMode={projectDirectEditMode}
        onClose={() => {
          setProjectDialogOpen(false);
          setProjectEditingId(null);
          setProjectDirectEditMode(false);
        }}
        onSave={(items) => {
          setProjects(items);
          setProjectEditingId(null);
          setProjectDirectEditMode(false);
        }}
      />

      {projectPreviewOpen && previewProject ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {previewProject.name || "Project Name"}
                </h2>
                <p className="text-sm text-slate-500">
                  {previewProject.date || "Start date - End date"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProjectPreviewOpen(false);
                  setPreviewProjectId(null);
                }}
                className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
                aria-label="Close project preview"
              >
                <CgClose className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScrollProjectImages("left")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                aria-label="Previous images"
              >
                {"<"}
              </button>
              <div
                ref={projectImageListRef}
                className="flex flex-1 gap-3 overflow-x-auto scroll-smooth"
              >
                {previewProject.images.length > 0 ? (
                  previewProject.images.map((image, idx) => (
                    <img
                      key={`${image}-${idx}`}
                      src={image}
                      alt={`Project image ${idx + 1}`}
                      className="h-[280px] w-[240px] shrink-0 rounded-xl object-cover"
                    />
                  ))
                ) : (
                  <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                    No images uploaded
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleScrollProjectImages("right")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                aria-label="Next images"
              >
                {">"}
              </button>
            </div>

            <p className="mb-3 text-sm leading-relaxed text-slate-700">
              {previewProject.description || "No description."}
            </p>

            <div>
              <h3 className="mb-2 text-base font-medium text-slate-900">
                Skill use
              </h3>
              <div className="flex flex-wrap gap-2">
                {previewProject.skills.length > 0 ? (
                  previewProject.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#F335EC] px-3 py-1 text-xs text-[#F335EC]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No skills</span>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setProjectEditingId(previewProject.id);
                  setProjectDirectEditMode(true);
                  setProjectPreviewOpen(false);
                  setProjectDialogOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <RiPencilFill className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
