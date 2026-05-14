import { CgClose } from "react-icons/cg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SkillDetailResponse } from "@/services/skillDetailService";
import { profileSkillCatalog } from "@/types/skill";
import { Button } from "@/components/ui/button";

interface SkillinfoDialogProps {
  open: boolean;
  onClose: () => void;
  skillName: string | null;
  skillDetail?: SkillDetailResponse | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onSelectSkill?: (skillId: string, skillName: string) => void | Promise<void>;
}

export default function SkillinfoDialog({
  open,
  onClose,
  skillName,
  skillDetail = null,
  isLoading = false,
  errorMessage = null,
  onSelectSkill,
}: SkillinfoDialogProps) {
  if (!open) return null;

  const fallbackSkill = skillName
    ? (profileSkillCatalog.find(
        (item) => item.name.toLowerCase() === skillName.toLowerCase(),
      ) ?? null)
    : null;
  const skill = skillDetail?.skill ?? fallbackSkill;
  const preSkillsRaw = skillDetail?.related_skills ?? [];
  const preSkills = preSkillsRaw.filter((item) =>
    item.relType.toLowerCase().includes("pre"),
  );
  const normalizedPreSkills = preSkills.length > 0 ? preSkills : preSkillsRaw;
  const fallbackPreSkills =
    fallbackSkill?.preSkills.map((item) => ({
      skillElementId: item,
      name: item,
    })) ?? [];
  const skillButtons =
    normalizedPreSkills.length > 0 ? normalizedPreSkills : fallbackPreSkills;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="gap-0 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <DialogTitle className="bg-linear-to-r from-main to-second text-4xl py-2 leading-none font-normal bg-clip-text text-transparent">
            {skill?.name ?? skillName ?? "Skill Detail"}
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close skill info dialog"
              className="rounded-full bg-[#f3f3f3] p-1 text-black hover:bg-[#e7e7e7]"
            >
              <CgClose className="h-6 w-6" />
            </button>
          </DialogClose>
        </div>

        {isLoading ? (
          <div className="mt-5 text-[16px] text-[#5f5f5f]">
            Loading skill details...
          </div>
        ) : errorMessage ? (
          <div className="mt-5 text-[16px] text-red-500">{errorMessage}</div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-lg leading-none font-normal text-[#0A0A0A]">
                Pre-Skill
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skillButtons.length > 0 ? (
                  skillButtons.map((item) => (
                    <Button
                      key={item.skillElementId}
                      className="rounded-full"
                      variant="outline_gradient"
                      onClick={() => {
                        if (!onSelectSkill) return;
                        void onSelectSkill(item.skillElementId, item.name);
                      }}
                      disabled={!onSelectSkill}
                    >
                      {item.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-[16px] leading-6 text-[#5f5f5f]">
                    No related pre-skills.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg leading-none font-normal text-[#0A0A0A]">
                Skill Description
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#0A0A0A]">
                {skill?.description || "No description available."}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
