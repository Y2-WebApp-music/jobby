import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { SearchSelect } from "@/components/ui/search-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

function ShowCaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function ShowCase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState<string>("");
  const [searchSelectValue, setSearchSelectValue] = useState<string>("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    new Date(),
  );
  const [radioValue, setRadioValue] = useState("option-a");
  const [checked, setChecked] = useState(false);

  const multiSelectOptions = [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Angular", value: "angular" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Design System — UI Components
          </h1>
          <p className="mt-2 text-muted-foreground">
            All components from{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              src/components/ui/
            </code>
          </p>
        </header>

        <ShowCaseSection title="Button">
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="outline_gradient">Outline Gradient</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Search />
            </Button>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Button Group">
          <div className="flex flex-wrap items-start gap-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Horizontal</p>
              <ButtonGroup>
                <Button variant="outline">One</Button>
                <Button variant="outline">Two</Button>
                <Button variant="outline">Three</Button>
              </ButtonGroup>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">With separator</p>
              <ButtonGroup>
                <Button variant="outline">Save</Button>
                <ButtonGroupSeparator />
                <Button variant="outline">Export</Button>
              </ButtonGroup>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">With text</p>
              <ButtonGroup>
                <ButtonGroupText>Sort:</ButtonGroupText>
                <Button variant="outline" size="sm">
                  A–Z
                </Button>
                <Button variant="outline" size="sm">
                  Z–A
                </Button>
              </ButtonGroup>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Vertical</p>
              <ButtonGroup orientation="vertical">
                <Button variant="secondary">First</Button>
                <Button variant="secondary">Second</Button>
                <Button variant="secondary">Third</Button>
              </ButtonGroup>
            </div>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Input">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="showcase-input">Label</Label>
            <Input id="showcase-input" placeholder="Placeholder text" />
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Textarea">
          <Textarea
            placeholder="Enter description..."
            rows={3}
            className="max-w-md"
          />
        </ShowCaseSection>

        <ShowCaseSection title="Label">
          <div className="flex flex-wrap gap-6">
            <Label htmlFor="l1">Standalone label</Label>
            <Label className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={checked}
                onCheckedChange={(v) => setChecked(!!v)}
              />
              Accept terms
            </Label>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Checkbox & Radio">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-2">
              <Checkbox id="c1" />
              <Label htmlFor="c1">Checkbox</Label>
            </div>
            <RadioGroup value={radioValue} onValueChange={setRadioValue}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-a" id="r1" />
                <Label htmlFor="r1">Option A</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-b" id="r2" />
                <Label htmlFor="r2">Option B</Label>
              </div>
            </RadioGroup>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Select">
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectContent>
          </Select>
        </ShowCaseSection>

        <ShowCaseSection title="Search Select">
          <SearchSelect
            options={[
              { value: "apple", label: "Apple" },
              { value: "banana", label: "Banana" },
              { value: "orange", label: "Orange" },
              { value: "grape", label: "Grape" },
              { value: "mango", label: "Mango" },
            ]}
            value={searchSelectValue}
            onValueChange={setSearchSelectValue}
            placeholder="Pick one (searchable)"
            searchPlaceholder="Search fruits..."
          />
        </ShowCaseSection>

        <ShowCaseSection title="Multi-Select">
          <MultiSelect
            options={multiSelectOptions}
            value={multiSelectValue}
            onValueChange={setMultiSelectValue}
            placeholder="Select frameworks"
            maxDisplay={2}
          />
        </ShowCaseSection>

        <ShowCaseSection title="Field (form group)">
          <FieldSet className="max-w-sm space-y-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="you@example.com" />
              <FieldDescription>We'll never share your email.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>With error</FieldLabel>
              <Input aria-invalid placeholder="Invalid input" />
              <FieldError>This field is required.</FieldError>
            </Field>
          </FieldSet>
        </ShowCaseSection>

        <ShowCaseSection title="Input Group">
          <InputGroup className="max-w-md rounded-lg border border-border bg-transparent">
            <InputGroupAddon align="inline-start">
              <span className="text-muted-foreground text-sm">https://</span>
            </InputGroupAddon>
            <InputGroupInput placeholder="example.com" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Search</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </ShowCaseSection>

        <ShowCaseSection title="Card">
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Short description for the card.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card content goes here. You can use CardFooter for actions.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </ShowCaseSection>

        <ShowCaseSection title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Tabs">
          <Tabs defaultValue="tab1" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content for tab 1.</TabsContent>
            <TabsContent value="tab2">Content for tab 2.</TabsContent>
            <TabsContent value="tab3">Content for tab 3.</TabsContent>
          </Tabs>
          <p className="text-muted-foreground text-sm">Line variant:</p>
          <Tabs defaultValue="line1" className="w-full max-w-md">
            <TabsList variant="line">
              <TabsTrigger value="line1">Line 1</TabsTrigger>
              <TabsTrigger value="line2">Line 2</TabsTrigger>
            </TabsList>
            <TabsContent value="line1">Line tab content 1.</TabsContent>
            <TabsContent value="line2">Line tab content 2.</TabsContent>
          </Tabs>
        </ShowCaseSection>

        <ShowCaseSection title="Separator">
          <div className="space-y-2">
            <p className="text-sm">Content above</p>
            <Separator />
            <p className="text-sm">Content below</p>
            <Separator
              orientation="vertical"
              className="mx-2 inline-block h-8"
            />
            <span className="text-sm">Vertical separator in line</span>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Dialog">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogDescription>
                  Optional description for the dialog. It can span multiple
                  lines.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ShowCaseSection>

        <ShowCaseSection title="Alert Dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ShowCaseSection>

        <ShowCaseSection title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowCaseSection>

        <ShowCaseSection title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium">Popover title</h4>
                <p className="text-muted-foreground text-sm">
                  Popover content. Often used for filters or extra controls.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </ShowCaseSection>

        <ShowCaseSection title="Calendar">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {calendarDate
                  ? calendarDate.toLocaleDateString()
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </ShowCaseSection>

        <ShowCaseSection title="Command (command palette)">
          <Command className="max-w-md rounded-lg border border-border">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search</CommandItem>
                <CommandItem>Settings</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </ShowCaseSection>

        <ShowCaseSection title="Carousel">
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {["Slide 1", "Slide 2", "Slide 3"].map((label, i) => (
                <CarouselItem key={i}>
                  <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted/50 p-6">
                    {label}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </ShowCaseSection>

        <ShowCaseSection title="Pagination">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </ShowCaseSection>

        <ShowCaseSection title="Spinner">
          <div className="flex items-center gap-4">
            <Spinner className="size-6" />
            <Spinner className="size-8" />
            <Spinner className="size-10 text-muted-foreground" />
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Skeleton">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            </div>
            <Card className="max-w-sm">
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          </div>
        </ShowCaseSection>

        <ShowCaseSection title="Sonner (toast)">
          <p className="text-muted-foreground text-sm">
            Ensure{" "}
            <code className="rounded bg-muted px-1 py-0.5">{`<Toaster />`}</code>{" "}
            is in your app root.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Success message")}
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error("Error message")}
            >
              Error toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning("Warning message")}
            >
              Warning toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Info message")}
            >
              Info toast
            </Button>
            <Button variant="outline" onClick={() => toast("Default toast")}>
              Default toast
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.promise<{ name: string }>(
                  () =>
                    new Promise((resolve) =>
                      setTimeout(() => resolve({ name: "Event" }), 2000),
                    ),
                  {
                    loading: "Loading...",
                    success: (data) => `${data.name} has been created`,
                    error: "Error",
                  },
                );
              }}
            >
              Promise
            </Button>
          </div>
        </ShowCaseSection>
      </div>
      <Toaster />
    </div>
  );
}
