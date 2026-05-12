import { useMemo } from "react";
import { CgClose } from "react-icons/cg";
import { profileSkillCatalog } from "@/types/skill";

interface SkillinfoDialogProps {
  open: boolean;
  onClose: () => void;
  skillName: string | null;
}

export default function SkillinfoDialog({
  open,
  onClose,
  skillName,
}: SkillinfoDialogProps) {
  const skill = useMemo(() => {
    if (!skillName) return null;
    return (
      profileSkillCatalog.find(
        (item) => item.name.toLowerCase() === skillName.toLowerCase(),
      ) ?? null
    );
  }, [skillName]);

  if (!open || !skill) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[620px] rounded-[28px] bg-white p-4 shadow-xl sm:p-5">
        <div className="flex items-start justify-between">
          <h2 className="bg-gradient-to-r from-main to-second bg-clip-text text-[30px] leading-none font-semibold text-transparent sm:text-[40px]">
            {skill.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close skill info dialog"
            className="rounded-full bg-[#f3f3f3] p-1 text-black hover:bg-[#e7e7e7]"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-[18px] leading-none font-semibold text-[#0A0A0A]">
              Category
            </h3>
            <p className="mt-2 text-[16px] leading-6 text-[#5f5f5f]">
              {skill.categories.join(", ")}
            </p>
          </div>

          <div>
            <h3 className="text-[18px] leading-none font-semibold text-[#0A0A0A]">
              Pre-Skill
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {skill.preSkills.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-transparent px-4 py-1.5 text-[14px] leading-none text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[18px] leading-none font-semibold text-[#0A0A0A]">
              Skill Description
            </h3>
            <p className="mt-3 text-[16px] leading-7 text-[#0A0A0A]">
              {skill.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
