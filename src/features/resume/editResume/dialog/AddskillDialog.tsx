import { useEffect, useMemo, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { CiSearch } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import ExamDialog from "@/features/profile/dialog/ExamDialog";
import { getSkillExam } from "@/types/skillExam";
import { profileSkillCatalog } from "@/types/skill";
import { PlusIcon } from "lucide-react";

interface AddskillDialogProps {
  open: boolean;
  onClose: () => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill?: (skill: string) => void;
  existingSkills?: string[];
  showSkillsList?: boolean;
  enableSkillExam?: boolean;
}

const normalizeSkill = (value: string) => value.trim().replace(/\s+/g, " ");

export default function AddskillDialog({
  open,
  onClose,
  onAddSkill,
  onRemoveSkill,
  existingSkills = [],
  showSkillsList = false,
  enableSkillExam = false,
}: AddskillDialogProps) {
  const [input, setInput] = useState("");
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [draftSkills, setDraftSkills] = useState<string[]>(existingSkills);
  const [pendingExamSkillName, setPendingExamSkillName] = useState<
    string | null
  >(null);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [searchInputWidth, setSearchInputWidth] = useState<number>(0);
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  const keyword = input.trim().toLowerCase();

  const listSkills = showSkillsList ? draftSkills : existingSkills;

  const suggestions = useMemo(() => {
    const blocked = new Set(listSkills.map((item) => item.toLowerCase()));
    if (!keyword) return [];

    return profileSkillCatalog
      .filter((item) => !blocked.has(item.name.toLowerCase()))
      .filter((item) => item.name.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [listSkills, keyword]);

  const selectedSkill = useMemo(
    () =>
      profileSkillCatalog.find((item) => item.name === selectedSkillName) ??
      null,
    [selectedSkillName],
  );

  const shouldShowSkillsList = showSkillsList && !selectedSkill;
  const hasSkillChanges = useMemo(() => {
    if (!showSkillsList) return false;
    const before = new Set(existingSkills.map((item) => item.toLowerCase()));
    const after = new Set(draftSkills.map((item) => item.toLowerCase()));
    if (before.size !== after.size) return true;
    for (const name of before) {
      if (!after.has(name)) return true;
    }
    return false;
  }, [draftSkills, existingSkills, showSkillsList]);

  const commitSkillAdd = (skillName: string) => {
    if (showSkillsList) {
      setDraftSkills((prev) => [...prev, skillName]);
    } else {
      onAddSkill(skillName);
    }

    setInput("");
    setSelectedSkillName(null);
  };

  const addToDraft = (raw: string) => {
    const next = normalizeSkill(raw);
    if (!next) return;

    const preparedSkill = profileSkillCatalog.find(
      (item) => item.name.toLowerCase() === next.toLowerCase(),
    );
    if (!preparedSkill) return;

    const exists = listSkills.some(
      (item) => item.toLowerCase() === preparedSkill.name.toLowerCase(),
    );
    if (exists) return;

    if (enableSkillExam && getSkillExam(preparedSkill.name)) {
      setPendingExamSkillName(preparedSkill.name);
      return;
    }

    commitSkillAdd(preparedSkill.name);
  };

  const handleClose = () => {
    setInput("");
    setSelectedSkillName(null);
    setDraftSkills(existingSkills);
    setPendingExamSkillName(null);
    setIsSearchPopoverOpen(false);
    onClose();
  };

  const removeSkill = (name: string) => {
    if (showSkillsList) {
      setDraftSkills((prev) => prev.filter((item) => item !== name));
      return;
    }
    onRemoveSkill?.(name);
  };

  const handleSelectSuggestion = (skillName: string) => {
    setInput(skillName);
    setSelectedSkillName(skillName);
  };

  const handleAddAllSkills = () => {
    if (!showSkillsList || !hasSkillChanges) return;

    const before = new Set(existingSkills.map((item) => item.toLowerCase()));
    const after = new Set(draftSkills.map((item) => item.toLowerCase()));

    existingSkills.forEach((skill) => {
      if (!after.has(skill.toLowerCase())) {
        onRemoveSkill?.(skill);
      }
    });

    draftSkills.forEach((skill) => {
      if (!before.has(skill.toLowerCase())) {
        onAddSkill(skill);
      }
    });

    onClose();
  };

  useEffect(() => {
    const anchor = searchAnchorRef.current;
    if (!anchor) return;

    const updateWidth = () => setSearchInputWidth(anchor.offsetWidth);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(anchor);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="min-w-[40vw] w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-1 pt-2 flex items-start justify-between">
          <div>
            <DialogTitle className="text-xl leading-none font-medium text-slate-900">
              Add Skill
            </DialogTitle>
            <p className="mt-1 text-sm text-slate-500">
              Search Skill you want to add
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close add skill dialog"
            className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-2">
          <label className="mb-1 block text-base leading-none font-normal text-slate-900">
            Search Skill
          </label>
          <Popover
            open={isSearchPopoverOpen && Boolean(keyword)}
            onOpenChange={setIsSearchPopoverOpen}
          >
            <PopoverAnchor asChild>
              <div ref={searchAnchorRef} className="relative">
                <CiSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737373]" />
                <input
                  autoFocus
                  value={input}
                  placeholder="React..."
                  onFocus={() => {
                    if (keyword) setIsSearchPopoverOpen(true);
                  }}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setInput(nextValue);
                    setSelectedSkillName(null);
                    setIsSearchPopoverOpen(Boolean(nextValue.trim()));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-9 text-base outline-none"
                />
                {input ? (
                  <button
                    type="button"
                    onClick={() => {
                      setInput("");
                      setSelectedSkillName(null);
                      setIsSearchPopoverOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    aria-label="Clear search"
                  >
                    <CgClose className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </PopoverAnchor>
            <PopoverContent
              align="start"
              sideOffset={6}
              className="z-80 p-1"
              style={{
                width: searchInputWidth ? `${searchInputWidth}px` : undefined,
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <Command className="p-0">
                <CommandList className="max-h-56">
                  <CommandEmpty>No skill found.</CommandEmpty>
                  <CommandGroup>
                    {suggestions.map((skill) => (
                      <CommandItem
                        key={skill.name}
                        value={skill.name}
                        onSelect={() => {
                          handleSelectSuggestion(skill.name);
                          setIsSearchPopoverOpen(false);
                        }}
                      >
                        {skill.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedSkill ? (
          <div className="mt-4 space-y-3 text-slate-900">
            <div>
              <h3 className="text-[18px] font-normal leading-none">
                Skill Description
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#000000]">
                {selectedSkill.description}
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-normal leading-none">
                Pre-Skill
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSkill.preSkills.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-normal leading-none">Category</h3>
              <p className="mt-1 text-sm text-[#525252]">
                {selectedSkill.categories.join(", ")}
              </p>
            </div>

            <div className="pt-2 text-center">
              <Button
                type="button"
                onClick={() => addToDraft(selectedSkill.name)}
                variant="default"
                size="lg"
              >
                <PlusIcon className="size-4" />
                Add This Skill
              </Button>
            </div>
          </div>
        ) : null}

        {shouldShowSkillsList ? (
          <div className="mt-4 border-t border-slate-200 pt-3">
            <h3 className="text-[18px] font-semibold text-slate-900">
              Skills List
            </h3>
            <p className="text-sm text-slate-500">
              List of skills you have chosen.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {listSkills.length > 0 ? (
                listSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-sm text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-primary-pink"
                    >
                      <CgClose className="h-4 w-4" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills selected.</p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Button
                type="button"
                onClick={handleAddAllSkills}
                disabled={!hasSkillChanges}
                variant="default"
                size="lg"
              >
                <PlusIcon className="size-4" />
                Add Skills
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>

      <ExamDialog
        open={Boolean(pendingExamSkillName)}
        skillName={pendingExamSkillName}
        onClose={() => setPendingExamSkillName(null)}
        onPass={(skillName) => {
          setPendingExamSkillName(null);
          commitSkillAdd(skillName);
        }}
      />
    </Dialog>
  );
}
