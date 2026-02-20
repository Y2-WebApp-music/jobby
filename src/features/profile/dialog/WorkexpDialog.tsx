import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CgClose } from "react-icons/cg";
import { RiPencilFill } from "react-icons/ri";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    initialData: WorkExperienceItem[];
    onClose: () => void;
    onSave: (items: WorkExperienceItem[]) => void;
}

const WORK_TYPE_OPTIONS = ["Full-time", "Part-time", "Internship", "Contract"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAST_YEAR_RANGE = 40;
const MAX_FUTURE_YEAR_OFFSET = 5;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - PAST_YEAR_RANGE;
const MAX_YEAR = CURRENT_YEAR + MAX_FUTURE_YEAR_OFFSET;

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

const buildDateRange = (startDate: string, endDate: string, isFinished: boolean) => {
    const start = formatDate(startDate);
    const end = isFinished ? formatDate(endDate) : "Present";
    if (!start && !endDate) return "";
    return `${start || "-"} - ${end}`;
};

const normalizeSkillInput = (raw: string) => raw.trim().replace(/\s+/g, " ");

const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

function CalendarPopup({
    value,
    minDate,
    maxDate,
    onChange,
}: {
    value: string;
    minDate?: string;
    maxDate?: string;
    onChange: (nextValue: string) => void;
}) {
    const today = new Date();
    const selectedDate = parseYmdToDate(value);
    const minDateValue = parseYmdToDate(minDate ?? "");
    const maxDateValue = parseYmdToDate(maxDate ?? "");
    const [viewDate, setViewDate] = useState(selectedDate ?? today);
    const [openMonth, setOpenMonth] = useState(false);
    const [openYear, setOpenYear] = useState(false);

    useEffect(() => {
        setViewDate(selectedDate ?? today);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const minVisibleYear = Math.max(MIN_YEAR, year - 10);
    const maxVisibleYear = Math.min(MAX_YEAR, year + 10);
    const yearRange = Array.from(
        { length: maxVisibleYear - minVisibleYear + 1 },
        (_, i) => minVisibleYear + i
    );

    const goPrev = () => setViewDate(new Date(year, month - 1, 1));
    const goNext = () => setViewDate(new Date(year, month + 1, 1));

    const selectMonth = (nextMonth: number) => {
        setViewDate(new Date(year, nextMonth, 1));
        setOpenMonth(false);
    };

    const selectYear = (nextYear: number) => {
        setViewDate(new Date(nextYear, month, 1));
        setOpenYear(false);
    };

    const cells: ReactNode[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push(
            <div
                key={`prev-${i}`}
                className="flex h-10 w-10 items-center justify-center text-sm text-[#9a9a9a]"
            >
                {prevMonthDays - i}
            </div>
        );
    }

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
        const isToday = isSameDay(date, today);
        const isBeforeMin = minDateValue ? date < minDateValue : false;
        const isAfterMax = maxDateValue ? date > maxDateValue : false;
        const isDisabled = isBeforeMin || isAfterMax;

        cells.push(
            <button
                key={`curr-${day}`}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                    if (isDisabled) return;
                    onChange(formatDateToYmd(date));
                    setOpenMonth(false);
                    setOpenYear(false);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-normal transition-colors ${
                    isSelected
                        ? "bg-gradient-to-r from-[#FF8E00] to-[#F335EC] text-white"
                        : isDisabled
                        ? "cursor-not-allowed text-[#c9c9c9]"
                        : isToday
                        ? "bg-[#d8d8db] text-black"
                        : "text-black hover:bg-[#e7e7e7]"
                }`}
            >
                {day}
            </button>
        );
    }

    const nextFill = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
    for (let i = 1; i <= nextFill; i++) {
        cells.push(
            <div
                key={`next-${i}`}
                className="flex h-10 w-10 items-center justify-center text-sm text-[#9a9a9a]"
            >
                {i}
            </div>
        );
    }

    return (
        <div className="w-[390px] rounded-[28px] border-2 border-[#d3d3d3] bg-[#f3f3f3] p-3">
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={goPrev}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e7e7e7] text-black hover:bg-[#dedede]"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setOpenMonth((prev) => !prev);
                                setOpenYear(false);
                            }}
                            className="inline-flex h-9 min-w-[98px] items-center justify-center gap-1 rounded-xl border-2 border-[#d3d3d3] bg-[#f3f3f3] px-2 text-sm font-medium"
                        >
                            <span>{MONTH_OPTIONS[month]}</span>
                            <IoIosArrowDown className="h-3.5 w-3.5" />
                        </button>
                        {openMonth ? (
                            <div className="absolute left-0 z-20 mt-1 grid w-36 grid-cols-3 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                {MONTH_OPTIONS.map((monthName, idx) => (
                                    <button
                                        key={monthName}
                                        type="button"
                                        onClick={() => selectMonth(idx)}
                                        className="rounded px-1 py-1 text-xs hover:bg-slate-100"
                                    >
                                        {monthName}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setOpenYear((prev) => !prev);
                                setOpenMonth(false);
                            }}
                            className="inline-flex h-9 min-w-[98px] items-center justify-center gap-1 rounded-xl border-2 border-[#d3d3d3] bg-[#f3f3f3] px-2 text-sm font-medium"
                        >
                            <span>{year}</span>
                            <IoIosArrowDown className="h-3.5 w-3.5" />
                        </button>
                        {openYear ? (
                            <div className="absolute left-0 z-20 mt-1 max-h-40 w-24 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                {yearRange.map((y) => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => selectYear(y)}
                                        className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={goNext}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e7e7e7] text-black hover:bg-[#dedede]"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="mb-0.5 mt-0.5 grid grid-cols-7">
                {DAYS.map((day) => (
                    <div key={day} className="text-center text-xs font-normal text-[#9a9a9a]">
                        {day}
                    </div>
                ))}
            </div>

            <div className="mt-1.5 grid grid-cols-7 gap-y-1">{cells}</div>
        </div>
    );
}

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
    return (
        <div>
            <label className="mb-1 block text-sm text-slate-700">{label}</label>
            <Popover>
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
                    className="w-auto border-0 bg-transparent p-0 shadow-none"
                >
                    <CalendarPopup
                        value={value}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={onChange}
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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState<WorkExperienceItem>(createEmptyWorkExp());
    const [skillInput, setSkillInput] = useState("");

    if (!open) return null;

    const openEditor = (item?: WorkExperienceItem) => {
        if (item) {
            setEditingId(item.id);
            setDraft(item);
        } else {
            setEditingId(null);
            setDraft(createEmptyWorkExp());
        }
        setSkillInput("");
        setEditorOpen(true);
    };

    const handleAddSkill = () => {
        const nextSkill = normalizeSkillInput(skillInput);
        if (!nextSkill) return;
        if (draft.skills.includes(nextSkill)) {
            setSkillInput("");
            return;
        }
        setDraft((prev) => ({ ...prev, skills: [...prev.skills, nextSkill] }));
        setSkillInput("");
    };

    const handleRemoveSkill = (skill: string) => {
        setDraft((prev) => ({
            ...prev,
            skills: prev.skills.filter((item) => item !== skill),
        }));
    };

    const handleSaveDraft = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const normalized = {
            ...draft,
            date: buildDateRange(draft.startDate, draft.endDate, draft.isFinished),
        };

        if (editingId === null) {
            setItems((prev) => [...prev, normalized]);
        } else {
            setItems((prev) => prev.map((item) => (item.id === editingId ? normalized : item)));
        }
        setEditorOpen(false);
    };

    const handleDeleteDraft = () => {
        if (editingId === null) return;
        setItems((prev) => prev.filter((item) => item.id !== editingId));
        setEditorOpen(false);
    };

    const handleSaveAll = () => {
        onSave(items);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Work Experience</h2>
                        <p className="text-sm text-slate-500">
                            Make changes to your Experience here. Click save when you&apos;re done.
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

                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 p-4">
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
                    <button
                        type="button"
                        onClick={handleSaveAll}
                        className="rounded-full bg-gradient-to-r from-[#FF8E00] to-[#F335EC] px-5 py-1.5 text-base font-medium text-white"
                    >
                        Save Change
                    </button>
                </div>
            </div>

            {editorOpen ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-xl">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900">Work Experience</h2>
                                <p className="text-sm text-slate-500">
                                    Make changes to your Experience here. Click save when you&apos;re done.
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
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="inline-flex items-center gap-1 rounded-full border border-[#F335EC] px-3 py-1 text-xs text-[#F335EC]"
                                        >
                                            <span className="text-sm">{skill}</span>
                                            <span className="text-base leading-none">x</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="rounded-full bg-gradient-to-r from-[#FF8E00] to-[#F335EC] px-5 py-1.5 text-base font-medium text-white"
                                    >
                                        + Add Skill
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DatePickerField
                                    label="Start date"
                                    value={draft.startDate}
                                    maxDate={draft.endDate}
                                    onChange={(nextValue) =>
                                        setDraft((prev) => ({ ...prev, startDate: nextValue }))
                                    }
                                />
                                <DatePickerField
                                    label="End date"
                                    value={draft.endDate}
                                    minDate={draft.startDate}
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
                                        setDraft((prev) => ({ ...prev, isFinished: e.target.checked }))
                                    }
                                    className="h-5 w-5 rounded border border-slate-300"
                                />
                                I'm finished this work
                            </label>

                            <div className="flex justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={handleDeleteDraft}
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
                                    <button
                                        type="submit"
                                        className="rounded-full bg-gradient-to-r from-[#FF8E00] to-[#F335EC] px-5 py-1.5 text-base font-medium text-white"
                                    >
                                        Save Change
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
