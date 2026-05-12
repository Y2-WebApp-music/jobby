import ExamResultDialog from "@/features/profile/dialog/ExamResultDialog";

interface ExamPassedDialogProps {
  open: boolean;
  skillName: string | null;
  onClose: () => void;
  onContinue: () => void;
}

export default function ExamPassedDialog({
  open,
  skillName,
  onClose,
  onContinue,
}: ExamPassedDialogProps) {
  return (
    <ExamResultDialog
      open={open}
      skillName={skillName}
      variant="passed"
      onClose={onClose}
      onPrimaryAction={onContinue}
    />
  );
}
