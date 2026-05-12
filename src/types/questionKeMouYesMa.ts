import { createExamQuestions, type ExamQuestionSeed } from "./examQuestion";

const seeds: ExamQuestionSeed[] = [
  {
    prompt: "What best describes Ke mou yes ma behavior?",
    choices: [
      "Boasting so much that it becomes unbelievable",
      "Giving calm and accurate updates",
      "Asking careful clarifying questions",
      "Keeping records of progress",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which example sounds like Ke mou yes ma?",
    choices: [
      "I helped test one feature",
      "I built a nationwide system in one afternoon",
      "I joined a code review",
      "I updated the documentation",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What is the first problem with unbelievable boasting?",
    choices: [
      "People stop believing the speaker",
      "Meetings become shorter",
      "Documentation improves",
      "Risk disappears",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you made an impossible claim, what should you do next?",
    choices: [
      "Correct it with realistic details",
      "Repeat it more loudly",
      "Blame the listener",
      "Add even bigger numbers",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why is Ke mou yes ma worse than normal boasting?",
    choices: [
      "It destroys credibility faster",
      "It improves confidence",
      "It removes all doubt",
      "It makes teamwork easier",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "In an interview, an unbelievable claim usually triggers:",
    choices: [
      "Follow-up questions you cannot support",
      "Automatic trust",
      "No discussion at all",
      "A guaranteed offer",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the best way to sound truly expert?",
    choices: [
      "Explain the process clearly",
      "Promise impossible outcomes",
      "Avoid all specifics",
      "Say you know everything",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which sentence sounds unrealistic?",
    choices: [
      "I improved one workflow with the team",
      "I never make mistakes and doubled every revenue stream alone",
      "I supported a migration with tests",
      "I reduced ticket time by 9%",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "When a story feels too grand, what should be added?",
    choices: [
      "Scope, context, and evidence",
      "More dramatic words",
      "A bigger promise",
      "Less detail",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Ke mou yes ma behavior usually ignores:",
    choices: ["Plausibility", "Spelling", "Color contrast", "Keyboard layout"],
    correctAnswer: 0,
  },
  {
    prompt:
      "A teammate shares an impossible metric. What is the best reaction?",
    choices: [
      "Ask for the source and details respectfully",
      "Believe it instantly",
      "Add your own bigger story",
      "Send it to everyone as fact",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Credibility usually comes from:",
    choices: [
      "Consistency and proof",
      "Huge claims only",
      "Talking the longest",
      "Avoiding questions",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you led one module, what should you avoid saying?",
    choices: [
      "I created the entire internet stack",
      "I owned one module in the release",
      "I paired with two teammates",
      "I handled the tests for my area",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What makes a claim believable?",
    choices: [
      "Exact role and numbers",
      "Louder confidence",
      "Bigger adjectives",
      "No limits at all",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why does a perfect heroic story often fail?",
    choices: [
      "Real work usually has trade-offs and limits",
      "Teams prefer less detail",
      "Managers dislike results",
      "Metrics are never useful",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A healthy interview answer often includes:",
    choices: [
      "Limitations and learning",
      "Impossible perfection",
      "No context",
      "Only superlatives",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "How can unbelievable boasting hurt a team?",
    choices: [
      "Others stop trusting updates",
      "It improves estimation",
      "It reduces blockers",
      "It strengthens planning",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the best correction after overclaiming?",
    choices: [
      "Apologize and restate the facts",
      "Remove all context",
      "Say people misunderstood",
      "Double the story",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What kind of question often exposes fake expertise?",
    choices: [
      "How did you make that decision?",
      "What is your favorite color?",
      "Do you like meetings?",
      "When is lunch?",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which habit helps prevent extreme exaggeration?",
    choices: [
      "Verify every claim before sharing it",
      "Talk faster than anyone else",
      "Avoid evidence completely",
      "Use larger and larger numbers",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A product pitch should match the:",
    choices: [
      "Actual stage of the product",
      "Biggest fantasy version",
      "Most dramatic dream",
      "Least realistic promise",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you used a template, what should you avoid claiming?",
    choices: [
      "That you invented the entire framework from scratch",
      "That you adapted an existing template",
      "That you customized the layout",
      "That you improved the final output",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the strongest portfolio proof?",
    choices: [
      "Real project artifacts",
      "Huge unsupported statements",
      "Claims without screenshots",
      "No details at all",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "How do recruiters usually test giant claims?",
    choices: [
      "They ask for specifics",
      "They always believe them",
      "They skip the topic",
      "They avoid follow-up questions",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What happens when every story sounds heroic?",
    choices: [
      "The audience starts doubting all of them",
      "Trust becomes automatic",
      "The stories become more accurate",
      "No one checks the details",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Believable confidence relies on:",
    choices: [
      "Examples and evidence",
      "Impossible certainty",
      "Huge exaggeration",
      "No documentation",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which statement sounds the most realistic?",
    choices: [
      "I supported deployment for one service",
      "I ran every cloud system on earth",
      "I solved all outages instantly forever",
      "I never needed any teammates",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Ke mou yes ma communication often feels:",
    choices: [
      "Dramatic and impossible",
      "Measured and precise",
      "Quiet and careful",
      "Documented and grounded",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why should numbers be checked before sharing them?",
    choices: [
      "Inflated numbers are easy to spot",
      "They always look smaller",
      "They remove context automatically",
      "They make stories less interesting",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If your claim covers company-wide impact, what should you do?",
    choices: [
      "Explain the exact contribution and scope",
      "Say the details are not important",
      "Take full credit for all teams",
      "Make the outcome even bigger",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What turns confidence into fantasy?",
    choices: [
      "Removing limits and evidence",
      "Showing the actual scope",
      "Giving team credit",
      "Explaining trade-offs",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the best way to introduce a big success?",
    choices: [
      "Mention the team, context, and actual outcome",
      "Say you did it alone in secret",
      "Skip numbers and timelines",
      "Promise it was perfect",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Unbelievable boasting usually collapses when:",
    choices: [
      "Details are requested",
      "No one is listening",
      "The room is quiet",
      "The meeting ends",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is safer than making a huge promise?",
    choices: [
      "Setting a realistic expectation",
      "Adding more dramatic language",
      "Avoiding all constraints",
      "Claiming guaranteed perfection",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If a project lasted six months, what should you avoid saying?",
    choices: [
      "I finished it overnight alone",
      "It took six months with the team",
      "I owned one important part",
      "The project had several phases",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why do teams avoid extreme exaggerators?",
    choices: [
      "Their updates become unreliable",
      "Their slides look too clean",
      "They ask too many useful questions",
      "They document everything clearly",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What do honest experts usually say?",
    choices: [
      "What they know and what they still need to learn",
      "That they know everything already",
      "That no one else matters",
      "That every task is easy for them",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the strongest antidote to Ke mou yes ma behavior?",
    choices: [
      "Fact-based communication",
      "Even larger promises",
      "More dramatic storytelling",
      "Skipping verification",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you improved one KPI slightly, what is the best phrasing?",
    choices: [
      "Mention the true percentage and timeframe",
      "Say you transformed the whole market",
      "Claim a miracle result",
      "Leave out the baseline",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Long-term reputation is built by:",
    choices: [
      "Accurate delivery over time",
      "The biggest story in the room",
      "Perfect-sounding promises",
      "Ignoring all follow-up questions",
    ],
    correctAnswer: 0,
  },
];

export const questionKeMouYesMa = createExamQuestions("ke-mou-yes-ma", seeds);
