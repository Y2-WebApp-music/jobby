import { useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";

interface AboutDialogProps {
    open: boolean;
    initialValue: string;
    onClose: () => void;
    onSave: (value: string) => void;
}

export default function AboutDialog({
    open,
    initialValue,
    onClose,
    onSave,
}: AboutDialogProps) {
    const [aboutText, setAboutText] = useState(initialValue);

    if (!open) return null;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(aboutText.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-xl">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h2 className="text-4 font-semibold text-slate-900">About Me</h2>
                        <p className="text-4 text-slate-500">
                            Make changes to your About here. Click save when you&apos;re done.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close about dialog"
                        className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
                    >
                        <CgClose className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Type your message here"
                        rows={5}
                        className="w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm outline-none"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
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
                </form>
            </div>
        </div>
    );
}
