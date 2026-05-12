import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { CgClose } from "react-icons/cg";
import { type FormInputTabProps, formatMonthYear } from "./formInputTabProps";
import { HiOutlinePlus } from "react-icons/hi";

export function EducationTab({ resume, updateData }: FormInputTabProps) {
  return (
    <div className="space-y-6">
      <section>
        <div className="text-base font-medium">Skills</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {resume.data.skills.map((skill) => (
            <Button
              key={skill.id}
              type="button"
              variant="outline_gradient"
              size="sm"
            >
              {skill.name}
              <CgClose />
            </Button>
          ))}
          <Button variant="default">
            <HiOutlinePlus className="size-4" />
            Add Skill
          </Button>
        </div>
      </section>

      {/* Education: cards list + Add Education at bottom */}
      <section>
        <div className="text-base font-medium">Education</div>
        <div className="mt-3 space-y-3">
          {resume.data.education.map((edu, index) => (
            <div
              key={`education-${index}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-medium text-neutral-900">
                  {edu.school_name || "School Name"}
                </div>
                <div className="text-sm text-neutral-600">
                  {[edu.degree, edu.field_of_study]
                    .filter(Boolean)
                    .join(", ") || "Associate's degree, Computer Science"}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatMonthYear(edu.start_date)} -{" "}
                  {formatMonthYear(edu.end_date) || "—"}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit education"
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
              updateData("education", [
                ...resume.data.education,
                {
                  school_name: "",
                  logo: "",
                  degree: "",
                  field_of_study: "",
                  start_date: "",
                  end_date: "",
                  gpax: 0,
                },
              ])
            }
          >
            <Plus className="size-4" />
            Add Education
          </Button>
        </div>
      </section>
    </div>
  );
}
