import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { CgClose } from "react-icons/cg";
import AddskillDialog from "../dialog/AddskillDialog";
import EducateDialog, {
  type EducationItem,
} from "../dialog/EducateDialog";
import { type FormInputTabProps, formatMonthYear } from "./formInputTabProps";
import { HiOutlinePlus } from "react-icons/hi";

const toDateString = (value: Date | string | undefined) => {
  if (typeof value === "string") return value;
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function EducationTab({ resume, updateData }: FormInputTabProps) {
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
  const [educationEditIndex, setEducationEditIndex] = useState<number | null>(
    null,
  );

  const educationDialogData = useMemo<EducationItem[]>(
    () =>
      resume.data.education.map((item, index) => ({
        id: Number(item.id) || index + 1,
        school: item.school_name ?? "",
        degree: item.degree ?? "",
        fieldOfStudy: item.field_of_study ?? "",
        startDate: toDateString(item.start_date),
        endDate: toDateString(item.end_date),
        gpax: item.gpax ? String(item.gpax) : "",
        date: "",
      })),
    [resume.data.education],
  );

  const handleSaveEducation = (items: EducationItem[]) => {
    updateData(
      "education",
      items.map((item) => ({
        id: String(item.id),
        school_name: item.school,
        logo: "",
        degree: item.degree,
        field_of_study: item.fieldOfStudy,
        start_date: item.startDate,
        end_date: item.endDate,
        gpax: Number(item.gpax) || 0,
      })),
    );
  };

  const selectedEducationItem =
    educationEditIndex === null
      ? null
      : (educationDialogData[educationEditIndex] ?? null);

  const upsertEducationItem = (item: EducationItem) => {
    if (educationEditIndex === null) {
      updateData("education", [
        ...resume.data.education,
        {
          id: String(item.id),
          school_name: item.school,
          logo: "",
          degree: item.degree,
          field_of_study: item.fieldOfStudy,
          start_date: item.startDate,
          end_date: item.endDate,
          gpax: Number(item.gpax) || 0,
        },
      ]);
      return;
    }

    handleSaveEducation(
      educationDialogData.map((education, index) =>
        index === educationEditIndex ? item : education,
      ),
    );
  };

  const deleteEducationItem = () => {
    if (educationEditIndex === null) return;
    updateData(
      "education",
      resume.data.education.filter((_, index) => index !== educationEditIndex),
    );
  };

  const openAddEducation = () => {
    setEducationEditIndex(null);
    setIsEducationDialogOpen(true);
  };

  const openEditEducation = (index: number) => {
    setEducationEditIndex(index);
    setIsEducationDialogOpen(true);
  };

  const closeEducationDialog = () => {
    setIsEducationDialogOpen(false);
    setEducationEditIndex(null);
  };

  const handleAddSkill = (skillName: string) => {
    const exists = resume.data.skills.some(
      (skill) => skill.name.toLowerCase() === skillName.toLowerCase(),
    );
    if (exists) return;

    updateData("skills", [
      ...resume.data.skills,
      { id: `${Date.now()}-${skillName}`, name: skillName },
    ]);
  };

  const handleRemoveSkill = (skillName: string) => {
    updateData(
      "skills",
      resume.data.skills.filter((skill) => skill.name !== skillName),
    );
  };

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
              onClick={() => handleRemoveSkill(skill.name)}
            >
              {skill.name}
              <CgClose />
            </Button>
          ))}
          <Button variant="default" onClick={() => setIsAddSkillDialogOpen(true)}>
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
                onClick={() => openEditEducation(index)}
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
            onClick={openAddEducation}
          >
            <Plus className="size-4" />
            Add Education
          </Button>
        </div>
      </section>

      <EducateDialog
        open={isEducationDialogOpen}
        initialItem={selectedEducationItem}
        onClose={closeEducationDialog}
        onSave={upsertEducationItem}
        onDelete={deleteEducationItem}
      />

      <AddskillDialog
        open={isAddSkillDialogOpen}
        onClose={() => setIsAddSkillDialogOpen(false)}
        existingSkills={resume.data.skills.map((skill) => skill.name)}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        showSkillsList
      />
    </div>
  );
}
