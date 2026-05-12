export type AttachmentKind = "image" | "file";
export type MessageSender = "them" | "me";

export type MessageAttachment = {
  id: string;
  kind: AttachmentKind;
  name: string;
  sizeLabel: string;
  url: string;
  mimeType: string;
};

export type ReplySnapshot = {
  id: number;
  senderName: string;
  text: string;
  attachments?: MessageAttachment[];
};

export type ChatMessage = {
  id: number;
  sender: MessageSender;
  text: string;
  dateLabel: string;
  dayLabel: string;
  attachments?: MessageAttachment[];
  replyTo?: ReplySnapshot;
};

export type Conversation = {
  id: number;
  name: string;
  preview: string;
  timestamp: number;
};

const now = Date.now();

export const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Select Service Partner Ltd.",
    preview: "We would like to invite you for an onsite interview next week.",
    timestamp: now - 5 * 60 * 1000,
  },
  {
    id: 2,
    name: "Blue Orbit Tech",
    preview: "Can you resend your backend portfolio and GitHub link?",
    timestamp: now - 60 * 60 * 1000,
  },
  {
    id: 3,
    name: "Aurora Studio",
    preview:
      "Your design case study looks strong. We have a few follow-up questions.",
    timestamp: now - 5 * 60 * 60 * 1000,
  },
  {
    id: 4,
    name: "Nimbus Analytics",
    preview: "Please review the SQL assignment brief before Friday.",
    timestamp: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 5,
    name: "Siam Mobile Labs",
    preview: "Are you available for a technical screening on Wednesday?",
    timestamp: now - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 6,
    name: "Cloud Harbor Co., Ltd.",
    preview: "We have shared the DevOps exercise and environment details.",
    timestamp: now - 8 * 24 * 60 * 60 * 1000,
  },
  {
    id: 7,
    name: "Riverline Digital",
    preview: "Thanks for sharing your iOS experience summary.",
    timestamp: now - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: 8,
    name: "Skyline Works",
    preview: "Our Android lead would like to meet you this Friday.",
    timestamp: now - 12 * 24 * 60 * 60 * 1000,
  },
  {
    id: 9,
    name: "Nimble Labs",
    preview: "Could you tell us more about your user research process?",
    timestamp: now - 14 * 24 * 60 * 60 * 1000,
  },
  {
    id: 10,
    name: "Orbitsoft",
    preview: "We are moving your application to the final interview stage.",
    timestamp: now - 16 * 24 * 60 * 60 * 1000,
  },
  {
    id: 11,
    name: "Fortress Cloud",
    preview: "Please confirm your expected salary range.",
    timestamp: now - 18 * 24 * 60 * 60 * 1000,
  },
  {
    id: 12,
    name: "Aether AI",
    preview: "We would love to discuss your ML deployment experience.",
    timestamp: now - 20 * 24 * 60 * 60 * 1000,
  },
];

export const initialConversationMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 101,
      sender: "them",
      text: "Hi, thank you for applying for the Frontend Engineer position. Our team reviewed your profile and would like to invite you for an onsite interview.",
      dateLabel: "22 Apr 2026 10:15",
      dayLabel: "22 Apr 2026",
    },
    {
      id: 102,
      sender: "me",
      text: "Thank you for the update. I am available next Tuesday and Thursday afternoon. Please let me know which slot works best for your team.",
      dateLabel: "22 Apr 2026 10:42",
      dayLabel: "22 Apr 2026",
    },
    {
      id: 103,
      sender: "them",
      text: "Thursday at 2:00 PM works well. We would like to invite you for an onsite interview next week at our Lat Krabang office.",
      dateLabel: "28 Apr 2026 16:55",
      dayLabel: "28 Apr 2026",
    },
  ],
  2: [
    {
      id: 201,
      sender: "them",
      text: "Thanks for speaking with our engineering manager. Can you resend your backend portfolio and GitHub link? The previous file appears to have expired.",
      dateLabel: "27 Apr 2026 11:20",
      dayLabel: "27 Apr 2026",
    },
    {
      id: 202,
      sender: "me",
      text: "Sure, I will send an updated link this afternoon along with two recent API projects that I worked on.",
      dateLabel: "27 Apr 2026 11:34",
      dayLabel: "27 Apr 2026",
    },
  ],
  3: [
    {
      id: 301,
      sender: "them",
      text: "Your design case study looks strong. We have a few follow-up questions around your research process and how you validated the final flow.",
      dateLabel: "26 Apr 2026 09:10",
      dayLabel: "26 Apr 2026",
    },
    {
      id: 302,
      sender: "me",
      text: "Happy to walk through that. I can also share a short summary of the testing sessions and how the findings changed the final prototype.",
      dateLabel: "26 Apr 2026 09:28",
      dayLabel: "26 Apr 2026",
    },
  ],
  4: [
    {
      id: 401,
      sender: "them",
      text: "Please review the SQL assignment brief before Friday. We expect the task to take around 90 minutes and focus on practical analysis rather than theory.",
      dateLabel: "24 Apr 2026 15:05",
      dayLabel: "24 Apr 2026",
    },
    {
      id: 402,
      sender: "me",
      text: "Received, thank you. I will complete it by Thursday evening and send over both the SQL file and a short explanation of my approach.",
      dateLabel: "24 Apr 2026 15:18",
      dayLabel: "24 Apr 2026",
    },
  ],
  5: [
    {
      id: 501,
      sender: "them",
      text: "Are you available for a technical screening on Wednesday? The session will cover mobile testing workflows and basic automation concepts.",
      dateLabel: "21 Apr 2026 13:40",
      dayLabel: "21 Apr 2026",
    },
    {
      id: 502,
      sender: "me",
      text: "Yes, Wednesday morning works for me. Please send the meeting link once the schedule is confirmed.",
      dateLabel: "21 Apr 2026 13:52",
      dayLabel: "21 Apr 2026",
    },
  ],
  6: [
    {
      id: 601,
      sender: "them",
      text: "We have shared the DevOps exercise and environment details. Please let us know if you need access to an AWS sandbox account before you begin.",
      dateLabel: "18 Apr 2026 17:00",
      dayLabel: "18 Apr 2026",
    },
    {
      id: 602,
      sender: "me",
      text: "Thanks, I have reviewed the instructions. A sandbox account would be helpful so I can demonstrate the deployment steps end to end.",
      dateLabel: "18 Apr 2026 17:16",
      dayLabel: "18 Apr 2026",
    },
  ],
  7: [
    {
      id: 701,
      sender: "them",
      text: "Thanks for sharing your iOS experience summary. Your background with performance optimization and release workflows is relevant to what we need.",
      dateLabel: "16 Apr 2026 14:25",
      dayLabel: "16 Apr 2026",
    },
    {
      id: 702,
      sender: "me",
      text: "Glad to hear that. I also have experience improving app startup time and working closely with QA during release cycles.",
      dateLabel: "16 Apr 2026 14:41",
      dayLabel: "16 Apr 2026",
    },
  ],
  8: [
    {
      id: 801,
      sender: "them",
      text: "Our Android lead would like to meet you this Friday. The discussion will focus on architecture decisions, Kotlin practices, and collaboration with backend teams.",
      dateLabel: "14 Apr 2026 10:05",
      dayLabel: "14 Apr 2026",
    },
  ],
  9: [
    {
      id: 901,
      sender: "them",
      text: "Could you tell us more about your user research process? We are especially interested in how you prioritize findings when timelines are tight.",
      dateLabel: "12 Apr 2026 16:48",
      dayLabel: "12 Apr 2026",
    },
    {
      id: 902,
      sender: "me",
      text: "I usually group findings by impact and confidence first, then align them with the product goal and implementation effort so the team can make tradeoffs quickly.",
      dateLabel: "12 Apr 2026 17:03",
      dayLabel: "12 Apr 2026",
    },
  ],
  10: [
    {
      id: 1001,
      sender: "them",
      text: "We are moving your application to the final interview stage. The last round will be with our CTO and one senior product engineer.",
      dateLabel: "10 Apr 2026 09:30",
      dayLabel: "10 Apr 2026",
    },
    {
      id: 1002,
      sender: "me",
      text: "Thank you for the update. I appreciate the opportunity and would be happy to join at any time next week after 1 PM.",
      dateLabel: "10 Apr 2026 09:47",
      dayLabel: "10 Apr 2026",
    },
  ],
  11: [
    {
      id: 1101,
      sender: "them",
      text: "Please confirm your expected salary range for the Security Engineer role so we can align internally before scheduling the next step.",
      dateLabel: "08 Apr 2026 11:12",
      dayLabel: "08 Apr 2026",
    },
    {
      id: 1102,
      sender: "me",
      text: "My expected range is flexible depending on the overall package, scope, and growth opportunities. I am happy to discuss the details during the next call.",
      dateLabel: "08 Apr 2026 11:30",
      dayLabel: "08 Apr 2026",
    },
  ],
  12: [
    {
      id: 1201,
      sender: "them",
      text: "We would love to discuss your ML deployment experience. In particular, we are interested in how you handled model monitoring and data drift after launch.",
      dateLabel: "06 Apr 2026 15:55",
      dayLabel: "06 Apr 2026",
    },
    {
      id: 1202,
      sender: "me",
      text: "That sounds great. I can share an example where we set up batch monitoring, alerting thresholds, and retraining triggers based on production feedback.",
      dateLabel: "06 Apr 2026 16:11",
      dayLabel: "06 Apr 2026",
    },
  ],
};
