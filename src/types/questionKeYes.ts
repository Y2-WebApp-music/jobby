import { createExamQuestions, type ExamQuestionSeed } from "./examQuestion";

const seeds: ExamQuestionSeed[] = [
  {
    prompt: "What best describes a Ke yes person?",
    choices: [
      "A person who checks facts before speaking",
      "A person who agrees quickly to avoid conflict",
      "A person who documents every task",
      "A person who asks many follow-up questions",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "In a planning meeting, a Ke yes teammate will most likely:",
    choices: [
      "Challenge the estimate with data",
      "Ask for more time to review",
      "Say yes before understanding the full request",
      "Break the work into smaller tasks",
    ],
    correctAnswer: 2,
  },
  {
    prompt: "What is the best response when you are unsure about a request?",
    choices: [
      "Agree immediately",
      "Ask clarifying questions first",
      "Stay silent and hope for the best",
      "Promise delivery by the end of the day",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Which habit helps reduce Ke yes behavior?",
    choices: [
      "Evaluating the facts before saying yes",
      "Copying what everyone else says",
      "Avoiding all discussion",
      "Waiting for others to choose for you",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Your manager asks for an impossible deadline. What is the healthy action?",
    choices: [
      "Say yes and panic later",
      "Ignore the request",
      "Discuss the constraints honestly",
      "Blame another team",
    ],
    correctAnswer: 2,
  },
  {
    prompt: "Why is constant agreement risky in a team?",
    choices: [
      "It hides real issues and concerns",
      "It makes meetings shorter",
      "It improves every estimate",
      "It removes all mistakes",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which action shows independent thinking?",
    choices: [
      "Repeating the loudest opinion",
      "Respectfully offering a different view",
      "Agreeing before the topic is explained",
      "Avoiding eye contact",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "A client request is unclear. What should happen first?",
    choices: [
      "Ask questions about the goal and scope",
      "Promise a fixed deadline immediately",
      "Say yes to keep the client happy",
      "Start building without confirmation",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "When a team needs honest feedback, a Ke yes person often:",
    choices: [
      "Offers careful critique",
      "Avoids saying anything negative",
      "Documents project risks",
      "Asks for examples",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What is a better alternative to automatic agreement?",
    choices: [
      "Say you need time to assess it",
      "Pretend you did not hear",
      "Pass the task to someone else",
      "Approve it without reading",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If you always say yes, coworkers may miss your:",
    choices: [
      "Job title",
      "Calendar invite",
      "Real concerns and warnings",
      "Coffee order",
    ],
    correctAnswer: 2,
  },
  {
    prompt: "Which soft skill helps avoid Ke yes behavior?",
    choices: [
      "Constructive feedback",
      "Blind loyalty",
      "Passive silence",
      "Instant approval",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "During code review, what is the best comment?",
    choices: [
      "Looks perfect without reading it",
      "This could break login because the null case is missing",
      "I agree with everything",
      "Whatever you want is fine",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "A Ke yes decision is usually made:",
    choices: [
      "After checking the impact",
      "Before checking the impact",
      "After looking at the metrics",
      "After asking the team",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Which statement is the healthiest?",
    choices: [
      "I agree with part of it, but I have one concern",
      "I support everything automatically",
      "I never disagree with anyone",
      "I will say yes even if it is risky",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Real collaboration requires:",
    choices: [
      "Honesty and discussion",
      "Constant praise only",
      "No questions at all",
      "Fast agreement without detail",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A friend asks for help at a bad time. What is best?",
    choices: [
      "Say yes and disappear later",
      "Set an honest boundary",
      "Blame another friend",
      "Turn off your phone",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Ke yes behavior in product discovery usually leads to:",
    choices: [
      "Stronger user research",
      "Better trade-off analysis",
      "Weak decisions because no one challenges them",
      "Faster validation",
    ],
    correctAnswer: 2,
  },
  {
    prompt: "Which reply is evidence-based?",
    choices: [
      "Let's check the data first",
      "I agree because everyone else does",
      "Sure, no need to verify",
      "Let's skip the review",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A supervisor proposes a risky release. What should you do?",
    choices: [
      "Agree and stay quiet",
      "Explain the risk and suggest mitigation",
      "Avoid the meeting",
      "Approve it without testing",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What does active listening mean?",
    choices: [
      "Waiting for your turn to agree",
      "Understanding before responding",
      "Writing nothing down",
      "Matching the loudest opinion",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What is the opposite of blind agreement?",
    choices: [
      "Thoughtful agreement after analysis",
      "Silent resistance",
      "Random disagreement",
      "Missing the meeting",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which meeting phrase shows backbone?",
    choices: [
      "Whatever works for everyone",
      "Can we look at another option?",
      "I agree before I hear the details",
      "I have no thoughts ever",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "Why might Ke yes behavior grow over time?",
    choices: [
      "Because the person wants approval",
      "Because the work is always easy",
      "Because data is always missing",
      "Because every deadline is realistic",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "In sprint planning, a realistic estimate should be based on:",
    choices: [
      "Hope",
      "Team capacity and scope",
      "What sounds impressive",
      "Whatever the client wants",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "What often happens when someone disagrees respectfully?",
    choices: [
      "The decision quality improves",
      "The team instantly fails",
      "The roadmap disappears",
      "Trust is impossible",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which action is not Ke yes behavior?",
    choices: [
      "Asking about trade-offs",
      "Agreeing without context",
      "Staying quiet about risks",
      "Approving vague work",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Requirements change often. What is the useful reply?",
    choices: [
      "Yes to everything",
      "Confirm the new priority and its impact",
      "Pretend nothing changed",
      "Promise all versions at once",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "A healthy team culture rewards:",
    choices: [
      "Honest questions",
      "Automatic agreement",
      "Silence in reviews",
      "Fake certainty",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "If a colleague dominates the discussion, a Ke yes person often:",
    choices: [
      "Nods along silently",
      "Requests supporting data",
      "Summarizes both sides",
      "Asks for user impact",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What is the best way to support an idea?",
    choices: [
      "Explain why it works",
      "Say yes as quickly as possible",
      "Avoid all evidence",
      "Use only emotion",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which is a warning sign of Ke yes behavior?",
    choices: [
      "Saying yes before hearing the details",
      "Asking one more question",
      "Reviewing the timeline",
      "Testing assumptions",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A task exceeds your skill level. What is the best response?",
    choices: [
      "Accept it and hide the struggle",
      "Ask for support or training",
      "Promise expert results immediately",
      "Say yes and ignore deadlines",
    ],
    correctAnswer: 1,
  },
  {
    prompt: "A responsible commitment means:",
    choices: [
      "Agreeing after you understand the effort",
      "Approving everything instantly",
      "Saying yes to avoid discomfort",
      "Leaving the details for later",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Which line avoids fake agreement?",
    choices: [
      "I need to review this first",
      "Sure, of course, always yes",
      "No problem, I know nothing but yes",
      "Everything is fine without a check",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "What can happen when everyone says yes?",
    choices: [
      "Blind spots stay hidden",
      "Every decision becomes perfect",
      "Testing is no longer needed",
      "The budget grows automatically",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Strong professional trust comes from:",
    choices: [
      "Reliable and honest communication",
      "Never challenging a bad idea",
      "Avoiding difficult conversations",
      "Agreeing without context",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "You change your mind after agreeing. What is best?",
    choices: [
      "Update the team early",
      "Hide it until launch",
      "Say nothing and hope",
      "Blame the requirement",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "Ke yes behavior hurts learning because:",
    choices: [
      "You stop asking questions",
      "You read too much",
      "You test too often",
      "You share too many facts",
    ],
    correctAnswer: 0,
  },
  {
    prompt: "A balanced teammate combines:",
    choices: [
      "Cooperation with critical thinking",
      "Silence with blind approval",
      "Conflict with ego",
      "Speed with guessing",
    ],
    correctAnswer: 0,
  },
];

export const questionKeYes = createExamQuestions("ke-yes", seeds);
