import { useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";

export type ProfileLink = {
  id: number;
  label: string;
  url: string;
};

export type ProfileFormValue = {
  firstName: string;
  lastName: string;
  region: string;
  tel: string;
  email: string;
  addressLine: string;
  addressNo: string;
  moo: string;
  soi: string;
  street: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  links: ProfileLink[];
};

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormValue) => void;
  initialData: ProfileFormValue;
}

const REGION_OPTIONS = [
  { value: "THA", label: "Thailand", dialCode: "66" },
  { value: "CHN", label: "China", dialCode: "86" },
  { value: "JPN", label: "Japan", dialCode: "81" },
  { value: "GBR", label: "United Kingdom", dialCode: "44" },
] as const;

const getDialCodeByRegion = (region: string) =>
  REGION_OPTIONS.find((item) => item.value === region)?.dialCode ?? "66";

export default function ProfileDialog({
  open,
  onClose,
  onSave,
  initialData,
}: ProfileDialogProps) {
  const [formValue, setFormValue] = useState<ProfileFormValue>(initialData);

  if (!open) return null;

  const updateLink = (id: number, field: "label" | "url", value: string) => {
    setFormValue((prev) => ({
      ...prev,
      links: prev.links.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeLink = (id: number) => {
    setFormValue((prev) => ({
      ...prev,
      links: prev.links.filter((item) => item.id !== id),
    }));
  };

  const addLink = () => {
    setFormValue((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        {
          id: Date.now(),
          label: "",
          url: "",
        },
      ],
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Edit profile
            </h2>
            <p className="text-sm text-slate-500">
              Make changes to your profile here. Click save when you're done.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile editor"
            className="rounded-full bg-slate-100 p-1 text-slate-700 hover:bg-slate-200"
          >
            <CgClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                First Name
              </label>
              <input
                value={formValue.firstName}
                placeholder="Jane"
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-[#f335ec] px-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Last Name
              </label>
              <input
                value={formValue.lastName}
                placeholder="Doe"
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">Contact</h3>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-[84px_144px_minmax(0,1fr)]">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Region
                </label>
                <select
                  value={formValue.region}
                  onChange={(e) => {
                    const nextRegion = e.target.value;
                    const prevDialCode = getDialCodeByRegion(formValue.region);
                    const nextDialCode = getDialCodeByRegion(nextRegion);
                    const currentDigits = formValue.tel.replace(/\D/g, "");
                    const localDigits = currentDigits.startsWith(prevDialCode)
                      ? currentDigits.slice(prevDialCode.length)
                      : currentDigits;

                    setFormValue((prev) => ({
                      ...prev,
                      region: nextRegion,
                      tel: `${nextDialCode}${localDigits}`,
                    }));
                  }}
                  className="h-9 w-full rounded-xl border border-slate-200 px-2 text-sm outline-none"
                >
                  {REGION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Tel.
                </label>
                <div className="flex h-9 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <span className="inline-flex items-center border-r border-slate-200 px-2 text-sm text-slate-600">
                    +{getDialCodeByRegion(formValue.region)}
                  </span>
                  <input
                    value={formValue.tel
                      .replace(/\D/g, "")
                      .slice(getDialCodeByRegion(formValue.region).length)}
                    placeholder="815XXXXXX"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const localDigits = e.target.value.replace(/\D/g, "");
                      const dialCode = getDialCodeByRegion(formValue.region);
                      setFormValue((prev) => ({
                        ...prev,
                        tel: `${dialCode}${localDigits}`,
                      }));
                    }}
                    className="h-full w-full px-3 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Email
                </label>
                <input
                  value={formValue.email}
                  type="email"
                  placeholder="email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {formValue.links.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,130px)_minmax(0,1fr)_44px] gap-2"
              >
                <div>
                  <label className="mb-1 block text-sm text-slate-700">
                    label
                  </label>
                  <input
                    value={item.label}
                    placeholder="linkedIn"
                    onChange={(e) =>
                      updateLink(item.id, "label", e.target.value)
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-700">
                    Link
                  </label>
                  <input
                    value={item.url}
                    placeholder="www.linkedin.com/*******"
                    onChange={(e) => updateLink(item.id, "url", e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Delete link"
                  onClick={() => removeLink(item.id)}
                  className="mt-6 h-9 w-9 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <CgClose className="mx-auto h-6 w-6" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addLink}
            className="mx-auto block rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            + Add Link
          </button>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">Address</h3>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_128px]">
              <div>
                <input
                  value={formValue.addressLine}
                  placeholder="Address line"
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      addressLine: e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </div>
              <div>
                <input
                  value={formValue.addressNo}
                  placeholder="No."
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      addressNo: e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                value={formValue.moo}
                placeholder="moo"
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    moo: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
              <input
                value={formValue.soi}
                placeholder="soi"
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    soi: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
              <input
                value={formValue.street}
                placeholder="street"
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    street: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={formValue.province}
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    province: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select province</option>
                <option value="Bangkok">Bangkok</option>
              </select>
              <select
                value={formValue.district}
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    district: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select district</option>
                <option value="Huai Khwang">Huai Khwang</option>
              </select>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
              <select
                value={formValue.subDistrict}
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    subDistrict: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select sub-district</option>
                <option value="Bang Kapi">Bang Kapi</option>
              </select>
              <input
                value={formValue.postalCode}
                inputMode="numeric"
                placeholder="Postal code"
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    postalCode: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-base text-slate-500 hover:bg-slate-50"
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
