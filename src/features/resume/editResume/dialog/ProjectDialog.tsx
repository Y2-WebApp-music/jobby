import { useEffect, useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";
import { RiDeleteBin5Line } from "react-icons/ri";
import { ImageIcon } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddskillDialog from "@/features/resume/editResume/dialog/AddskillDialog";

export type ProjectItem = {
  id: number;
  name: string;
  description: string;
  skills: string[];
  startDate: string;
  endDate: string;
  images: string[];
  date: string;
};

interface ProjectDialogProps {
  open: boolean;
  initialItem?: ProjectItem | null;
  onClose: () => void;
  onSave: (item: ProjectItem) => void;
  onDelete?: () => void;
}

const MAX_PROJECT_IMAGES = 5;

const createEmptyProject = (): ProjectItem => ({
  id: Date.now(),
  name: "",
  description: "",
  skills: [],
  startDate: "",
  endDate: "",
  images: [],
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

const buildDateRange = (startDate: string, endDate: string) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  if (!start && !end) return "";
  return `${start || "-"} - ${end || "Present"}`;
};

const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

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

export default function ProjectDialog({
  open,
  initialItem,
  onClose,
  onSave,
  onDelete,
}: ProjectDialogProps) {
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectItem>(createEmptyProject());
  const isEditMode = Boolean(initialItem);

  useEffect(() => {
    if (!open) return;
    setDraft(initialItem ?? createEmptyProject());
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

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const left = MAX_PROJECT_IMAGES - draft.images.length;
    if (left <= 0) return;
    const selected = Array.from(files)
      .slice(0, left)
      .map((file) => URL.createObjectURL(file));
    setDraft((prev) => ({ ...prev, images: [...prev.images, ...selected] }));
  };

  const handleRemoveImage = (index: number) => {
    setDraft((prev) => {
      const target = prev.images[index];
      if (target?.startsWith("blob:")) {
        URL.revokeObjectURL(target);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  };

  const handleSaveDraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      ...draft,
      date: buildDateRange(draft.startDate, draft.endDate),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="min-w-[40vw] w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Project
            </DialogTitle>
            <p className="text-sm text-slate-500">
              Make changes to your Experience here. Click save when you're done.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project form"
            className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSaveDraft} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Project Name
            </label>
            <input
              value={draft.name}
              placeholder="Project Name"
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, name: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Description
            </label>
            <textarea
              value={draft.description}
              placeholder="Type your message here"
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  description: normalizeNewlines(e.target.value),
                }))
              }
              className="h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-base outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Skill use
            </label>
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

          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Upload Image (Up to {MAX_PROJECT_IMAGES})
            </label>
            <input
              id="project-image-upload"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-wrap justify-center gap-3">
              {draft.images.map((image, idx) => (
                <div
                  key={`${image}-${idx}`}
                  className="group relative h-[280px] w-[240px] overflow-hidden rounded-xl"
                >
                  <img
                    src={image}
                    alt={`Project preview ${idx + 1}`}
                    className="h-[280px] w-[240px] rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label={`Delete image ${idx + 1}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition hover:bg-black/30 group-hover:opacity-100"
                  >
                    <RiDeleteBin5Line className="h-8 w-8" />
                  </button>
                </div>
              ))}
              {draft.images.length < MAX_PROJECT_IMAGES ? (
                <label
                  htmlFor="project-image-upload"
                  className="flex h-[280px] w-[240px] cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-center text-slate-500 transition hover:bg-slate-200"
                >
                  <ImageIcon className="mb-2 h-9 w-9 text-slate-400" />
                  <span className="text-base font-medium text-slate-600">
                    Upload Image
                  </span>
                  <span className="text-xs text-slate-400">(jpg, png)</span>
                </label>
              ) : null}
            </div>
          </div>

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
