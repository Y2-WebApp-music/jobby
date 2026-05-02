import { createExamQuestions, type ExamQuestionSeed } from "./examQuestion";

const seeds: ExamQuestionSeed[] = [
  {
    prompt: "What best describes a Ke mou person?",
    choices: [
      "A person who exaggerates achievements",
      "A person who asks thoughtful questions",
      "A person who avoids all meetings",
      "A person who writes careful reports",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which resume line is the riskiest example of Ke mou behavior?",
    choices: [
      "Worked with a team on a feature launch",
      "Led the entire company alone in one month",
      "Improved page speed by 8%",
      "Supported a migration project",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What is the best way to describe your contribution?",
    choices: [
      "Use specific and factual details",
      "Make it sound larger than it was",
      "Claim the whole result",
      "Skip all numbers",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why is boasting harmful in a team?",
    choices: [
      "It makes code compile slower",
      "It damages trust",
      "It improves communication",
      "It reduces follow-up questions",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "In an interview, which answer is safest?",
    choices: [
      "Share a real example and your measurable part",
      "Claim you mastered everything",
      "Say you never needed help",
      "Use only vague success words",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you are asked about a topic you barely know, what is best?",
    choices: [
      "Pretend to be an expert",
      "Admit limited experience and willingness to learn",
      "Change the topic",
      "Blame the interviewer",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Ke mou behavior in a standup often sounds like:",
    choices: [
      "I fixed a typo",
      "I personally saved the whole release by myself",
      "I need help with a blocker",
      "The ticket is still in review",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What builds credibility over time?",
    choices: [
      "Consistent delivery",
      "Big claims every week",
      "Hiding mistakes",
      "Taking all the credit",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Someone notices you exaggerated. What should you do next?",
    choices: [
      "Double down on the story",
      "Correct the statement",
      "Blame another teammate",
      "Change the subject immediately",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Healthy confidence is different from boasting because it is:",
    choices: [
      "Backed by evidence",
      "Louder",
      "More dramatic",
      "Harder to verify",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "When presenting results, what should you include?",
    choices: [
      "Actual numbers and team credit",
      "Only emotional language",
      "A heroic story without proof",
      "The biggest possible claim",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Ke mou behavior often ignores:",
    choices: [
      "Facts",
      "Meetings",
      "Deadlines",
      "Keyboard shortcuts",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which portfolio line sounds strongest?",
    choices: [
      "Built the internet from scratch",
      "Explained what you actually built and why",
      "Claimed every project alone",
      "Skipped technical detail entirely",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Why should you give the team credit?",
    choices: [
      "It shows honesty and collaboration",
      "It makes your role disappear",
      "It reduces trust",
      "It weakens every result",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you made a minor bug fix, what should you avoid saying?",
    choices: [
      "I fixed a login bug in the modal",
      "I saved the entire platform single-handedly",
      "I tested the patch before merge",
      "I paired with another developer",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What is a good form of self-promotion?",
    choices: [
      "Highlighting outcomes without distortion",
      "Adding drama to every task",
      "Claiming solo ownership of team work",
      "Skipping all context",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is exaggeration?",
    choices: [
      "Making something seem bigger than it is",
      "Giving exact scope",
      "Quoting a verified metric",
      "Sharing a limitation",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If a manager praises you for a team win, what is a solid response?",
    choices: [
      "Accept politely and acknowledge the team",
      "Say you did all of it yourself",
      "Add more achievements that did not happen",
      "Use the moment to boast further",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the fastest way to lose trust?",
    choices: [
      "Ask a clarifying question",
      "Repeated inflated claims",
      "Share a measured result",
      "Credit a teammate",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "During a retrospective, what should you share?",
    choices: [
      "A lesson learned and the real impact",
      "A grand story with no detail",
      "Only your own success",
      "Nothing but compliments",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which statement sounds the most credible?",
    choices: [
      "I improved load time by 12%",
      "I am the best engineer alive",
      "Everything succeeded because of me",
      "I can do anything instantly",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Boasting often grows from a need for:",
    choices: [
      "Attention or approval",
      "Better documentation",
      "Slower meetings",
      "More testing",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "You realize your own claim was inflated. What should happen?",
    choices: [
      "Revise it to the accurate version",
      "Repeat it more strongly",
      "Delete all evidence",
      "Say details do not matter",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Metrics in a presentation should:",
    choices: [
      "Support your statement",
      "Be invented for effect",
      "Sound dramatic only",
      "Replace all explanation",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A Ke mou interview answer often includes:",
    choices: [
      "Vague grand stories",
      "Clear scope and result",
      "Measured trade-offs",
      "Specific team context",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What habit helps prevent Ke mou behavior?",
    choices: [
      "Keeping records of real results",
      "Adding more adjectives",
      "Speaking before checking",
      "Avoiding all metrics",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which LinkedIn headline sounds strongest?",
    choices: [
      "Honest role and relevant strengths",
      "World-changing genius of every domain",
      "Greatest builder in history",
      "Owner of all success everywhere",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why do specifics matter?",
    choices: [
      "They can be verified",
      "They sound more dramatic",
      "They hide the truth",
      "They remove teamwork",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you only helped partly, what should you say?",
    choices: [
      "I supported that part of the project",
      "I carried the whole company",
      "I did everything alone",
      "The team was not needed",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Professional etiquette encourages:",
    choices: [
      "Modest and accurate communication",
      "Larger and louder claims",
      "Ignoring the facts",
      "Talking over teammates",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which is a red flag in a big claim?",
    choices: [
      "The person cannot explain the details",
      "The person names collaborators",
      "The person shows a dashboard",
      "The person discusses trade-offs",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "When asked about failure, which response is strongest?",
    choices: [
      "Describe the mistake and what you learned",
      "Claim you have never failed",
      "Blame everyone else",
      "Change the story to a win",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What makes bragging obvious?",
    choices: [
      "No evidence and too much drama",
      "A real metric with context",
      "A small but clear contribution",
      "An honest limit",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Real leadership usually includes:",
    choices: [
      "Crediting others and owning outcomes",
      "Taking all attention",
      "Claiming every idea alone",
      "Never admitting uncertainty",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If a team used a shared solution, what should you avoid claiming?",
    choices: [
      "That it was a collaborative effort",
      "That you alone invented everything",
      "That you implemented one module",
      "That you reviewed part of the change",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What is a better phrase than 'I am the best'?",
    choices: [
      "Here is what I delivered",
      "Nobody compares to me",
      "I never need help",
      "I always outperform the team",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Trust grows when your words match your:",
    choices: [
      "Actions",
      "Volume",
      "Ego",
      "Excuses",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Why should resumes avoid inflated titles?",
    choices: [
      "The mismatch appears quickly",
      "It makes interviews shorter",
      "It guarantees higher pay",
      "It removes follow-up questions",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the best kind of self-introduction?",
    choices: [
      "Short, accurate, and outcome-based",
      "Huge, dramatic, and unsupported",
      "Only praise without examples",
      "All claims and no detail",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the opposite of Ke mou behavior?",
    choices: [
      "Grounded honesty",
      "Louder exaggeration",
      "Bigger promises",
      "Flashier language",
    ],
    correctAnswer: 0,
  },
];

export const questionKeMou = createExamQuestions("ke-mou", seeds);
