import { useEffect, useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";
import { RiPencilFill } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddskillDialog from "@/features/profile/dialog/AddskillDialog";
import searchJobService from "@/services/searchJobService";
import type { FilterOptionItem } from "@/types/search-job";
// import SkillinfoDialog from "@/features/profile/dialog/SkillinfoDialog";

export type WorkExperienceItem = {
  id: number;
  backendId?: string;
  logo?: string | null;
  companyId?: string;
  workTypeId?: number;
  skillItems?: { id?: string; name: string }[];
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
  initialData: WorkExperienceItem[];
  onClose: () => void;
  onSave: (items: WorkExperienceItem[]) => void | Promise<void>;
}

const createEmptyWorkExp = (): WorkExperienceItem => ({
  id: Date.now(),
  logo: null,
  companyId: "",
  workTypeId: 0,
  skillItems: [],
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

const clampWorkEndDate = (endDate: string, isFinished: boolean) => {
  if (!endDate) return "";
  if (!isFinished) return endDate;
  return endDate > TODAY_YMD ? TODAY_YMD : endDate;
};

function DatePickerField({
  label,
  value,
  minDate,
  maxDate,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseYmdToDate(value);
  const minDateValue = parseYmdToDate(minDate ?? "");
  const maxDateValue = parseYmdToDate(maxDate ?? "");

  return (
    <div>
      <label className="mb-1 block text-sm text-slate-700">{label}</label>
      <Popover
        open={disabled ? false : open}
        onOpenChange={(nextOpen) => {
          if (disabled) return;
          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-left text-base text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <span className={value ? "text-slate-900" : "text-slate-400"}>
              {value ? formatDate(value) : "Select date"}
            </span>
            <IoIosArrowDown className="h-4 w-4 text-slate-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto border-0 p-0 shadow-none"
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
  initialData,
  onClose,
  onSave,
}: WorkexpDialogProps) {
  const [items, setItems] = useState<WorkExperienceItem[]>(initialData);
  const [editorOpen, setEditorOpen] = useState(false);
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<WorkExperienceItem>(createEmptyWorkExp());
  const [workTypeOptions, setWorkTypeOptions] = useState<FilterOptionItem[]>(
    [],
  );

  useEffect(() => {
    if (!open) return;
    setItems(initialData);
    setEditorOpen(false);
    setEditingId(null);
    setDraft(createEmptyWorkExp());
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadWorkTypes = async () => {
      try {
        const response = await searchJobService.getSearchFilterOptions();
        if (cancelled) return;
        setWorkTypeOptions(response.data.work_type ?? []);
      } catch {
        if (!cancelled) {
          setWorkTypeOptions([]);
        }
      }
    };

    void loadWorkTypes();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const normalizeWorkTypeItem = (item: WorkExperienceItem) => {
    const matchedWorkType = workTypeOptions.find(
      (option) =>
        option.id === item.workTypeId ||
        option.text_eng === item.workType ||
        option.text_th === item.workType,
    );

    if (!matchedWorkType) {
      return item;
    }

    return {
      ...item,
      workTypeId: matchedWorkType.id ?? 0,
      workType: matchedWorkType.text_eng || item.workType,
    };
  };

  const openEditor = (item?: WorkExperienceItem) => {
    if (item) {
      setEditingId(item.id);
      setDraft(normalizeWorkTypeItem(item));
    } else {
      setEditingId(null);
      setDraft(createEmptyWorkExp());
    }
    setEditorOpen(true);
  };

  const handleAddSkill = (nextSkill: string) => {
    if (!nextSkill || draft.skills.includes(nextSkill)) return;
    setDraft((prev) => ({
      ...prev,
      skills: [...prev.skills, nextSkill],
      skillItems: [...(prev.skillItems ?? []), { name: nextSkill }],
    }));
  };

  const handleRemoveSkill = (skill: string) => {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
      skillItems: (prev.skillItems ?? []).filter((item) => item.name !== skill),
    }));
  };

  const handleSaveDraft = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEndDate = clampWorkEndDate(draft.endDate, draft.isFinished);
    const normalized = {
      ...normalizeWorkTypeItem(draft),
      endDate: normalizedEndDate,
      date: buildDateRange(
        draft.startDate,
        normalizedEndDate,
        draft.isFinished,
      ),
    };
    const nextItems = [...items];

    if (editingId === null) {
      nextItems.push(normalized);
    } else {
      const editingIndex = nextItems.findIndex((item) => item.id === editingId);
      if (editingIndex >= 0) {
        nextItems[editingIndex] = normalized;
      }
    }

    try {
      await Promise.resolve(onSave(nextItems));
      setItems(nextItems);
      setEditorOpen(false);
      onClose();
    } catch {
      return;
    }
  };

  const handleDeleteDraft = async () => {
    if (editingId === null) return;
    const nextItems = items.filter((item) => item.id !== editingId);

    try {
      await Promise.resolve(onSave(nextItems));
      setItems(nextItems);
      setEditorOpen(false);
      onClose();
    } catch {
      return;
    }
  };

  const workTypeSelectOptions =
    draft.workType &&
    !workTypeOptions.some(
      (option) =>
        option.id === draft.workTypeId ||
        option.text_eng === draft.workType ||
        option.text_th === draft.workType,
    )
      ? [
          {
            id: draft.workTypeId || -1,
            text_eng: draft.workType,
            text_th: draft.workType,
          },
          ...workTypeOptions,
        ]
      : workTypeOptions;
  const selectedWorkTypeValue =
    draft.workTypeId !== undefined &&
    draft.workTypeId !== null &&
    draft.workTypeId !== 0
      ? String(draft.workTypeId)
      : String(
          workTypeSelectOptions.find(
            (option) =>
              option.text_eng === draft.workType ||
              option.text_th === draft.workType,
          )?.id ?? "",
        );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl">
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
            aria-label="Close work experience dialog"
            className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <div
          className={`space-y-3 ${
            items.length > 3 ? "max-h-[360px] overflow-y-auto pr-2" : ""
          }`}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 p-4"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-2">
                <div>
                  <div className="text-xl font-semibold text-slate-900">
                    {item.position || "Position"}
                  </div>
                  <div className="text-sm text-slate-800">
                    {item.company || "Company"}
                  </div>
                  <div className="text-sm text-slate-700">
                    {item.date || "Start date - End date"}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Edit work experience"
                  onClick={() => openEditor(item)}
                  className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <RiPencilFill className="mx-auto h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openEditor()}
          className="mx-auto mt-3 block rounded-full border border-slate-300 px-5 py-1.5 text-base text-slate-600 hover:bg-slate-50"
        >
          + Add Experience
        </button>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-1.5 text-base text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Work Experience
                </h2>
                <p className="text-sm text-slate-500">
                  Make changes to your Experience here. Click save when you're
                  done.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close work experience form"
                className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
              >
                <CgClose className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Position
                </label>
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
                <label className="mb-1 block text-sm text-slate-700">
                  Company
                </label>
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
                <label className="mb-1 block text-sm text-slate-700">
                  Work Type
                </label>
                <select
                  value={selectedWorkTypeValue}
                  onChange={(e) => {
                    const nextOption = workTypeSelectOptions.find(
                      (option) => String(option.id) === e.target.value,
                    );

                    setDraft((prev) => ({
                      ...prev,
                      workType: nextOption?.text_eng ?? "",
                      workTypeId: nextOption?.id ?? 0,
                    }));
                  }}
                  className={`h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none ${
                    selectedWorkTypeValue ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {workTypeSelectOptions.map((option) => (
                    <option
                      key={`${option.id}-${option.text_eng}`}
                      value={String(option.id)}
                    >
                      {option.text_eng}
                    </option>
                  ))}
                </select>
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
                    className="rounded-full bg-gradient-to-r from-main to-second px-5 py-1.5 text-base font-medium text-white"
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
                  minDate={draft.startDate || undefined}
                  maxDate={draft.isFinished ? TODAY_YMD : undefined}
                  disabled={!draft.isFinished}
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
                      endDate: e.target.checked
                        ? clampWorkEndDate(prev.endDate, true)
                        : "",
                    }))
                  }
                  className="h-5 w-5 rounded border border-slate-300"
                />
                I'm finished this work
              </label>

              <div className="flex justify-between pt-1">
                <button
                  type="button"
                  onClick={() => void handleDeleteDraft()}
                  disabled={editingId === null}
                  className="rounded-full border border-slate-300 px-5 py-1.5 text-base text-slate-500 enabled:hover:bg-slate-50 disabled:opacity-50"
                >
                  Delete
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorOpen(false)}
                    className="rounded-full border border-slate-300 px-5 py-1.5 text-base text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-main to-second px-5 py-1.5 text-base font-medium text-white"
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
