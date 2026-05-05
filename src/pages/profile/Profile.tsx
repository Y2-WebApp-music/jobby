import { useRef, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { CgClose } from "react-icons/cg";
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
import AddskillDialog from "../../features/profile/dialog/AddskillDialog";
import SkillinfoDialog from "../../features/profile/dialog/SkillinfoDialog";
// import UserskillDialog from "../../features/profile/dialog/UserskillDialog";
import AchievementDialog, {
  type AchievementItem,
} from "../../features/profile/dialog/AchievementDialog";
import ProjectDialog, {
  type ProjectItem,
} from "../../features/profile/dialog/ProjectDialog";
import Thumbnail from "@/assets/Thumbnail.svg";
import { Button } from "@/components/ui/button";
import {
  defaultAboutText,
  defaultAchievements,
  defaultApplications,
  defaultEducation,
  defaultProfileForm,
  defaultProjects,
  defaultWorkExperience,
} from "@/types/profile";
import PageLayout from "@/components/layout/PageLayout";

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

const DialogID = {
  PROFILE_EDIT: "profile-edit",
  ABOUT: "about",
  SKILL_ADD: "skill-add",
  EDUCATION: "education",
  WORK_EXPERIENCE: "work-experience",
  ACHIEVEMENT: "achievement",
  PROJECT: "project",
  PROJECT_PREVIEW: "project-preview",
  ACHIEVEMENT_PREVIEW: "achievement-preview",
} as const;

const OverlayDialogID = {
  IMAGE_EDITOR: "image-editor",
  SKILL_INFO: "skill-info",
} as const;

type DialogId = (typeof DialogID)[keyof typeof DialogID];
type OverlayDialogId = (typeof OverlayDialogID)[keyof typeof OverlayDialogID];

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900 break-words">
        {title}
      </h3>
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
  subtitleClassName = "",
}: {
  title: string;
  subtitle: string;
  meta: string;
  onClick?: () => void;
  subtitleClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left ${
        onClick ? "cursor-pointer hover:bg-slate-100" : ""
      }`}
    >
      <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900 break-words">
          {title}
        </div>
        <div
          className={`text-xs text-slate-600 break-words ${subtitleClassName}`}
        >
          {subtitle}
        </div>
        <div className="text-xs text-slate-500 break-words">{meta}</div>
      </div>
    </button>
  );
}

function SkillApplicationSection({
  skills,
  onNewSkill,
  onOpenSkillInfo,
  onShowMore,
}: {
  skills: string[];
  onNewSkill: () => void;
  onOpenSkillInfo: (skill: string) => void;
  onShowMore?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 break-words">
            Your Skill
          </h3>
          <Button
            type="button"
            onClick={onNewSkill}
            className="rounded-full bg-gradient-to-r from-main to-second px-3 py-1 text-xs font-medium text-white shadow-sm"
          >
            + New Skill
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              type="button"
              onClick={() => onOpenSkillInfo(skill)}
              key={skill}
              className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
            >
              {skill}
            </button>
          ))}
        </div>
        {onShowMore ? (
          <button
            type="button"
            onClick={onShowMore}
            className="mt-3 block mx-auto text-xs text-main"
          >
            Show more
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900 break-words">
          Your Application
        </h3>
        <div className="mt-3 space-y-3">
          {defaultApplications.map((app) => (
            <div
              key={app.id}
              className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-slate-300" />
              <div>
                <div className="text-sm font-semibold text-slate-900 break-words">
                  {app.title}
                </div>
                <div className="text-xs text-slate-600">{app.company}</div>
                <div className="text-xs text-slate-500 break-words">
                  {app.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// คอมบาย
export default function Profile() {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>(Thumbnail);
  const [openDialog, setOpenDialog] = useState<DialogId | null>(null);
  const [openOverlayDialog, setOpenOverlayDialog] =
    useState<OverlayDialogId | null>(null);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [achievementEditingId, setAchievementEditingId] = useState<
    number | null
  >(null);
  const [previewAchievementId, setPreviewAchievementId] = useState<
    number | null
  >(null);
  const [achievementDirectEditMode, setAchievementDirectEditMode] =
    useState(false);
  const [projectEditingId, setProjectEditingId] = useState<number | null>(null);
  const [previewProjectId, setPreviewProjectId] = useState<number | null>(null);
  const [projectDirectEditMode, setProjectDirectEditMode] = useState(false);
  const [aboutText, setAboutText] = useState(defaultAboutText);
  const [education, setEducation] = useState<EducationItem[]>(defaultEducation);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>(
    defaultWorkExperience,
  );
  const [achievements, setAchievements] =
    useState<AchievementItem[]>(defaultAchievements);
  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects);
  const [profileForm, setProfileForm] =
    useState<ProfileFormValue>(defaultProfileForm);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [editingTarget, setEditingTarget] = useState<
    "profile" | "banner" | null
  >(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const projectImageListRef = useRef<HTMLDivElement | null>(null);
  const achievementImageListRef = useRef<HTMLDivElement | null>(null);
  // จนถึงนี้

  const isDefaultBanner = bannerUrl === Thumbnail;

  const handleSelectImage = (file: File, target: "profile" | "banner") => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert("Please select an image smaller than or equal to 15MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setEditingImage(url);
    setEditingTarget(target);
    setOpenOverlayDialog(OverlayDialogID.IMAGE_EDITOR);
  };

  const handleCloseEditor = () => {
    setOpenOverlayDialog(null);
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
    setOpenDialog(DialogID.PROJECT_PREVIEW);
  };
  const handleOpenAchievementPreview = (achievementId: number) => {
    setPreviewAchievementId(achievementId);
    setOpenDialog(DialogID.ACHIEVEMENT_PREVIEW);
  };

  const handleScrollProjectImages = (direction: "left" | "right") => {
    const el = projectImageListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -260 : 260;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };
  const handleScrollAchievementImages = (direction: "left" | "right") => {
    const el = achievementImageListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -260 : 260;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const previewProject =
    projects.find((item) => item.id === previewProjectId) ?? null;
  const previewAchievement =
    achievements.find((item) => item.id === previewAchievementId) ?? null;
  const handleAddProfileSkill = (skill: string) => {
    if (!skill) return;
    setUserSkills((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
  };

  const handleRemoveProfileSkill = (skill: string) => {
    setUserSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleOpenSkillInfo = (skill: string) => {
    setSelectedSkillName(skill);
    setOpenOverlayDialog(OverlayDialogID.SKILL_INFO);
  };

  return (
    <PageLayout>
      <div className="min-h-screen">
        <div className="relative mt-6 mx-4 w-auto overflow-hidden rounded-[20px] bg-slate-100 aspect-[1411/275] sm:mx-6 sm:mt-8">
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

          <img
            src={bannerUrl}
            alt="Banner"
            className={`h-full w-full ${isDefaultBanner ? "object-contain" : "object-cover"}`}
          />

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
            <div className="relative -mt-10 h-28 w-28 sm:-mt-14 sm:h-40 sm:w-40">
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
              <div className="group relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-300 shadow-md sm:h-40 sm:w-40">
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
                  onClick={() => setOpenDialog(DialogID.PROFILE_EDIT)}
                  className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
                  aria-label="Edit profile"
                >
                  <RiPencilFill className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600">
                {profileForm.addressLine ||
                  "Current Education/Current Position"}{" "}
                <span className="text-slate-400">
                  (
                  {profileForm.addressNo ||
                    "Current Education/Current Position"}
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
            <Button
              type="button"
              className="mt-3 h-9 rounded-full bg-gradient-to-r from-main to-second px-4 text-sm font-medium text-white shadow-sm md:mt-3"
            >
              Your Resume
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="About"
                  onEdit={() => setOpenDialog(DialogID.ABOUT)}
                />
                <p className="mt-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-600">
                  {aboutText || "No about information yet."}
                </p>
              </div>

              <div className="lg:hidden">
                <SkillApplicationSection
                  skills={userSkills}
                  onNewSkill={() => setOpenDialog(DialogID.SKILL_ADD)}
                  onOpenSkillInfo={handleOpenSkillInfo}
                />
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="Education"
                  onEdit={() => setOpenDialog(DialogID.EDUCATION)}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    education.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
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
                  onEdit={() => setOpenDialog(DialogID.WORK_EXPERIENCE)}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    workExperience.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
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
                    setOpenDialog(DialogID.PROJECT);
                  }}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    projects.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {projects.map((item) => (
                    <CardItem
                      key={item.id}
                      title={item.name}
                      subtitle={item.description}
                      meta={item.date}
                      subtitleClassName="line-clamp-4 whitespace-pre-line break-words"
                      onClick={() => handleOpenProjectPreview(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <SectionHeader
                  title="Achievement"
                  onEdit={() => {
                    setAchievementEditingId(null);
                    setAchievementDirectEditMode(false);
                    setOpenDialog(DialogID.ACHIEVEMENT);
                  }}
                />
                <div
                  className={`mt-3 space-y-3 ${
                    achievements.length > 3
                      ? "max-h-[300px] overflow-y-auto pr-2"
                      : ""
                  }`}
                >
                  {achievements.map((item) => (
                    <CardItem
                      key={item.id}
                      title={item.name}
                      subtitle={item.from}
                      meta={item.date}
                      subtitleClassName="line-clamp-4 whitespace-pre-line break-words"
                      onClick={() => handleOpenAchievementPreview(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="hidden lg:block">
                <SkillApplicationSection
                  skills={userSkills}
                  onNewSkill={() => setOpenDialog(DialogID.SKILL_ADD)}
                  onOpenSkillInfo={handleOpenSkillInfo}
                />
              </div>
            </div>
          </div>
        </div>

        {editingImage && editingTarget ? (
          <ImageEditor
            open={openOverlayDialog === OverlayDialogID.IMAGE_EDITOR}
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
          key={openDialog === DialogID.PROFILE_EDIT ? "open" : "closed"}
          open={openDialog === DialogID.PROFILE_EDIT}
          onClose={() => setOpenDialog(null)}
          onSave={setProfileForm}
          initialData={profileForm}
        />

        <AboutDialog
          key={openDialog === DialogID.ABOUT ? "open" : "closed"}
          open={openDialog === DialogID.ABOUT}
          initialValue={aboutText}
          onClose={() => setOpenDialog(null)}
          onSave={setAboutText}
        />

        <AddskillDialog
          open={openDialog === DialogID.SKILL_ADD}
          onClose={() => setOpenDialog(null)}
          existingSkills={userSkills}
          onAddSkill={handleAddProfileSkill}
          onRemoveSkill={handleRemoveProfileSkill}
          showSkillsList
          enableSkillExam
        />

        <EducateDialog
          key={openDialog === DialogID.EDUCATION ? "open" : "closed"}
          open={openDialog === DialogID.EDUCATION}
          initialData={education}
          onClose={() => setOpenDialog(null)}
          onSave={setEducation}
        />

        <WorkexpDialog
          key={openDialog === DialogID.WORK_EXPERIENCE ? "open" : "closed"}
          open={openDialog === DialogID.WORK_EXPERIENCE}
          initialData={workExperience}
          onClose={() => setOpenDialog(null)}
          onSave={setWorkExperience}
        />

        <AchievementDialog
          key={openDialog === DialogID.ACHIEVEMENT ? "open" : "closed"}
          open={openDialog === DialogID.ACHIEVEMENT}
          initialData={achievements}
          initialEditingId={achievementEditingId}
          directEditMode={achievementDirectEditMode}
          onClose={() => {
            setOpenDialog(null);
            setAchievementEditingId(null);
            setAchievementDirectEditMode(false);
          }}
          onSave={(items) => {
            setAchievements(items);
            setAchievementEditingId(null);
            setAchievementDirectEditMode(false);
          }}
        />

        <ProjectDialog
          key={openDialog === DialogID.PROJECT ? "open" : "closed"}
          open={openDialog === DialogID.PROJECT}
          initialData={projects}
          initialEditingId={projectEditingId}
          directEditMode={projectDirectEditMode}
          onClose={() => {
            setOpenDialog(null);
            setProjectEditingId(null);
            setProjectDirectEditMode(false);
          }}
          onSave={(items) => {
            setProjects(items);
            setProjectEditingId(null);
            setProjectDirectEditMode(false);
          }}
        />

        {openDialog === DialogID.PROJECT_PREVIEW && previewProject ? (
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
                    setOpenDialog(null);
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

              <p className="mb-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-700">
                {previewProject.description || "No description."}
              </p>

              <div>
                <h3 className="mb-2 text-base font-medium text-slate-900">
                  Skill use
                </h3>
                <div className="flex flex-wrap gap-2">
                  {previewProject.skills.length > 0 ? (
                    previewProject.skills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleOpenSkillInfo(skill)}
                        className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                      >
                        {skill}
                      </button>
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
                    setOpenDialog(DialogID.PROJECT);
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

        {openDialog === DialogID.ACHIEVEMENT_PREVIEW && previewAchievement ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {previewAchievement.name || "Reward Name"}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {previewAchievement.from || "Project Name"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {previewAchievement.date || "Date"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDialog(null);
                    setPreviewAchievementId(null);
                  }}
                  className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
                  aria-label="Close achievement preview"
                >
                  <CgClose className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScrollAchievementImages("left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                  aria-label="Previous achievement images"
                >
                  {"<"}
                </button>
                <div
                  ref={achievementImageListRef}
                  className="flex flex-1 gap-3 overflow-x-auto scroll-smooth"
                >
                  {previewAchievement.images.length > 0 ? (
                    previewAchievement.images.map((image, idx) => (
                      <img
                        key={`${image}-${idx}`}
                        src={image}
                        alt={`Achievement image ${idx + 1}`}
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
                  onClick={() => handleScrollAchievementImages("right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
                  aria-label="Next achievement images"
                >
                  {">"}
                </button>
              </div>

              <p className="mb-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-700">
                {previewAchievement.description || "No description."}
              </p>

              <div>
                <h3 className="mb-2 text-base font-medium text-slate-900">
                  Skill use
                </h3>
                <div className="flex flex-wrap gap-2">
                  {previewAchievement.skills.length > 0 ? (
                    previewAchievement.skills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleOpenSkillInfo(skill)}
                        className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                      >
                        {skill}
                      </button>
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
                    setAchievementEditingId(previewAchievement.id);
                    setAchievementDirectEditMode(true);
                    setOpenDialog(DialogID.ACHIEVEMENT);
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

        <SkillinfoDialog
          open={openOverlayDialog === OverlayDialogID.SKILL_INFO}
          onClose={() => setOpenOverlayDialog(null)}
          skillName={selectedSkillName}
        />
      </div>
    </PageLayout>
  );
}
