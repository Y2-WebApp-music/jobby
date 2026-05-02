import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ExamDialog from "@/features/profile/dialog/ExamDialog";
import { ImportResumeDialog } from "@/features/resume/dialogs/ImportResumeDialog";
import { useAuthStore } from "@/store/auth";
import { getSkillExam } from "@/types/skillExam";
import { profileSkillCatalog } from "@/types/skill";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type RegisterStep = 1 | 2 | 3 | 4;
type RegisterFieldName =
  | "email"
  | "password"
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "region"
  | "tel";
type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;

const inputClassName =
  "h-10 rounded-lg border-[#e6e6e6] bg-white px-4 text-[13px] shadow-none placeholder:text-[#b8b8b8]";

const sanitizeLetters = (value: string) =>
  value.replace(/[^\p{L}\s'-]/gu, "");

const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

const registerRegionOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const [step, setStep] = useState<RegisterStep>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [region, setRegion] = useState("");
  const [regionOpen, setRegionOpen] = useState(false);
  const [tel, setTel] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [importResumeOpen, setImportResumeOpen] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [pendingExamSkillName, setPendingExamSkillName] = useState<string | null>(
    null,
  );

  const matchedSkills = useMemo(() => {
    const keyword = skillQuery.trim().toLowerCase();
    if (!keyword) return [];

    return profileSkillCatalog
      .map((item) => item.name)
      .filter((name) => name.toLowerCase().includes(keyword))
      .filter(
        (name, index, all) =>
          all.findIndex((item) => item.toLowerCase() === name.toLowerCase()) ===
          index,
      )
      .slice(0, 6);
  }, [skillQuery]);

  const resolveSkillFromQuery = () => {
    const keyword = skillQuery.trim().toLowerCase();
    if (!keyword) return null;

    const exactMatch = profileSkillCatalog.find(
      (item) => item.name.toLowerCase() === keyword,
    );
    const fuzzyMatch =
      exactMatch ??
      profileSkillCatalog.find((item) =>
        item.name.toLowerCase().includes(keyword),
      );

    return fuzzyMatch?.name ?? null;
  };

  const applySkillSelection = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.some((item) => item.toLowerCase() === skillName.toLowerCase())
        ? prev
        : [...prev, skillName],
    );
    setSkillQuery("");
    setStep(4);
  };

  const addSkillFromQuery = () => {
    const matchedSkillName = resolveSkillFromQuery();
    if (!matchedSkillName) return;

    if (getSkillExam(matchedSkillName)) {
      setPendingExamSkillName(matchedSkillName);
      return;
    }

    applySkillSelection(matchedSkillName);
  };

  const completeMockRegister = () => {
    setUser({
      id: "demo-register-user",
      name:
        [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") ||
        "New Explorer",
      email: email.trim() || "email",
      role: "jobseeker",
      permissions: [],
    });
    setToken("demo-register-token");
    navigate("/profile");
  };

  const handleJoinStep = () => {
    const nextErrors: RegisterFieldErrors = {
      email: email.trim() ? "" : "Please enter your email.",
      password: password.trim() ? "" : "Please enter your password.",
    };

    setFieldErrors((prev) => ({ ...prev, ...nextErrors }));

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    if (!acceptTerms) {
      setTermsError("Please accept terms and condition before continuing.");
      return;
    }

    setTermsError("");
    setStep(2);
  };

  const handleProfileStepContinue = () => {
    const nextErrors: RegisterFieldErrors = {
      firstName: firstName.trim() ? "" : "Please enter your first name.",
      lastName: lastName.trim() ? "" : "Please enter your last name.",
      dateOfBirth: dateOfBirth ? "" : "Please select your date of birth.",
      region: region.trim() ? "" : "Please select your region.",
      tel: tel.trim() ? "" : "Please enter your phone number.",
    };

    setFieldErrors((prev) => ({ ...prev, ...nextErrors }));

    if (
      nextErrors.firstName ||
      nextErrors.lastName ||
      nextErrors.dateOfBirth ||
      nextErrors.region ||
      nextErrors.tel
    ) {
      return;
    }

    setStep(3);
  };

  return (
    <div className="w-full">
      {step === 1 ? (
        <div className="space-y-4">
          <h1 className="text-center text-[18px] font-medium text-[#171717]">
            Be New Explorer
          </h1>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[14px] font-medium text-[#3b3b3b]">Email</label>
              <Input
                type="email"
                placeholder="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                className={inputClassName}
              />
              {fieldErrors.email ? (
                <p className="text-[12px] font-medium text-[#ff4d4f]">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-[14px] font-medium text-[#3b3b3b]">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  className={`${inputClassName} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#9a9a9a] transition-colors hover:text-[#6f6f6f]"
                >
                  {showPassword ? (
                    <IoMdEyeOff className="size-4" />
                  ) : (
                    <IoMdEye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-[12px] font-medium text-[#ff4d4f]">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-start gap-2 text-[14px] font-medium text-[#171717]">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  const nextValue = Boolean(checked);
                  setAcceptTerms(nextValue);
                  if (nextValue) {
                    setTermsError("");
                  }
                }}
                className="mt-0.5"
              />
              <span>Accept terms and condition</span>
            </label>
            <p className="pl-6 text-[12px] text-[#b0b0b0]">
              You agree to our Terms of Service and Privacy Policy.
            </p>
            {termsError ? (
              <p className="pl-6 text-[12px] font-medium text-[#ff4d4f]">
                {termsError}
              </p>
            ) : null}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={handleJoinStep}
              className="h-10 min-w-[102px] rounded-full px-8 text-[15px] font-medium text-white"
            >
              Join
            </Button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#7b7b7b]">
            <div className="h-px flex-1 bg-[#cfcfcf]" />
            <span>or</span>
            <div className="h-px flex-1 bg-[#cfcfcf]" />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#dadada] bg-white px-4 text-[14px] font-medium text-[#6f6f6f] transition-colors hover:bg-[#f8f8f8]"
            >
              <FcGoogle className="size-4" />
              Continue with Google
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <h1 className="text-center text-[18px] font-medium text-[#171717]">
            We want to know you!
          </h1>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[14px] font-medium text-[#3b3b3b]">
                First Name
              </label>
              <Input
                value={firstName}
                onChange={(event) => {
                  setFirstName(sanitizeLetters(event.target.value));
                  if (fieldErrors.firstName) {
                    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                  }
                }}
                className={inputClassName}
              />
              {fieldErrors.firstName ? (
                <p className="text-[12px] font-medium text-[#ff4d4f]">
                  {fieldErrors.firstName}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-[14px] font-medium text-[#3b3b3b]">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(event) => {
                  setLastName(sanitizeLetters(event.target.value));
                  if (fieldErrors.lastName) {
                    setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                  }
                }}
                className={inputClassName}
              />
              {fieldErrors.lastName ? (
                <p className="text-[12px] font-medium text-[#ff4d4f]">
                  {fieldErrors.lastName}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[14px] font-medium text-[#3b3b3b]">
                  Date of birth
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-[#e6e6e6] bg-white px-4 text-left text-[13px] text-[#171717]"
                    >
                      <span>
                        {dateOfBirth ? format(dateOfBirth, "dd MMM yyyy") : "Select date"}
                      </span>
                      <IoChevronDown className="size-4 text-[#7d7d7d]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto border-0 p-0 shadow-none"
                  >
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      disabled={{ after: new Date() }}
                      onSelect={(date) => {
                        setDateOfBirth(date);
                        if (date) {
                          setFieldErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                        }
                        setCalendarOpen(false);
                      }}
                      captionLayout="dropdown"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.dateOfBirth ? (
                  <p className="text-[12px] font-medium text-[#ff4d4f]">
                    {fieldErrors.dateOfBirth}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-medium text-[#3b3b3b]">
                  Regions
                </label>
                <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-[#e6e6e6] bg-white px-4 text-left text-[13px] text-[#171717]"
                    >
                      <span className={region ? "" : "text-[#b8b8b8]"}>
                        {region || "Select region"}
                      </span>
                      <IoChevronDown className="size-4 text-[#7d7d7d]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) rounded-xl border border-[#ececec] p-1"
                  >
                    <div className="max-h-72 space-y-1 overflow-y-auto">
                      {registerRegionOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setRegion(option);
                            setFieldErrors((prev) => ({ ...prev, region: "" }));
                            setRegionOpen(false);
                          }}
                          className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-[13px] text-[#171717] transition-colors hover:bg-[#f7f7f7]"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {fieldErrors.region ? (
                  <p className="text-[12px] font-medium text-[#ff4d4f]">
                    {fieldErrors.region}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-medium text-[#3b3b3b]">
                  Tel.
                </label>
                <Input
                  value={tel}
                  onChange={(event) => {
                    setTel(sanitizeDigits(event.target.value).slice(0, 15));
                    if (fieldErrors.tel) {
                      setFieldErrors((prev) => ({ ...prev, tel: "" }));
                    }
                  }}
                  inputMode="numeric"
                  className={inputClassName}
                />
                {fieldErrors.tel ? (
                  <p className="text-[12px] font-medium text-[#ff4d4f]">
                    {fieldErrors.tel}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline_gradient"
              onClick={() => setImportResumeOpen(true)}
              className="rounded-full px-6 text-[14px] font-medium"
            >
              Import Resume/CV
            </Button>

            <Button
              type="button"
              onClick={handleProfileStepContinue}
              className="rounded-full px-8 text-[15px] font-medium text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-center text-[18px] font-medium text-[#171717]">
              Add Skill
            </h1>
            <p className="mx-auto max-w-[420px] text-center text-[14px] leading-5 text-[#8d8d8d]">
              Add relevant skills to highlight your strengths
              and help employers find you faster.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[14px] font-medium text-[#3b3b3b]">
              Search Skill
            </label>
            <Input
              value={skillQuery}
              placeholder="React..."
              onChange={(event) => setSkillQuery(event.target.value)}
              className={inputClassName}
            />
          </div>

          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSkillQuery(skill)}
                  className="cursor-pointer rounded-full border border-transparent px-3 py-1 text-xs text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box] hover:opacity-90"
                >
                  {skill}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(4)}
              className="rounded-full border-[#d8d8d8] px-6 text-[14px] font-medium text-[#7c7c7c]"
            >
              Skip
            </Button>

            <Button
              type="button"
              onClick={addSkillFromQuery}
              className="rounded-full px-8 text-[15px] font-medium text-white"
            >
              + Add Skill
            </Button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-center text-[18px] font-medium text-[#171717]">
              Add Skill
            </h1>
            <p className="mx-auto max-w-[460px] text-center text-[14px] leading-5 text-[#8d8d8d]">
              Add relevant skills to highlight your strengths
              and help employers find you faster.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-medium text-[#171717]">Your skills</h2>
            <div className="flex min-h-12 flex-wrap gap-2">
              {selectedSkills.length > 0 ? (
                selectedSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="rounded-full border border-transparent px-4 py-1 text-m leading-none text-primary-pink [background:linear-gradient(var(--color-background),var(--color-background))_padding-box,linear-gradient(to_right,var(--color-main),var(--color-second))_border-box]"
                  >
                    {skill}
                  </button>
                ))
              ) : (
                <span className="text-sm text-[#9a9a9a]">No skills selected yet.</span>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-full px-8 text-[15px] font-medium text-white"
            >
              + Add Skill
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={completeMockRegister}
              className="rounded-full px-8 text-[15px] font-medium text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      <ImportResumeDialog
        open={importResumeOpen}
        onOpenChange={setImportResumeOpen}
      />

      <ExamDialog
        open={Boolean(pendingExamSkillName)}
        skillName={pendingExamSkillName}
        onClose={() => setPendingExamSkillName(null)}
        onPass={(skillName) => {
          setPendingExamSkillName(null);
          applySkillSelection(skillName);
        }}
      />
    </div>
  );
}
