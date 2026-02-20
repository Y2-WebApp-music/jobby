import type { AdditionFile, AdditionFilePayload } from "@/types/searchJob";
import { FileUpload } from "../inputs/FileUpload";
import type { Dispatch, SetStateAction } from "react";

export function FileUploadStep({
  list_addition_file,
  addition_file,
  setAdditionFile,
}: {
  list_addition_file: AdditionFile[];
  addition_file: AdditionFilePayload[];
  setAdditionFile: Dispatch<SetStateAction<AdditionFilePayload[]>>;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-base mb-2">Addition File</h3>
      <div className="space-y-6">
        {list_addition_file.map((file) => (
          <div key={file.id}>
            <FileUpload
              key={file.id}
              id={file.id.toString()}
              label={file.label}
              hint={file.description}
              accept=".pdf,.jpg,.jpeg,.png"
              maxMb={10}
              file={addition_file.find((f) => f.id === file.id)?.data ?? null}
              onFileChange={(f) =>
                setAdditionFile((prev) => {
                  const next = prev.filter((p) => p.id !== file.id);
                  return [...next, { id: file.id, data: f }];
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
