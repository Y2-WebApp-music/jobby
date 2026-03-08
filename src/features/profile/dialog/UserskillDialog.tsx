import { CgClose } from "react-icons/cg";
import { Button } from "@/components/ui/button";

interface UserskillDialogProps {
    open: boolean;
    skills: string[];
    onClose: () => void;
    onNewSkill: () => void;
}

export default function UserskillDialog({
    open,
    skills,
    onClose,
    onNewSkill,
}: UserskillDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-[760px] rounded-2xl bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-3 flex items-start justify-between">
            <div>
                <h2 className="text-[30px] leading-none font-semibold text-slate-900">
                Your Skill
                </h2>
                <p className="mt-1 text-sm text-slate-500">Choose the your skills</p>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close user skill dialog"
                className="rounded-full bg-c-dfdfdf p-1 text-slate-700 hover:bg-c-d5d5d5"
            >
                <CgClose className="h-6 w-6" />
            </button>
            </div>

            <div className="max-h-[260px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                skills.map((skill, index) => (
                    <span
                    key={`${skill}-${index}`}
                    className="rounded-full border border-transparent bg-white px-4 py-1.5 text-[16px] text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                    >
                    {skill}
                    </span>
                ))
                ) : (
                <span className="text-sm text-slate-500">No skills</span>
                )}
            </div>
            </div>

            <div className="mt-4 flex justify-center">
            <Button
                type="button"
                onClick={onNewSkill}
                className="rounded-full bg-gradient-to-r from-main to-second px-8 py-1.5 text-[10px] leading-none font-medium text-white"
            >
                + New Skill
            </Button>
            </div>
        </div>
        </div>
    );
    }




