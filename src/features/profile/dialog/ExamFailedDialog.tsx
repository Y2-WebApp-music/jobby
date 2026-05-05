import ExamResultDialog from "@/features/profile/dialog/ExamResultDialog";

interface ExamFailedDialogProps {
  open: boolean;
  skillName: string | null;
  onClose: () => void;
  onRetake: () => void;
}

export default function ExamFailedDialog({
  open,
  skillName,
  onClose,
  onRetake,
}: ExamFailedDialogProps) {
  return (
    <ExamResultDialog
      open={open}
      skillName={skillName}
      variant="failed"
      onClose={onClose}
      onPrimaryAction={onRetake}
      onSecondaryAction={onClose}
    />
  );
}
