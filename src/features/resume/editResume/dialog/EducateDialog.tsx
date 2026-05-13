import { useEffect, useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";
import { IoIosArrowDown } from "react-icons/io";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type EducationItem = {
  id: number;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpax: string;
  date: string;
};

interface EducateDialogProps {
  open: boolean;
  initialItem?: EducationItem | null;
  onClose: () => void;
  onSave: (item: EducationItem) => void;
  onDelete?: () => void;
}

const createEmptyEducation = (): EducationItem => ({
  id: Date.now(),
  school: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  gpax: "",
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

const normalizeGpaxInput = (raw: string) => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");
  const normalized =
    firstDotIndex === -1
      ? cleaned
      : `${cleaned.slice(0, firstDotIndex + 1)}${cleaned
          .slice(firstDotIndex + 1)
          .replace(/\./g, "")}`;

  const hasTrailingDot = normalized.endsWith(".");
  const [intPart = "", decimalPart = ""] = normalized.split(".");
  const cappedDecimal = decimalPart.slice(0, 2);
  const rebuilt =
    cappedDecimal.length > 0
      ? `${intPart}.${cappedDecimal}`
      : hasTrailingDot
        ? `${intPart}.`
        : intPart;
  if (!rebuilt) return "";

  const numeric = Number(
    rebuilt.endsWith(".") ? rebuilt.slice(0, -1) : rebuilt,
  );
  if (Number.isNaN(numeric)) return "";
  if (numeric > 4) return "4.00";
  return rebuilt;
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

export default function EducateDialog({
  open,
  initialItem,
  onClose,
  onSave,
  onDelete,
}: EducateDialogProps) {
  const [draft, setDraft] = useState<EducationItem>(createEmptyEducation());
  const isEditMode = Boolean(initialItem);

  useEffect(() => {
    if (!open) return;
    setDraft(initialItem ?? createEmptyEducation());
  }, [open, initialItem]);

  if (!open) return null;

  const handleSaveDraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized: EducationItem = {
      ...draft,
      date: buildDateRange(draft.startDate, draft.endDate),
    };
    onSave(normalized);
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
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Education
            </DialogTitle>
            <p className="text-sm text-slate-500">
              Make changes to your Education here. Click save when you&apos;re
              done.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close education form"
            className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSaveDraft} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-700">School</label>
            <input
              value={draft.school}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, school: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Degree</label>
            <input
              value={draft.degree}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, degree: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">
              Field of study
            </label>
            <input
              value={draft.fieldOfStudy}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  fieldOfStudy: e.target.value,
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
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
              label="End date (or expected)"
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
          <div className="max-w-[240px]">
            <label className="mb-1 block text-sm text-slate-700">GPAX</label>
            <input
              value={draft.gpax}
              inputMode="decimal"
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  gpax: normalizeGpaxInput(e.target.value),
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-base outline-none"
            />
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
      </DialogContent>
    </Dialog>
  );
}
