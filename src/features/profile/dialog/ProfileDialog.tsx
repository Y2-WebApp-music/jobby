import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CgClose } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import { useAddressOptionStore, type AddressOptionItem } from "@/store/addressOption";
import utilityService from "@/services/utilityService";

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
  onSave: (data: ProfileFormValue) => void | Promise<void>;
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

const normalizeLocalTel = (region: string, localTel: string) => {
  const digits = localTel.replace(/\D/g, "");
  if (!digits) return "";
  if (region === "THA") {
    return digits.replace(/^0/, "");
  }
  return digits;
};

const buildTelWithDialCode = (region: string, rawLocalTel: string) => {
  const dialCode = getDialCodeByRegion(region);
  const normalizedLocal = normalizeLocalTel(region, rawLocalTel);
  return `${dialCode}${normalizedLocal}`;
};

const extractLocalTel = (region: string, fullTel: string) => {
  const digits = fullTel.replace(/\D/g, "");
  const dialCode = getDialCodeByRegion(region);
  if (!digits.startsWith(dialCode)) return digits;
  return digits.slice(dialCode.length);
};

const withSelectedFallback = (
  options: AddressOptionItem[],
  selectedValue: string,
) => {
  if (!selectedValue) return options;
  if (options.some((option) => option.value === selectedValue)) return options;
  return [{ id: -1, value: selectedValue }, ...options];
};

const mapProvinceOptions = (
  provinces: Awaited<ReturnType<typeof utilityService.getProvince>>["data"],
) =>
  provinces.map((item) => ({
    province_id: item.province_code,
    province_th: item.province_name_th ?? "",
    province_eng: item.province_name_en ?? "",
    country_id: item.country_id,
  }));

const mapDistrictOptions = (
  districts: Awaited<
    ReturnType<typeof utilityService.getDistrict>
  >["data"]["districts"],
) =>
  districts.map((item) => ({
    district_id: item.district_code,
    district_th: item.district_name_th ?? "",
    district_eng: item.district_name_en ?? "",
    province_id: item.province_id,
    sub_district_list: [],
  }));

const mapSubDistrictOptions = (
  subDistricts: Awaited<
    ReturnType<typeof utilityService.getSubDistrict>
  >["data"]["sub_districts"],
) =>
  subDistricts.map((item) => ({
    sub_district_id: item.sub_district_code,
    sub_district_th: item.sub_district_name_th ?? "",
    sub_district_eng: item.sub_district_name_en ?? "",
    district_id: item.district_id,
  }));

export default function ProfileDialog({
  open,
  onClose,
  onSave,
  initialData,
}: ProfileDialogProps) {
  const [formValue, setFormValue] = useState<ProfileFormValue>(initialData);
  const [localTelInput, setLocalTelInput] = useState(() =>
    extractLocalTel(initialData.region, initialData.tel),
  );
  const provinces = useAddressOptionStore((state) => state.provinces);
  const districts = useAddressOptionStore((state) => state.districts);
  const postalCodesBySubDistrict = useAddressOptionStore(
    (state) => state.postalCodesBySubDistrict,
  );

  useEffect(() => {
    setFormValue(initialData);
    setLocalTelInput(extractLocalTel(initialData.region, initialData.tel));
  }, [initialData]);

  useEffect(() => {
    if (!open) return;
    if (provinces.length > 0) return;

    const loadProvinces = async () => {
      try {
        const response = await utilityService.getProvince();
        useAddressOptionStore.setProvinces(mapProvinceOptions(response.data));
      } catch {
        return;
      }
    };

    void loadProvinces();
  }, [open, provinces.length]);

  const baseProvinceOptions = useMemo(
    () =>
      provinces.map((item) => ({
        id: item.province_id,
        value: item.province_eng,
      })),
    [provinces],
  );
  const selectedProvinceId = useMemo(
    () =>
      baseProvinceOptions.find((option) => option.value === formValue.province)
        ?.id ?? 0,
    [baseProvinceOptions, formValue.province],
  );

  useEffect(() => {
    if (!open || !selectedProvinceId) return;

    const hasDistrictsForProvince = districts.some(
      (item) => item.province_id === selectedProvinceId,
    );
    if (hasDistrictsForProvince) return;

    const loadDistricts = async () => {
      try {
        const response = await utilityService.getDistrict(selectedProvinceId);
        useAddressOptionStore.setDistricts(
          mapDistrictOptions(response.data.districts),
        );
      } catch {
        return;
      }
    };

    void loadDistricts();
  }, [districts, open, selectedProvinceId]);
  const baseDistrictOptions = useMemo(
    () =>
      selectedProvinceId
        ? districts
            .filter((item) => item.province_id === selectedProvinceId)
            .map((item) => ({
              id: item.district_id,
              value: item.district_eng,
            }))
        : [],
    [districts, selectedProvinceId],
  );
  const selectedDistrictId = useMemo(
    () =>
      baseDistrictOptions.find((option) => option.value === formValue.district)
        ?.id ?? 0,
    [baseDistrictOptions, formValue.district],
  );

  useEffect(() => {
    if (!open || !selectedDistrictId) return;

    const district = districts.find((item) => item.district_id === selectedDistrictId);
    if (district?.sub_district_list?.length) return;

    const loadSubDistricts = async () => {
      try {
        const response = await utilityService.getSubDistrict(selectedDistrictId);
        useAddressOptionStore.setSubDistricts(
          selectedDistrictId,
          mapSubDistrictOptions(response.data.sub_districts),
        );
      } catch {
        return;
      }
    };

    void loadSubDistricts();
  }, [districts, open, selectedDistrictId]);
  const baseSubDistrictOptions = useMemo(
    () =>
      (districts.find((item) => item.district_id === selectedDistrictId)
        ?.sub_district_list ?? []
      ).map((item) => ({
        id: item.sub_district_id,
        value: item.sub_district_eng,
      })),
    [districts, selectedDistrictId],
  );
  const selectedSubDistrictId = useMemo(
    () =>
      baseSubDistrictOptions.find(
        (option) => option.value === formValue.subDistrict,
      )?.id ?? 0,
    [baseSubDistrictOptions, formValue.subDistrict],
  );

  useEffect(() => {
    if (!open || !selectedSubDistrictId || !selectedDistrictId) return;
    if (useAddressOptionStore.getPostalCode(selectedDistrictId, selectedSubDistrictId)) {
      return;
    }

    const loadPostalCodes = async () => {
      try {
        const response = await utilityService.getPostalCode(selectedSubDistrictId);
        useAddressOptionStore.setPostalCodes(
          selectedSubDistrictId,
          response.data
            .map((item) => Number(item.postal_code))
            .filter((item) => Number.isFinite(item)),
        );
      } catch {
        return;
      }
    };

    void loadPostalCodes();
  }, [open, selectedDistrictId, selectedSubDistrictId]);
  const provinceOptions = useMemo(
    () => withSelectedFallback(baseProvinceOptions, formValue.province),
    [baseProvinceOptions, formValue.province],
  );
  const districtOptions = useMemo(
    () => withSelectedFallback(baseDistrictOptions, formValue.district),
    [baseDistrictOptions, formValue.district],
  );
  const subDistrictOptions = useMemo(
    () => withSelectedFallback(baseSubDistrictOptions, formValue.subDistrict),
    [baseSubDistrictOptions, formValue.subDistrict],
  );
  const postalCodeOptions = useMemo(() => {
    const codes = selectedSubDistrictId
      ? (postalCodesBySubDistrict[selectedSubDistrictId] ?? [])
      : [];
    const mapped = codes.map((code) => ({
      id: code,
      value: String(code),
    }));

    if (!formValue.postalCode) return mapped;
    if (mapped.some((option) => option.value === formValue.postalCode)) {
      return mapped;
    }

    return [{ id: -1, value: formValue.postalCode }, ...mapped];
  }, [formValue.postalCode, postalCodesBySubDistrict, selectedSubDistrictId]);

  useEffect(() => {
    if (postalCodeOptions.length === 0) return;
    if (
      formValue.postalCode &&
      postalCodeOptions.some((option) => option.value === formValue.postalCode)
    ) {
      return;
    }

    setFormValue((prev) => ({
      ...prev,
      postalCode: postalCodeOptions[0]?.value ?? "",
    }));
  }, [formValue.postalCode, postalCodeOptions]);

  if (!open) return null;

  const handleProvinceChange = (value: string) => {
    setFormValue((prev) => ({
      ...prev,
      province: value,
      district: "",
      subDistrict: "",
      postalCode: "",
    }));
  };

  const handleDistrictChange = (value: string) => {
    setFormValue((prev) => ({
      ...prev,
      district: value,
      subDistrict: "",
      postalCode: "",
    }));
  };

  const handleSubDistrictChange = (value: string) => {
    setFormValue((prev) => ({
      ...prev,
      subDistrict: value,
      postalCode: "",
    }));
  };

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await Promise.resolve(
        onSave({
          ...formValue,
          tel: buildTelWithDialCode(formValue.region, localTelInput),
        }),
      );
      onClose();
    } catch {
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
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
                className="h-9 w-full rounded-xl border border-second px-3 text-sm outline-none"
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
                    setFormValue((prev) => ({
                      ...prev,
                      region: e.target.value,
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
                    value={localTelInput}
                    placeholder="815XXXXXX"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      setLocalTelInput(e.target.value.replace(/\D/g, ""));
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
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select province</option>
                {provinceOptions.map((option) => (
                  <option
                    key={`${option.id}-${option.value}`}
                    value={option.value}
                  >
                    {option.value}
                  </option>
                ))}
              </select>
              <select
                value={formValue.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!formValue.province}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select district</option>
                {districtOptions.map((option) => (
                  <option
                    key={`${option.id}-${option.value}`}
                    value={option.value}
                  >
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
              <select
                value={formValue.subDistrict}
                onChange={(e) => handleSubDistrictChange(e.target.value)}
                disabled={!formValue.district}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select sub-district</option>
                {subDistrictOptions.map((option) => (
                  <option
                    key={`${option.id}-${option.value}`}
                    value={option.value}
                  >
                    {option.value}
                  </option>
                ))}
              </select>
              <select
                value={formValue.postalCode}
                onChange={(e) =>
                  setFormValue((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                disabled={!formValue.subDistrict || postalCodeOptions.length === 0}
                className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="">Select postal code</option>
                {postalCodeOptions.map((option) => (
                  <option key={`${option.id}-${option.value}`} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
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
            <Button
              type="submit"
              className="rounded-full bg-gradient-to-r from-main to-second px-5 py-1.5 text-base font-medium text-white"
            >
              Save Change
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
