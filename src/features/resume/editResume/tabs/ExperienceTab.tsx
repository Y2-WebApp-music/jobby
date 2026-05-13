import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import AchievementDialog, {
  type AchievementItem,
} from "../dialog/AchievementDialog";
import ProjectDialog, { type ProjectItem } from "../dialog/ProjectDialog";
import WorkexpDialog, {
  type WorkExperienceItem,
} from "../dialog/WorkexpDialog";
import { type FormInputTabProps, formatMonthYear } from "./formInputTabProps";

const toDateString = (value: Date | string | undefined) => {
  if (typeof value === "string") return value;
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function ExperienceTab({ resume, updateData }: FormInputTabProps) {
  const [isWorkexpDialogOpen, setIsWorkexpDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [workexpEditIndex, setWorkexpEditIndex] = useState<number | null>(null);
  const [projectEditIndex, setProjectEditIndex] = useState<number | null>(null);
  const [achievementEditIndex, setAchievementEditIndex] = useState<number | null>(
    null,
  );

  const workexpDialogData = useMemo<WorkExperienceItem[]>(
    () =>
      resume.data.work_experience.map((item, index) => ({
        id: Number(item.id) || index + 1,
        position: item.position ?? "",
        company: item.company_name ?? "",
        workType: item.work_type ?? "",
        skills: item.skills.map((skill) => skill.name),
        startDate: toDateString(item.start_date),
        endDate: toDateString(item.end_Date),
        isFinished: Boolean(item.end_Date),
        date: "",
      })),
    [resume.data.work_experience],
  );

  const projectDialogData = useMemo<ProjectItem[]>(
    () =>
      resume.data.projects.map((item, index) => ({
        id: Number(item.id) || index + 1,
        name: item.name ?? "",
        description: item.description ?? "",
        skills: item.skills.map((skill) => skill.name),
        startDate: toDateString(item.start_date),
        endDate: toDateString(item.end_date),
        images: item.images
          .map((imageItem) =>
            typeof imageItem.image === "string" ? imageItem.image : "",
          )
          .filter(Boolean),
        date: "",
      })),
    [resume.data.projects],
  );

  const achievementDialogData = useMemo<AchievementItem[]>(
    () =>
      resume.data.achievement.map((item, index) => ({
        id: Number(item.id) || index + 1,
        name: item.name ?? "",
        from: item.project_name ?? "",
        description: item.description ?? "",
        skills: item.skills.map((skill) => skill.name),
        images: item.images
          .map((imageItem) =>
            typeof imageItem.image === "string" ? imageItem.image : "",
          )
          .filter(Boolean),
        date: toDateString(item.date),
      })),
    [resume.data.achievement],
  );

  const handleSaveWorkExperience = (items: WorkExperienceItem[]) => {
    updateData(
      "work_experience",
      items.map((item) => ({
        id: String(item.id),
        position: item.position,
        logo: "",
        company_name: item.company,
        start_date: item.startDate,
        end_Date: item.isFinished ? item.endDate : "",
        skills: item.skills.map((skill, index) => ({
          id: `${item.id}-${index}`,
          name: skill,
        })),
        work_type: item.workType,
        work_type_id: 0,
      })),
    );
  };

  const handleSaveProject = (items: ProjectItem[]) => {
    updateData(
      "projects",
      items.map((item) => ({
        id: String(item.id),
        name: item.name,
        description: item.description,
        start_date: item.startDate,
        end_date: item.endDate,
        skills: item.skills.map((skill, index) => ({
          id: `${item.id}-${index}`,
          name: skill,
        })),
        images: item.images.map((image, index) => ({
          index,
          image,
        })),
      })),
    );
  };

  const handleSaveAchievement = (items: AchievementItem[]) => {
    updateData(
      "achievement",
      items.map((item) => ({
        id: String(item.id),
        name: item.name,
        project_name: item.from,
        description: item.description,
        date: item.date,
        skills: item.skills.map((skill, index) => ({
          id: `${item.id}-${index}`,
          name: skill,
        })),
        images: item.images.map((image, index) => ({
          index,
          image,
        })),
      })),
    );
  };

  const selectedWorkexpItem =
    workexpEditIndex === null ? null : (workexpDialogData[workexpEditIndex] ?? null);
  const selectedProjectItem =
    projectEditIndex === null ? null : (projectDialogData[projectEditIndex] ?? null);
  const selectedAchievementItem =
    achievementEditIndex === null
      ? null
      : (achievementDialogData[achievementEditIndex] ?? null);

  const upsertWorkExperienceItem = (item: WorkExperienceItem) => {
    if (workexpEditIndex === null) {
      handleSaveWorkExperience([...workexpDialogData, item]);
      return;
    }
    handleSaveWorkExperience(
      workexpDialogData.map((existing, index) =>
        index === workexpEditIndex ? item : existing,
      ),
    );
  };

  const upsertProjectItem = (item: ProjectItem) => {
    if (projectEditIndex === null) {
      handleSaveProject([...projectDialogData, item]);
      return;
    }
    handleSaveProject(
      projectDialogData.map((existing, index) =>
        index === projectEditIndex ? item : existing,
      ),
    );
  };

  const upsertAchievementItem = (item: AchievementItem) => {
    if (achievementEditIndex === null) {
      handleSaveAchievement([...achievementDialogData, item]);
      return;
    }
    handleSaveAchievement(
      achievementDialogData.map((existing, index) =>
        index === achievementEditIndex ? item : existing,
      ),
    );
  };

  const deleteWorkExperienceItem = () => {
    if (workexpEditIndex === null) return;
    handleSaveWorkExperience(
      workexpDialogData.filter((_, index) => index !== workexpEditIndex),
    );
  };

  const deleteProjectItem = () => {
    if (projectEditIndex === null) return;
    handleSaveProject(projectDialogData.filter((_, index) => index !== projectEditIndex));
  };

  const deleteAchievementItem = () => {
    if (achievementEditIndex === null) return;
    handleSaveAchievement(
      achievementDialogData.filter((_, index) => index !== achievementEditIndex),
    );
  };

  const openAddWorkExperience = () => {
    setWorkexpEditIndex(null);
    setIsWorkexpDialogOpen(true);
  };

  const openAddProject = () => {
    setProjectEditIndex(null);
    setIsProjectDialogOpen(true);
  };

  const openAddAchievement = () => {
    setAchievementEditIndex(null);
    setIsAchievementDialogOpen(true);
  };

  const closeWorkExperienceDialog = () => {
    setIsWorkexpDialogOpen(false);
    setWorkexpEditIndex(null);
  };

  const closeProjectDialog = () => {
    setIsProjectDialogOpen(false);
    setProjectEditIndex(null);
  };

  const closeAchievementDialog = () => {
    setIsAchievementDialogOpen(false);
    setAchievementEditIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Work Experience: card list + Add at bottom */}
      <section>
        <div className="text-base font-medium">Work Experience</div>
        <div className="mt-3 space-y-3">
          {resume.data.work_experience.map((exp, index) => (
            <div
              key={`experience-${index}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-medium text-neutral-900">
                  {exp.position || "Position At Work"}
                </div>
                <div className="text-sm text-neutral-600">
                  {exp.company_name || "Company"}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatMonthYear(exp.start_date)} -{" "}
                  {formatMonthYear(exp.end_Date) || "—"}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit experience"
                className="shrink-0 rounded-full text-neutral-700"
                onClick={() => {
                  setWorkexpEditIndex(index);
                  setIsWorkexpDialogOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-neutral-200"
            onClick={openAddWorkExperience}
          >
            <Plus className="size-4" />
            Add Experience
          </Button>
        </div>
      </section>

      {/* Project: card list + Add at bottom */}
      <section>
        <div className="text-base font-medium">Project</div>
        <div className="mt-3 space-y-3">
          {resume.data.projects.map((project, index) => (
            <div
              key={`project-${index}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-medium text-neutral-900">
                  {project.name || "Project Name"}
                </div>
                <div className="text-sm text-neutral-600 line-clamp-2">
                  {project.description || "Description"}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatMonthYear(project.start_date)} -{" "}
                  {formatMonthYear(project.end_date) || "—"}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit project"
                className="shrink-0 rounded-full text-neutral-700"
                onClick={() => {
                  setProjectEditIndex(index);
                  setIsProjectDialogOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-neutral-200"
            onClick={openAddProject}
          >
            <Plus className="size-4" />
            Add Project
          </Button>
        </div>
      </section>

      {/* Achievement: card list + Add at bottom */}
      <section>
        <div className="text-base font-medium">Achievement</div>
        <div className="mt-3 space-y-3">
          {resume.data.achievement.map((item, index) => (
            <div
              key={`achievement-${index}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-medium text-neutral-900">
                  {item.name || "Achievement Name"}
                </div>
                <div className="text-sm text-neutral-600">
                  {item.project_name || "project name"}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatMonthYear(item.date) || "—"}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit achievement"
                className="shrink-0 rounded-full text-neutral-700"
                onClick={() => {
                  setAchievementEditIndex(index);
                  setIsAchievementDialogOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-neutral-200"
            onClick={openAddAchievement}
          >
            <Plus className="size-4" />
            Add Achievement
          </Button>
        </div>
      </section>

      <WorkexpDialog
        open={isWorkexpDialogOpen}
        initialItem={selectedWorkexpItem}
        onClose={closeWorkExperienceDialog}
        onSave={upsertWorkExperienceItem}
        onDelete={deleteWorkExperienceItem}
      />

      <ProjectDialog
        open={isProjectDialogOpen}
        initialItem={selectedProjectItem}
        onClose={closeProjectDialog}
        onSave={upsertProjectItem}
        onDelete={deleteProjectItem}
      />

      <AchievementDialog
        open={isAchievementDialogOpen}
        initialItem={selectedAchievementItem}
        onClose={closeAchievementDialog}
        onSave={upsertAchievementItem}
        onDelete={deleteAchievementItem}
      />
    </div>
  );
}
