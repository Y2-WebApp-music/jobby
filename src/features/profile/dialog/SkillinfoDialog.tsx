import { useMemo } from "react";
import { CgClose } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import { profileSkillCatalog } from "@/types/skill";

interface SkillinfoDialogProps {
    open: boolean;
    onClose: () => void;
    skillName: string | null;
    userSkills?: string[];
    onAddSkill?: (skill: string) => void;
    onRemoveSkill?: (skill: string) => void;
}

export default function SkillinfoDialog({
    open,
    onClose,
    skillName,
    userSkills = [],
    onAddSkill,
    onRemoveSkill,
}: SkillinfoDialogProps) {
    const skill = useMemo(() => {
    if (!skillName) return null;
    return (
        profileSkillCatalog.find(
        (item) => item.name.toLowerCase() === skillName.toLowerCase(),
        ) ?? null
    );
    }, [skillName]);

    const hasSkill = useMemo(() => {
    if (!skill) return false;
    return userSkills.some(
        (item) => item.toLowerCase() === skill.name.toLowerCase(),
    );
}, [skill, userSkills]);

    if (!open || !skill) return null;

    const handleAddSkill = () => {
        if (hasSkill) return;
        onAddSkill?.(skill.name);
        onClose();
    };

    const handleDeleteSkill = () => {
        if (!hasSkill) return;
        onRemoveSkill?.(skill.name);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-[860px] rounded-3xl bg-[#F3F3F3] p-6 shadow-xl">
            <div className="flex items-start justify-between">
            <h2 className="bg-gradient-to-r from-main to-second bg-clip-text text-5xl leading-none font-semibold text-transparent">
                {skill.name}
            </h2>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close skill info dialog"
                className="rounded-2xl bg-[#EAEAEA] p-1 text-black hover:bg-[#DFDFDF]"
            >
                <CgClose className="h-8 w-8" />
            </button>
            </div>

            <div className="mt-6 space-y-5">
            <div>
                <h3 className="text-[38px] leading-none font-normal text-[#0A0A0A]">Category</h3>
                <p className="mt-2 text-[34px] leading-[1.2] text-[#525252]">
                {skill.categories.join(", ")}
                </p>
            </div>

            <div>
                <h3 className="text-[38px] leading-none font-normal text-[#0A0A0A]">Pre-Skill</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                {skill.preSkills.map((item) => (
                    <span
                    key={item}
                    className="rounded-full border border-transparent px-5 py-2 text-[28px] leading-none text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                    >
                    {item}
                    </span>
                ))}
                </div>
            </div>

            <div>
                <h3 className="text-[38px] leading-none font-normal text-[#0A0A0A]">Skill Description</h3>
                <p className="mt-3 text-[41px] leading-[1.15] text-[#0A0A0A]">
                {skill.description}
                </p>
            </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
            {hasSkill ? (
                <Button
                type="button"
                onClick={handleDeleteSkill}
                className="rounded-full border border-[#D4D4D4] bg-[#F3F3F3] px-10 py-3 text-[44px] font-medium text-[#737373] hover:border-[#A1A1A1] hover:text-[#0A0A0A]"
                >
                Delete Skill
                </Button>
            ) : (
                <div />
            )}

            {!hasSkill ? (
                <Button
                type="button"
                onClick={handleAddSkill}
                className="rounded-full bg-gradient-to-r from-main to-second px-10 py-3 text-[44px] font-medium text-white"
                >
                + Add Skill
                </Button>
            ) : null}
            </div>
        </div>
        </div>
    );
}
