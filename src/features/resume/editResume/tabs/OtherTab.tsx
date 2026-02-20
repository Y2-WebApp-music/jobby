import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { CgClose } from "react-icons/cg";
import {
  type FormInputTabProps,
  removeListItem,
  updateListItem,
} from "./formInputTabProps";

export function OtherTab({ resume, updateData }: FormInputTabProps) {
  return (
    <div className="space-y-6">
      <section>
        <div className="text-base font-medium">Miscellaneous</div>
        <div className="mt-3 space-y-4">
          {resume.data.miscellaneous.map((item, index) => (
            <div className="grid grid-cols-[1fr_2fr_auto] items-end gap-3">
              <Field>
                <FieldLabel htmlFor={`misc-label-${index}`}>Label</FieldLabel>
                <Input
                  id={`misc-label-${index}`}
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) =>
                    updateData(
                      "miscellaneous",
                      updateListItem(
                        resume.data.miscellaneous,
                        index,
                        "label",
                        e.target.value,
                      ),
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`misc-detail-${index}`}>Detail</FieldLabel>
                <Input
                  id={`misc-detail-${index}`}
                  placeholder="Detail"
                  value={item.data}
                  onChange={(e) =>
                    updateData(
                      "miscellaneous",
                      updateListItem(
                        resume.data.miscellaneous,
                        index,
                        "data",
                        e.target.value,
                      ),
                    )
                  }
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove misc"
                className="rounded-xl mb-0.5 border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                onClick={() =>
                  updateData(
                    "miscellaneous",
                    removeListItem(resume.data.miscellaneous, index),
                  )
                }
              >
                <CgClose className="size-4" />
              </Button>
            </div>
          ))}
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-neutral-200"
              onClick={() =>
                updateData("miscellaneous", [
                  ...resume.data.miscellaneous,
                  { label: "", data: "" },
                ])
              }
            >
              <Plus className="size-4" />
              Add Misc
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
