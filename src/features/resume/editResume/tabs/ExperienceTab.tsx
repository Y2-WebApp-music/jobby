import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { type FormInputTabProps, formatMonthYear } from "./formInputTabProps";

export function ExperienceTab({ resume, updateData }: FormInputTabProps) {
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
            onClick={() =>
              updateData("work_experience", [
                ...resume.data.work_experience,
                {
                  position: "",
                  logo: "",
                  company_name: "",
                  start_date: "",
                  end_Date: "",
                  skills: [],
                  work_type: "",
                  work_type_id: 0,
                },
              ])
            }
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
            onClick={() =>
              updateData("projects", [
                ...resume.data.projects,
                {
                  name: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                  skills: [],
                  images: [],
                },
              ])
            }
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
            onClick={() =>
              updateData("achievement", [
                ...resume.data.achievement,
                {
                  name: "",
                  project_name: "",
                  description: "",
                  date: "",
                  skills: [],
                  images: [],
                },
              ])
            }
          >
            <Plus className="size-4" />
            Add Achievement
          </Button>
        </div>
      </section>
    </div>
  );
}
