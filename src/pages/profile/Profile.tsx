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
import UserskillDialog from "../../features/profile/dialog/UserskillDialog";
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

function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900 break-words">{title}</h3>
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
        <div className="text-sm font-semibold text-slate-900 break-words">{title}</div>
        <div className={`text-xs text-slate-600 break-words ${subtitleClassName}`}>{subtitle}</div>
        <div className="text-xs text-slate-500 break-words">{meta}</div>
      </div>
    </button>
  );
}

function SkillApplicationSection({
  skills,
  onNewSkill,
  onShowMore,
}: {
  skills: string[];
  onNewSkill: () => void;
  onShowMore: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 break-words">Your Skill</h3>
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
            <span
              key={skill}
              className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
            >
              {skill}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onShowMore}
          className="mt-3 block mx-auto text-xs text-main"
        >
          Show more
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900 break-words">Your Application</h3>
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
                <div className="text-xs text-slate-500 break-words">{app.note}</div>
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [addProfileSkillDialogOpen, setAddProfileSkillDialogOpen] =
    useState(false);
  const [userskillDialogOpen, setUserskillDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [workexpDialogOpen, setWorkexpDialogOpen] = useState(false);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [achievementEditingId, setAchievementEditingId] = useState<
    number | null
  >(null);
  const [achievementPreviewOpen, setAchievementPreviewOpen] = useState(false);
  const [previewAchievementId, setPreviewAchievementId] = useState<
    number | null
  >(null);
  const [achievementDirectEditMode, setAchievementDirectEditMode] =
    useState(false);
  const [projectEditingId, setProjectEditingId] = useState<number | null>(null);
  const [projectPreviewOpen, setProjectPreviewOpen] = useState(false);
  const [previewProjectId, setPreviewProjectId] = useState<number | null>(null);
  const [projectDirectEditMode, setProjectDirectEditMode] = useState(false);
  const [aboutText, setAboutText] = useState(defaultAboutText);
  const [education, setEducation] =
    useState<EducationItem[]>(defaultEducation);
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


  // เปลี่ยนเอาออก

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
  const handleOpenAchievementPreview = (achievementId: number) => {
    setPreviewAchievementId(achievementId);
    setAchievementPreviewOpen(true);
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
    setUserSkills((prev) =>
      prev.includes(skill) ? prev : [...prev, skill],
    );
  };


  const handleRemoveProfileSkill = (skill: string) => {
    setUserSkills((prev) => prev.filter((item) => item !== skill));
  };

  return (
  <PageLayout>
    <div className="min-h-screen">

      <div className="relative mt-18 mx-4 sm:mx-6 w-auto overflow-hidden rounded-[20px] bg-slate-100 aspect-[1411/275]">
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
                onEdit={() => setAboutDialogOpen(true)}
              />
              <p className="mt-3 whitespace-pre-line break-all text-sm leading-relaxed text-slate-600">
                {aboutText || "No about information yet."}
              </p>
            </div>

            <div className="lg:hidden">
              <SkillApplicationSection
                skills={userSkills}
                onNewSkill={() => setAddProfileSkillDialogOpen(true)}
                onShowMore={() => setUserskillDialogOpen(true)}
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <SectionHeader
                title="Education"
                onEdit={() => setEducationDialogOpen(true)}
              />
              <div
                className={`mt-3 space-y-3 ${
                  education.length > 3 ? "max-h-[300px] overflow-y-auto pr-2" : ""
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
                onEdit={() => setWorkexpDialogOpen(true)}
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
                  setProjectDialogOpen(true);
                }}
              />
              <div
                className={`mt-3 space-y-3 ${
                  projects.length > 3 ? "max-h-[300px] overflow-y-auto pr-2" : ""
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
                  setAchievementDialogOpen(true);
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
                onNewSkill={() => setAddProfileSkillDialogOpen(true)}
                onShowMore={() => setUserskillDialogOpen(true)}
              />
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

      <AddskillDialog
        open={addProfileSkillDialogOpen}
        onClose={() => setAddProfileSkillDialogOpen(false)}
        existingSkills={userSkills}
        onAddSkill={handleAddProfileSkill}
        onRemoveSkill={handleRemoveProfileSkill}
        showSkillsList
      />

      <UserskillDialog
        open={userskillDialogOpen}
        skills={userSkills}
        onClose={() => setUserskillDialogOpen(false)}
        onNewSkill={() => {
          setUserskillDialogOpen(false);
          setAddProfileSkillDialogOpen(true);
        }}
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

      <AchievementDialog
        key={achievementDialogOpen ? "open" : "closed"}
        open={achievementDialogOpen}
        initialData={achievements}
        initialEditingId={achievementEditingId}
        directEditMode={achievementDirectEditMode}
        onClose={() => {
          setAchievementDialogOpen(false);
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
                    <span
                      key={skill}
                      className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
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

      {achievementPreviewOpen && previewAchievement ? (
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
                  setAchievementPreviewOpen(false);
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
                    <span
                      key={skill}
                      className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
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
                  setAchievementEditingId(previewAchievement.id);
                  setAchievementDirectEditMode(true);
                  setAchievementPreviewOpen(false);
                  setAchievementDialogOpen(true);
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
  </PageLayout>  
  );
}






















