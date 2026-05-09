import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchSelect } from "@/components/ui/search-select";
import { cn } from "@/lib/utils";
import { useAddressOptionStore } from "@/store/addressOption";
import type { ContactProps } from "@/types/resumeType";
import { Camera, ChevronDownIcon, Plus } from "lucide-react";
import { type RefObject, useState } from "react";
import { CgClose } from "react-icons/cg";
import {
  type FormInputTabProps,
  removeListItem,
  updateListItem,
} from "./formInputTabProps";
import { usePropertiesStore } from "@/store/properties";

const comboboxTriggerClass =
  "border-input data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 gap-1.5 rounded-xl border bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] h-9 flex w-full min-w-0 items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const LabelAndLinkRow = ({
  index,
  value,
  onLabelChange,
  onLinkChange,
  onRemove,
}: {
  index: number;
  value: ContactProps;
  onLabelChange: (label: string) => void;
  onLinkChange: (link: string) => void;
  onRemove: () => void;
}) => (
  <div className="grid grid-cols-[1fr_2fr_auto] items-end gap-3">
    <Field>
      <FieldLabel htmlFor={`contact-label-${index}`}>label</FieldLabel>
      <Input
        id={`contact-label-${index}`}
        placeholder="linkedIn"
        value={value.label}
        onChange={(e) => onLabelChange(e.target.value)}
      />
    </Field>
    <Field>
      <FieldLabel htmlFor={`contact-link-${index}`}>Link</FieldLabel>
      <Input
        id={`contact-link-${index}`}
        placeholder="www.linkedin.com/in/..."
        value={value.link}
        onChange={(e) => onLinkChange(e.target.value)}
      />
    </Field>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Remove contact"
      className="rounded-xl mb-0.5 border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
      onClick={onRemove}
    >
      <CgClose className="size-4" />
    </Button>
  </div>
);

export type BasicInfoTabProps = FormInputTabProps & {
  logoInputRef: RefObject<HTMLInputElement | null>;
  logoPreview: string | null;
};

export function BasicInfoTab({
  resume,
  updateData,
  updateAddress,
  logoInputRef,
  logoPreview,
}: BasicInfoTabProps) {
  const [regionOpen, setRegionOpen] = useState(false);

  const phoneRegionOptions = usePropertiesStore.getPhoneRegionOptions();
  const provinceOptions = useAddressOptionStore.getProvinceOptions();
  const provinceId = resume.data.address?.province_id ?? 0;
  const districtId = resume.data.address?.district_id ?? 0;
  const districtOptions = useAddressOptionStore.getDistrictOptions(provinceId);
  const subDistrictOptions =
    useAddressOptionStore.getSubDistrictOptions(districtId);
  const selectedPhoneRegion = phoneRegionOptions.find(
    (option) =>
      option.id === Number(resume.data.phone_region || 0) ||
      option.label === String(resume.data.phone_region || ""),
  );

  const handleProvinceChange = (value: string) => {
    const id = value
      ? provinceOptions.find((o) => o.value === value)?.id
      : undefined;
    updateAddress("province", value);
    updateAddress("province_id", id ?? 0);
    updateAddress("district", "");
    updateAddress("district_id", 0);
    updateAddress("sub_district", "");
    updateAddress("sub_district_id", 0);
    updateAddress("postal_code", 0);
  };

  const handleDistrictChange = (value: string) => {
    const id = value
      ? districtOptions.find((o) => o.value === value)?.id
      : undefined;
    updateAddress("district", value);
    updateAddress("district_id", id ?? 0);
    updateAddress("sub_district", "");
    updateAddress("sub_district_id", 0);
    updateAddress("postal_code", 0);
  };

  const handleSubDistrictChange = (value: string) => {
    const id = value
      ? subDistrictOptions.find((o) => o.value === value)?.id
      : undefined;
    updateAddress("sub_district", value);
    updateAddress("sub_district_id", id ?? 0);
    const postal =
      districtId && id != null
        ? useAddressOptionStore.getPostalCode(districtId, id)
        : undefined;
    updateAddress("postal_code", postal ?? 0);
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <section>
        <div className="text-base font-medium">Personal Info</div>
        <div className="mt-3 flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) updateData("logo", file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="flex size-24 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-neutral-200 bg-neutral-50 p-0 hover:border-neutral-300 hover:bg-neutral-100"
              aria-label="Upload profile image"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Profile"
                  className="size-full object-cover"
                />
              ) : (
                <Camera className="size-8 text-neutral-400" />
              )}
            </Button>
            <span className="text-xs text-neutral-500">Photo</span>
          </div>
          <div className="min-w-0 flex-1">
            <FieldGroup>
              <div className="flex gap-3">
                <Field className="min-w-0 flex-1">
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input
                    id="first-name"
                    placeholder="John"
                    value={resume.data.first_name}
                    onChange={(e) => updateData("first_name", e.target.value)}
                  />
                </Field>
                <Field className="min-w-0 flex-1">
                  <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    value={resume.data.last_name}
                    onChange={(e) => updateData("last_name", e.target.value)}
                  />
                </Field>
              </div>
              <div className="flex gap-3">
                <Field className="min-w-0 max-w-[150px] flex-1">
                  <FieldLabel htmlFor="region">Region</FieldLabel>
                  <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        id="region"
                        className={cn(
                          comboboxTriggerClass,
                          "font-normal",
                          !resume.data.phone_region && "text-muted-foreground",
                        )}
                      >
                        {selectedPhoneRegion?.label ?? "Select"}
                        <ChevronDownIcon className="size-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-(--radix-popover-trigger-width) p-0"
                      align="start"
                    >
                      <Command
                        value={selectedPhoneRegion?.label ?? "Select"}
                      >
                        <CommandInput placeholder="Search..." />
                        <CommandList>
                          <CommandEmpty>No option found.</CommandEmpty>
                          <CommandGroup>
                            {phoneRegionOptions.map((opt) => {
                              const isSelected = opt.id === selectedPhoneRegion?.id;
                              return (
                                <CommandItem
                                  key={opt.id}
                                  value={opt.label}
                                  checked={isSelected}
                                  onSelect={() => {
                                    updateData(
                                      "phone_region",
                                      isSelected ? 0 : Number(opt.id) || 0,
                                    );
                                    setRegionOpen(false);
                                  }}
                                >
                                  {opt.label}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field className="min-w-0 max-w-[180px] flex-1">
                  <FieldLabel htmlFor="phone-number">Tel.</FieldLabel>
                  <Input
                    id="phone-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="XXXXXXXXXX"
                    maxLength={10}
                    value={resume.data.phone ? String(resume.data.phone) : ""}
                    onChange={(e) =>
                      updateData(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                  />
                </Field>
                <Field className="min-w-0 flex-1">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="xxxx.123@gmail.com"
                    value={resume.data.email ? String(resume.data.email) : ""}
                    onChange={(e) => updateData("email", e.target.value)}
                  />
                </Field>
              </div>
              <div className="space-y-3">
                {resume.data.contact.map((contact, index) => (
                  <LabelAndLinkRow
                    key={`contact-${index}`}
                    index={index}
                    value={contact}
                    onLabelChange={(label) =>
                      updateData(
                        "contact",
                        updateListItem(
                          resume.data.contact,
                          index,
                          "label",
                          label,
                        ),
                      )
                    }
                    onLinkChange={(link) =>
                      updateData(
                        "contact",
                        updateListItem(
                          resume.data.contact,
                          index,
                          "link",
                          link,
                        ),
                      )
                    }
                    onRemove={() =>
                      updateData(
                        "contact",
                        removeListItem(resume.data.contact, index),
                      )
                    }
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-dashed"
                  onClick={() =>
                    updateData("contact", [
                      ...resume.data.contact,
                      { label: "", link: "" },
                    ])
                  }
                >
                  <Plus className="size-4" />
                  Add Contact
                </Button>
              </div>
            </FieldGroup>
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <div className="text-base font-medium">Address</div>
        <FieldGroup className="mt-3 grid grid-cols-2 gap-3">
          <Field className="col-span-2">
            <FieldLabel htmlFor="address-line">Address line</FieldLabel>
            <Input
              id="address-line"
              placeholder="bangkok"
              value={resume.data.address?.address_line || ""}
              onChange={(e) => updateAddress("address_line", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-no">No.</FieldLabel>
            <Input
              id="address-no"
              placeholder="20"
              value={resume.data.address?.no || ""}
              onChange={(e) => updateAddress("no", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-moo">moo</FieldLabel>
            <Input
              id="address-moo"
              placeholder="Text Here"
              value={resume.data.address?.moo || ""}
              onChange={(e) => updateAddress("moo", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-soi">soi</FieldLabel>
            <Input
              id="address-soi"
              placeholder="Text Here"
              value={resume.data.address?.soi || ""}
              onChange={(e) => updateAddress("soi", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-street">street</FieldLabel>
            <Input
              id="address-street"
              placeholder="bangkok"
              value={resume.data.address?.street || ""}
              onChange={(e) => updateAddress("street", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-province">Province</FieldLabel>
            <SearchSelect
              id="address-province"
              value={resume.data.address?.province ?? ""}
              onValueChange={handleProvinceChange}
              options={provinceOptions.map((o) => ({ value: o.value }))}
              placeholder="Select"
              searchPlaceholder="Search province..."
              emptyMessage="No province found."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-district">District</FieldLabel>
            <SearchSelect
              id="address-district"
              value={resume.data.address?.district ?? ""}
              onValueChange={handleDistrictChange}
              options={districtOptions.map((o) => ({ value: o.value }))}
              placeholder="Select"
              searchPlaceholder="Search district..."
              emptyMessage="No district found."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-subdistrict">Sub-district</FieldLabel>
            <SearchSelect
              id="address-subdistrict"
              value={resume.data.address?.sub_district ?? ""}
              onValueChange={handleSubDistrictChange}
              options={subDistrictOptions.map((o) => ({ value: o.value }))}
              placeholder="Select"
              searchPlaceholder="Search sub-district..."
              emptyMessage="No sub-district found."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address-postal">Postal code</FieldLabel>
            <Input
              id="address-postal"
              placeholder="xxxxx"
              readOnly
              value={
                resume.data.address?.postal_code
                  ? String(resume.data.address.postal_code)
                  : ""
              }
            />
          </Field>
        </FieldGroup>
      </section>
    </div>
  );
}
