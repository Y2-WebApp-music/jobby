import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SkillinfoDialog from "@/features/profile/dialog/SkillinfoDialog";
import UserskillDialog from "@/features/profile/dialog/UserskillDialog";

const sampleSkills = [
  "React",
  "TypeScript",
  "Ke yes",
  "Ke mou",
  "Figma",
  "SQL",
];

export default function ShowCaseDialogs() {
  const [skillInfoOpen, setSkillInfoOpen] = useState(false);
  const [userSkillOpen, setUserSkillOpen] = useState(false);
  const [userSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "Figma",
  ]);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    "React",
  );

  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/showcase"
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted"
            >
              Back to Showcase
            </Link>
            <span className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
              /showcase/dialogs
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dialog Preview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Temporary preview page for `SkillinfoDialog` and
              `UserskillDialog`.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            SkillinfoDialog
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a sample skill, then open the dialog to preview the large
            skill detail modal.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {sampleSkills.map((skill) => {
              const active = selectedSkillName === skill;

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkillName(skill)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "border border-transparent text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <Button type="button" onClick={() => setSkillInfoOpen(true)}>
              Open SkillinfoDialog
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            UserskillDialog
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This preview opens the user-skill list modal with sample skills and
            keeps the `+ New Skill` button connected to the add-skill flow.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-5">
            <Button type="button" onClick={() => setUserSkillOpen(true)}>
              Open UserskillDialog
            </Button>
          </div>
        </section>
      </div>

      <SkillinfoDialog
        open={skillInfoOpen}
        onClose={() => setSkillInfoOpen(false)}
        skillName={selectedSkillName}
      />

      <UserskillDialog
        open={userSkillOpen}
        skills={userSkills}
        onClose={() => setUserSkillOpen(false)}
        onNewSkill={() => {
          setUserSkillOpen(false);
          setSkillInfoOpen(true);
        }}
      />
    </div>
  );
}
