export type SkillCatalogItem = {
  name: string;
  description: string;
  preSkills: string[];
  categories: string[];
};

const baseProfileSkillCatalog: SkillCatalogItem[] = [
  {
    name: "React",
    description:
      "Build modern interactive user interfaces with reusable components and predictable state management.",
    preSkills: ["JavaScript (ES6+)", "TypeScript Basics", "Component Thinking"],
    categories: ["Front-End", "Web Development"],
  },
  {
    name: "Front-End",
    description:
      "Create responsive and accessible interfaces focused on user experience and performance.",
    preSkills: ["HTML5", "CSS3", "Responsive Design"],
    categories: ["Web Development", "UI"],
  },
  {
    name: "Node.JS",
    description:
      "Develop scalable backend services and APIs using JavaScript runtime on the server.",
    preSkills: ["JavaScript Async", "NPM Ecosystem", "REST API Design"],
    categories: ["Back-End", "Server"],
  },
  {
    name: "express",
    description:
      "Build HTTP APIs quickly with middleware-based architecture on top of Node.js.",
    preSkills: ["Node.JS", "Middleware Concept", "HTTP Fundamentals"],
    categories: ["Back-End", "API"],
  },
  {
    name: "TypeScript",
    description:
      "Write safer JavaScript with static typing for better maintainability and tooling.",
    preSkills: ["JavaScript", "Type System Basics", "Interfaces & Generics"],
    categories: ["Language", "Web Development"],
  },
  {
    name: "SQL",
    description:
      "Manage and query relational data with structured queries and optimization concepts.",
    preSkills: ["Relational Database Basics", "Data Modeling", "JOIN Concepts"],
    categories: ["Database", "Data"],
  },
  {
    name: "noSQL",
    description:
      "Handle flexible schema data models and distributed storage for modern applications.",
    preSkills: ["Document Data Modeling", "Indexing Basics", "CAP Trade-offs"],
    categories: ["Database", "Data"],
  },
  {
    name: "Keyes",
    description: "A person who always agrees with others.",
    preSkills: ["Active Listening", "Team Communication", "Constructive Feedback"],
    categories: ["Productivity", "Tooling"],
  },
  {
    name: "Kemou",
    description: "A person who boasts or exaggerates..",
    preSkills: ["Self-awareness", "Honest Communication", "Professional Etiquette"],
    categories: ["Collaboration", "Project"],
  },
  {
    name: "Ke mou yes ma",
    description: "boasts excessively, to the point of being unbelievable.",
    preSkills: ["Critical Thinking", "Fact-based Communication", "Credibility Building"],
    categories: ["Collaboration", "Execution"],
  },
];

const preSkillCatalog: SkillCatalogItem[] = [
  {
    name: "JavaScript (ES6+)",
    description: "Core JavaScript syntax and modern ES6+ features for application development.",
    preSkills: [],
    categories: ["Language", "Foundation"],
  },
  {
    name: "TypeScript Basics",
    description: "Basic static typing concepts used to build safer JavaScript applications.",
    preSkills: [],
    categories: ["Language", "Foundation"],
  },
  {
    name: "Component Thinking",
    description: "Design UI as reusable and composable components with clear responsibilities.",
    preSkills: [],
    categories: ["Front-End", "Foundation"],
  },
  {
    name: "HTML5",
    description: "Semantic markup structure for modern web pages and accessible content.",
    preSkills: [],
    categories: ["Web", "Foundation"],
  },
  {
    name: "CSS3",
    description: "Styling and layout techniques for responsive and modern interfaces.",
    preSkills: [],
    categories: ["Web", "Foundation"],
  },
  {
    name: "Responsive Design",
    description: "Build interfaces that adapt correctly across mobile, tablet, and desktop.",
    preSkills: [],
    categories: ["UI", "Foundation"],
  },
  {
    name: "JavaScript Async",
    description: "Asynchronous control flow with promises and async/await in JavaScript.",
    preSkills: [],
    categories: ["Language", "Back-End"],
  },
  {
    name: "NPM Ecosystem",
    description: "Package management and dependency workflow in the Node.js ecosystem.",
    preSkills: [],
    categories: ["Tooling", "Back-End"],
  },
  {
    name: "REST API Design",
    description: "Design resource-oriented APIs with clear contracts and status handling.",
    preSkills: [],
    categories: ["API", "Back-End"],
  },
  {
    name: "Middleware Concept",
    description: "Request pipeline processing pattern commonly used in server frameworks.",
    preSkills: [],
    categories: ["Back-End", "Foundation"],
  },
  {
    name: "HTTP Fundamentals",
    description: "Methods, status codes, headers, and request-response lifecycle basics.",
    preSkills: [],
    categories: ["Web", "Foundation"],
  },
  {
    name: "JavaScript",
    description: "General JavaScript programming fundamentals and syntax.",
    preSkills: [],
    categories: ["Language", "Foundation"],
  },
  {
    name: "Type System Basics",
    description: "Essential type concepts for safer and more predictable code.",
    preSkills: [],
    categories: ["Language", "Foundation"],
  },
  {
    name: "Interfaces & Generics",
    description: "Reusable typing patterns for scalable TypeScript codebases.",
    preSkills: [],
    categories: ["TypeScript", "Foundation"],
  },
  {
    name: "Relational Database Basics",
    description: "Table relationships, keys, and normalization fundamentals.",
    preSkills: [],
    categories: ["Database", "Foundation"],
  },
  {
    name: "Data Modeling",
    description: "Structuring entities and relationships for efficient data usage.",
    preSkills: [],
    categories: ["Database", "Data"],
  },
  {
    name: "JOIN Concepts",
    description: "Combining data across multiple tables using SQL join operations.",
    preSkills: [],
    categories: ["Database", "SQL"],
  },
  {
    name: "Document Data Modeling",
    description: "Schema strategy and document structure design for NoSQL systems.",
    preSkills: [],
    categories: ["Database", "NoSQL"],
  },
  {
    name: "Indexing Basics",
    description: "Index strategies to improve query performance and lookup speed.",
    preSkills: [],
    categories: ["Database", "Performance"],
  },
  {
    name: "CAP Trade-offs",
    description: "Consistency, availability, partition tolerance trade-offs in distributed systems.",
    preSkills: [],
    categories: ["Distributed Systems", "NoSQL"],
  },
  {
    name: "Active Listening",
    description: "Listening with intent to understand and respond effectively.",
    preSkills: [],
    categories: ["Soft Skill", "Collaboration"],
  },
  {
    name: "Team Communication",
    description: "Clear and constructive communication in team environments.",
    preSkills: [],
    categories: ["Soft Skill", "Collaboration"],
  },
  {
    name: "Constructive Feedback",
    description: "Giving and receiving feedback that helps improve outcomes.",
    preSkills: [],
    categories: ["Soft Skill", "Collaboration"],
  },
  {
    name: "Self-awareness",
    description: "Recognizing personal strengths, limits, and communication impact.",
    preSkills: [],
    categories: ["Soft Skill", "Professional"],
  },
  {
    name: "Honest Communication",
    description: "Transparent communication that builds trust and alignment.",
    preSkills: [],
    categories: ["Soft Skill", "Professional"],
  },
  {
    name: "Professional Etiquette",
    description: "Workplace behavior and communication standards for professional settings.",
    preSkills: [],
    categories: ["Soft Skill", "Professional"],
  },
  {
    name: "Critical Thinking",
    description: "Analyze claims and evidence before making decisions.",
    preSkills: [],
    categories: ["Soft Skill", "Problem Solving"],
  },
  {
    name: "Fact-based Communication",
    description: "Communicate using verifiable information and clear reasoning.",
    preSkills: [],
    categories: ["Soft Skill", "Professional"],
  },
  {
    name: "Credibility Building",
    description: "Build trust through reliable delivery and responsible communication.",
    preSkills: [],
    categories: ["Soft Skill", "Professional"],
  },
];

export const profileSkillCatalog: SkillCatalogItem[] = [
  ...baseProfileSkillCatalog,
  ...preSkillCatalog,
];

export const profileSkills = profileSkillCatalog.map((skill) => skill.name);
