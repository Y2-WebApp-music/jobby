import { useEffect, useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";
import { IoIosArrowDown } from "react-icons/io";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddskillDialog from "@/features/profile/dialog/AddskillDialog";

export type WorkExperienceItem = {
  id: number;
  position: string;
  company: string;
  workType: string;
  skills: string[];
  startDate: string;
  endDate: string;
  isFinished: boolean;
  date: string;
};

interface WorkexpDialogProps {
  open: boolean;
  initialItem?: WorkExperienceItem | null;
  onClose: () => void;
  onSave: (item: WorkExperienceItem) => void;
  onDelete?: () => void;
}

const WORK_TYPE_OPTIONS = ["Full-time", "Part-time", "Internship", "Contract"];

const createEmptyWorkExp = (): WorkExperienceItem => ({
  id: Date.now(),
  position: "",
  company: "",
  workType: "",
  skills: [],
  startDate: "",
  endDate: "",
  isFinished: false,
  date: "",
});

const parseYmdToDate = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const formatDateToYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const TODAY_YMD = formatDateToYmd(new Date());

const formatDate = (value: string) => {
  if (!value) return "";
  const date = parseYmdToDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildDateRange = (
  startDate: string,
  endDate: string,
  isFinished: boolean,
) => {
  const start = formatDate(startDate);
  const end = isFinished ? formatDate(endDate) : "Present";
  if (!start && !endDate) return "";
  return `${start || "-"} - ${end}`;
};

function DatePickerField({
  label,
  value,
  minDate,
  maxDate,
  onChange,
}: {
  label: string;
  value: string;
  minDate?: string;
  maxDate?: string;
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseYmdToDate(value);
  const minDateValue = parseYmdToDate(minDate ?? "");
  const maxDateValue = parseYmdToDate(maxDate ?? "");

  return (
    <div>
      <label className="mb-1 block text-sm text-slate-700">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-left text-base text-slate-900"
          >
            <span className={value ? "text-slate-900" : "text-slate-400"}>
              {value ? formatDate(value) : "Select date"}
            </span>
            <IoIosArrowDown className="h-4 w-4 text-slate-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-80 w-auto border-0 p-0 shadow-none"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onChange(formatDateToYmd(date));
              setOpen(false);
            }}
            disabled={[
              ...(minDateValue ? [{ before: minDateValue }] : []),
              ...(maxDateValue ? [{ after: maxDateValue }] : []),
            ]}
            captionLayout="dropdown"
            className="rounded-[28px] border-2 border-c-d3d3d3 bg-c-f3f3f3 p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function WorkexpDialog({
  open,
  initialItem,
  onClose,
  onSave,
  onDelete,
}: WorkexpDialogProps) {
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [draft, setDraft] = useState<WorkExperienceItem>(createEmptyWorkExp());
  const isEditMode = Boolean(initialItem);

  useEffect(() => {
    if (!open) return;
    setDraft(initialItem ?? createEmptyWorkExp());
  }, [open, initialItem]);

  if (!open) return null;

  const handleAddSkill = (nextSkill: string) => {
    if (!nextSkill || draft.skills.includes(nextSkill)) return;
    setDraft((prev) => ({ ...prev, skills: [...prev.skills, nextSkill] }));
  };

  const handleRemoveSkill = (skill: string) => {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const handleSaveDraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      ...draft,
      date: buildDateRange(draft.startDate, draft.endDate, draft.isFinished),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="min-w-[40vw] w-full max-w-3xl rounded-3xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Work Experience
            </h2>
            <p className="text-sm text-slate-500">
              Make changes to your Experience here. Click save when you're done.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close work experience form"
            className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSaveDraft} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Position</label>
            <input
              value={draft.position}
              placeholder="placeholder"
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, position: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Company</label>
            <input
              value={draft.company}
              placeholder="placeholder"
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, company: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
          </div>
          <div className="max-w-[260px]">
            <label className="mb-1 block text-sm text-slate-700">Work Type</label>
            <select
              value={draft.workType}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, workType: e.target.value }))
              }
              className={`h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none ${
                draft.workType ? "text-slate-900" : "text-slate-400"
              }`}
            >
              <option value="" disabled>
                Select
              </option>
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Skill use</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {draft.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                >
                  <span className="text-sm">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-base leading-none"
                    aria-label={`Remove ${skill}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAddSkillDialogOpen(true)}
                className="rounded-full bg-linear-to-r from-main to-second px-5 py-1.5 text-base font-medium text-white"
              >
                + Add Skill
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DatePickerField
              label="Start date"
              value={draft.startDate}
              maxDate={
                draft.endDate && draft.endDate < TODAY_YMD
                  ? draft.endDate
                  : TODAY_YMD
              }
              onChange={(nextValue) =>
                setDraft((prev) => ({ ...prev, startDate: nextValue }))
              }
            />
            <DatePickerField
              label="End date"
              value={draft.endDate}
              minDate={
                draft.startDate && draft.startDate > TODAY_YMD
                  ? draft.startDate
                  : TODAY_YMD
              }
              onChange={(nextValue) =>
                setDraft((prev) => ({ ...prev, endDate: nextValue }))
              }
            />
          </div>

          <label className="mt-1 inline-flex items-center gap-2 text-base text-slate-800">
            <input
              type="checkbox"
              checked={draft.isFinished}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  isFinished: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded border border-slate-300"
            />
            I'm finished this work
          </label>

          <div className="flex justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                if (!isEditMode || !onDelete) return;
                onDelete();
                onClose();
              }}
              disabled={!isEditMode}
              className="rounded-full border border-slate-300 px-5 py-1.5 text-base text-slate-500 enabled:hover:bg-slate-50 disabled:opacity-50"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 px-5 py-1.5 text-base text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <Button
                type="submit"
                className="rounded-full bg-linear-to-r from-main to-second px-5 py-1.5 text-base font-medium text-white"
              >
                Save Change
              </Button>
            </div>
          </div>
        </form>

        <AddskillDialog
          open={addSkillDialogOpen}
          onClose={() => setAddSkillDialogOpen(false)}
          existingSkills={draft.skills}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
        />
      </DialogContent>
    </Dialog>
  );
}
