import PageLayout from "@/components/layout/PageLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  FileText,
  Heart,
  ImagePlus,
  Paperclip,
  Reply,
  Search,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  initialConversationMessages,
  initialConversations,
  type AttachmentKind,
  type ChatMessage,
  type Conversation,
  type MessageAttachment,
} from "./message";

const MAX_ATTACHMENTS = 10;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderHighlightedText = (text: string, query: string) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  return text.split(new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi")).map((part, index) => {
    const isMatch = part.toLowerCase() === normalizedQuery.toLowerCase();

    if (!isMatch) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    return (
      <mark key={`${part}-${index}`} className="rounded bg-[#ffe7c2] px-0.5 text-inherit">
        {part}
      </mark>
    );
  });
};

const formatConversationTime = (timestamp: number) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const isSameDay =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  if (isSameDay) {
    return messageDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return messageDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const formatAttachmentSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
};

const summarizeAttachments = (attachments?: MessageAttachment[]) => {
  if (!attachments || attachments.length === 0) {
    return "";
  }

  const imageCount = attachments.filter((attachment) => attachment.kind === "image").length;
  const fileCount = attachments.length - imageCount;
  const parts: string[] = [];

  if (imageCount > 0) {
    parts.push(imageCount === 1 ? "1 image" : `${imageCount} images`);
  }

  if (fileCount > 0) {
    parts.push(fileCount === 1 ? "1 file" : `${fileCount} files`);
  }

  return parts.join(" and ");
};

const buildConversationPreview = (text: string, attachments?: MessageAttachment[]) => {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText) {
    return normalizedText;
  }

  const attachmentSummary = summarizeAttachments(attachments);

  return attachmentSummary ? `Sent ${attachmentSummary}` : "New message";
};

const getImageAttachments = (attachments?: MessageAttachment[]) =>
  (attachments || []).filter((attachment) => attachment.kind === "image");

const MessageImageGrid = ({
  attachments,
  onOpen,
}: {
  attachments: MessageAttachment[];
  onOpen: (clickedIndex: number) => void;
}) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-3 grid gap-2",
        attachments.length === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {attachments.map((attachment, index) => (
        <button
          key={attachment.id}
          type="button"
          onClick={() => onOpen(index)}
          className="overflow-hidden rounded-2xl border border-[#ececec] bg-[#f8f8f8] text-left"
        >
          <img
            src={attachment.url}
            alt={attachment.name}
            className="h-36 w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
          />
        </button>
      ))}
    </div>
  );
};

const PendingAttachmentPreview = ({
  attachments,
  onRemove,
}: {
  attachments: MessageAttachment[];
  onRemove: (attachmentId: string) => void;
}) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 rounded-3xl border border-[#ececec] bg-[#fafafa] p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-[#666666]">
          {attachments.length}/{MAX_ATTACHMENTS} attachments selected
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 rounded-2xl border border-[#ececec] bg-white p-2.5"
          >
            {attachment.kind === "image" ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f3f3f3] text-[#666666]">
                <FileText className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1f1f1f]">{attachment.name}</p>
              <p className="text-xs text-[#8a8a8a]">{attachment.sizeLabel}</p>
            </div>
            <button
              type="button"
              aria-label={`Remove ${attachment.name}`}
              onClick={() => onRemove(attachment.id)}
              className="rounded-full border border-[#ececec] p-1 text-[#8a8a8a] transition hover:bg-[#f5f5f5] hover:text-[#1f1f1f]"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Message() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationList, setConversationList] = useState(initialConversations);
  const [conversationMessages, setConversationMessages] = useState(initialConversationMessages);
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0]?.id ?? 0);
  const [composerText, setComposerText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [likedMessageIds, setLikedMessageIds] = useState<number[]>([]);
  const [messageIdToDelete, setMessageIdToDelete] = useState<number | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    attachments: MessageAttachment[];
    currentIndex: number;
  } | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const createdObjectUrlsRef = useRef<string[]>([]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return conversationList;
    }

    return conversationList.filter((conversation) => {
      const messages = conversationMessages[conversation.id] || [];

      return (
        conversation.name.toLowerCase().includes(normalizedQuery) ||
        conversation.preview.toLowerCase().includes(normalizedQuery) ||
        messages.some((message) => message.text.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [conversationList, conversationMessages, searchQuery]);

  const selectedConversation =
    conversationList.find((conversation) => conversation.id === selectedConversationId) ||
    filteredConversations[0] ||
    conversationList[0];

  const messages = selectedConversation ? conversationMessages[selectedConversation.id] || [] : [];

  useEffect(() => {
    if (
      filteredConversations.length > 0 &&
      !filteredConversations.some((conversation) => conversation.id === selectedConversationId)
    ) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, selectedConversationId]);

  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!lightboxState) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxState(null);
        return;
      }

      if (event.key === "ArrowRight") {
        setLightboxState((previous) =>
          previous
            ? {
                ...previous,
                currentIndex: (previous.currentIndex + 1) % previous.attachments.length,
              }
            : previous,
        );
      }

      if (event.key === "ArrowLeft") {
        setLightboxState((previous) =>
          previous
            ? {
                ...previous,
                currentIndex:
                  (previous.currentIndex - 1 + previous.attachments.length) %
                  previous.attachments.length,
              }
            : previous,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxState]);

  useEffect(() => {
    const textarea = composerTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 160 ? "auto" : "hidden";
  }, [composerText]);

  const trackObjectUrl = (url: string) => {
    createdObjectUrlsRef.current.push(url);
  };

  const releaseObjectUrl = (url: string) => {
    URL.revokeObjectURL(url);
    createdObjectUrlsRef.current = createdObjectUrlsRef.current.filter((currentUrl) => currentUrl !== url);
  };

  const releaseAttachmentUrls = (attachments?: MessageAttachment[]) => {
    (attachments || []).forEach((attachment) => {
      if (attachment.url.startsWith("blob:")) {
        releaseObjectUrl(attachment.url);
      }
    });
  };

  const appendFiles = (files: File[], preferredKind: AttachmentKind) => {
    if (files.length === 0) {
      return;
    }

    const availableSlots = Math.max(0, MAX_ATTACHMENTS - pendingAttachments.length);

    if (availableSlots === 0) {
      return;
    }

    const nextAttachments = files.slice(0, availableSlots).map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      trackObjectUrl(objectUrl);

      return {
        id: `${Date.now()}-${index}-${file.name}`,
        kind: preferredKind === "image" || file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        sizeLabel: formatAttachmentSize(file.size),
        url: objectUrl,
        mimeType: file.type || "application/octet-stream",
      } satisfies MessageAttachment;
    });

    setPendingAttachments((previous) => [...previous, ...nextAttachments]);
  };

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const imageFiles = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    appendFiles(imageFiles, "image");
    event.target.value = "";
  };

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    appendFiles(files, "file");
    event.target.value = "";
  };

  const handleRemovePendingAttachment = (attachmentId: string) => {
    setPendingAttachments((previous) => {
      const targetAttachment = previous.find((attachment) => attachment.id === attachmentId);

      if (targetAttachment?.url.startsWith("blob:")) {
        releaseObjectUrl(targetAttachment.url);
      }

      return previous.filter((attachment) => attachment.id !== attachmentId);
    });
  };

  const handleSendMessage = () => {
    if (!selectedConversation) {
      return;
    }

    const normalizedText = composerText.replace(/\r\n/g, "\n");
    const hasText = normalizedText.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasText && !hasAttachments) {
      return;
    }

    const sentAt = new Date();
    const dayLabel = sentAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const dateLabel = `${dayLabel} ${sentAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;

    const nextMessage: ChatMessage = {
      id: Date.now(),
      sender: "me",
      text: normalizedText,
      dateLabel,
      dayLabel,
      attachments: hasAttachments ? pendingAttachments : undefined,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.sender === "me" ? "You" : selectedConversation.name,
            text: replyingTo.text,
            attachments: replyingTo.attachments,
          }
        : undefined,
    };

    setConversationMessages((previous) => ({
      ...previous,
      [selectedConversation.id]: [...(previous[selectedConversation.id] || []), nextMessage],
    }));

    setConversationList((previous) => {
      const nextConversation = previous.find((conversation) => conversation.id === selectedConversation.id);

      if (!nextConversation) {
        return previous;
      }

      const updatedConversation: Conversation = {
        ...nextConversation,
        preview: buildConversationPreview(normalizedText, pendingAttachments),
        timestamp: sentAt.getTime(),
      };

      return [
        updatedConversation,
        ...previous.filter((conversation) => conversation.id !== selectedConversation.id),
      ];
    });

    setComposerText("");
    setPendingAttachments([]);
    setReplyingTo(null);
  };

  const handleToggleLike = (messageId: number) => {
    setLikedMessageIds((previous) =>
      previous.includes(messageId)
        ? previous.filter((currentId) => currentId !== messageId)
        : [...previous, messageId],
    );
  };

  const handleDeleteMessage = () => {
    if (!selectedConversation || messageIdToDelete === null) {
      return;
    }

    const messageToDelete = messages.find((message) => message.id === messageIdToDelete);

    releaseAttachmentUrls(messageToDelete?.attachments);
    setLightboxState(null);
    setConversationMessages((previous) => ({
      ...previous,
      [selectedConversation.id]: (previous[selectedConversation.id] || []).filter(
        (message) => message.id !== messageIdToDelete,
      ),
    }));
    setLikedMessageIds((previous) => previous.filter((messageId) => messageId !== messageIdToDelete));
    setReplyingTo((previous) => (previous?.id === messageIdToDelete ? null : previous));
    setMessageIdToDelete(null);
  };

  const openLightbox = (attachments: MessageAttachment[], currentIndex: number) => {
    if (attachments.length === 0) {
      return;
    }

    setLightboxState({ attachments, currentIndex });
  };

  return (
    <PageLayout>
      <div className="h-[calc(100vh-56px)] overflow-hidden bg-white px-3 py-3 sm:px-5 lg:px-7">
        <div className="flex h-full w-full flex-col">
          <div className="mb-3 flex flex-col gap-3 px-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#151515]">Message</h1>
            </div>
            <div className="relative w-full sm:max-w-[208px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9d9d9d]" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Message"
                className="h-10 rounded-[14px] border-[#e6e6e6] bg-white pl-11 pr-4 text-[13px] shadow-[0_3px_12px_rgba(15,23,42,0.08)]"
              />
            </div>
          </div>

          <section className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-[10px] border border-[#ececec] bg-white">
            <div className="flex h-full min-w-0 flex-col lg:flex-row">
              <aside className="flex h-[34vh] min-h-0 w-full flex-col border-b border-[#efefef] lg:h-auto lg:w-[300px] lg:border-b-0 lg:border-r">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-[#8a8a8a]">No messages found.</div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const isSelected = conversation.id === selectedConversation?.id;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => setSelectedConversationId(conversation.id)}
                          className={cn(
                            "relative flex w-full items-start gap-3 border-b border-[#f2f2f2] px-4 py-6 text-left transition",
                            isSelected ? "bg-[#fafafa]" : "hover:bg-[#fbfbfb]",
                          )}
                        >
                          {isSelected ? (
                            <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#ff9800]" />
                          ) : null}
                          <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-[#d8d8d8]" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-[15px] font-semibold text-[#161616]">
                                {renderHighlightedText(conversation.name, searchQuery)}
                              </p>
                              <span className="shrink-0 pt-0.5 text-[12px] text-[#8c8c8c]">
                                {formatConversationTime(conversation.timestamp)}
                              </span>
                            </div>
                            <p className="truncate text-[14px] text-[#8a8a8a]">
                              {renderHighlightedText(conversation.preview, searchQuery)}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#efefef] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#d8d8d8]" />
                    <div className="min-w-0">
                      <h2 className="truncate text-[26px] font-semibold text-[#151515]">
                        {selectedConversation?.name || "Message"}
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#7d7d7d] transition hover:bg-[#f5f5f5] hover:text-[#1f1f1f]"
                    aria-label="More actions"
                  >
                    <Ellipsis className="size-5" />
                  </button>
                </div>

                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 sm:px-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8a8a8a]">
                      Start the conversation by sending a message or attaching a file.
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const previousMessage = messages[index - 1];
                      const showDayLabel = !previousMessage || previousMessage.dayLabel !== message.dayLabel;
                      const senderName = message.sender === "me" ? "You" : selectedConversation?.name || "User";
                      const imageAttachments = getImageAttachments(message.attachments);
                      const nonImageAttachments = (message.attachments || []).filter(
                        (attachment) => attachment.kind === "file",
                      );
                      const isLiked = likedMessageIds.includes(message.id);
                      const replySummary = message.replyTo?.text || summarizeAttachments(message.replyTo?.attachments);

                      return (
                        <div key={message.id} className="mb-5 last:mb-0">
                          {showDayLabel ? (
                            <div className="mb-3 flex items-center gap-3">
                              <div className="h-px flex-1 bg-[#ececec]" />
                              <span className="text-xs text-[#8a8a8a]">{message.dayLabel}</span>
                              <div className="h-px flex-1 bg-[#ececec]" />
                            </div>
                          ) : null}

                          <div className="group rounded-[12px] px-1.5 py-1.5 transition hover:bg-[#fafafa]">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-[#d8d8d8]" />
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                  <p className="max-w-full truncate text-[15px] font-semibold text-[#1a1a1a]">
                                    {senderName}
                                  </p>
                                  <span className="shrink-0 text-[12px] text-[#8a8a8a]">
                                    {message.dateLabel}
                                  </span>
                                </div>

                                {message.replyTo ? (
                                  <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-l-2 border-[#ff9800] bg-[#faf7f2] px-3 py-2">
                                    <div className="mb-0.5 flex min-w-0 items-center gap-1 text-xs text-[#d97900]">
                                      <span className="shrink-0 uppercase tracking-[0.12em]">Replying to</span>
                                      <span className="min-w-0 truncate font-semibold normal-case">
                                        {message.replyTo.senderName}
                                      </span>
                                    </div>
                                    <p className="truncate text-sm text-[#7a7a7a]">
                                      {replySummary || "Original message"}
                                    </p>
                                  </div>
                                ) : null}

                                {message.text ? (
                                  <p className="whitespace-pre-wrap break-words text-lg leading-8 text-[#2b2b2b]">
                                    {renderHighlightedText(message.text, searchQuery)}
                                  </p>
                                ) : null}

                                <MessageImageGrid
                                  attachments={imageAttachments}
                                  onOpen={(clickedIndex) => openLightbox(imageAttachments, clickedIndex)}
                                />

                                {nonImageAttachments.length > 0 ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {nonImageAttachments.map((attachment) => (
                                      <a
                                        key={attachment.id}
                                        href={attachment.url}
                                        download={attachment.name}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-[#fbfbfb] px-3 py-2 text-sm text-[#505050] transition hover:bg-[#f4f4f4]"
                                      >
                                        <FileText className="size-4" />
                                        <span className="max-w-44 truncate">{attachment.name}</span>
                                        <span className="text-xs text-[#8a8a8a]">{attachment.sizeLabel}</span>
                                      </a>
                                    ))}
                                  </div>
                                ) : null}

                                <div className="mt-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingTo(message)}
                                    className="rounded-full p-2 text-[#8a8a8a] transition hover:bg-[#f1f1f1] hover:text-[#1f1f1f]"
                                    aria-label="Reply"
                                  >
                                    <Reply className="size-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(message.id)}
                                    className={cn(
                                      "rounded-full p-2 transition hover:bg-[#f1f1f1]",
                                      isLiked ? "text-[#ef4444]" : "text-[#8a8a8a] hover:text-[#1f1f1f]",
                                    )}
                                    aria-label="Like message"
                                  >
                                    <Heart className={cn("size-4", isLiked ? "fill-current" : "")} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMessageIdToDelete(message.id)}
                                    className="rounded-full p-2 text-[#8a8a8a] transition hover:bg-[#f1f1f1] hover:text-[#1f1f1f]"
                                    aria-label="Delete message"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="min-w-0 overflow-hidden border-t border-[#efefef] px-3 py-2.5">
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectImages}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleSelectFiles}
                  />

                  <PendingAttachmentPreview
                    attachments={pendingAttachments}
                    onRemove={handleRemovePendingAttachment}
                  />

                  {replyingTo ? (
                    <div className="mb-2.5 flex max-w-full items-start gap-3 overflow-hidden rounded-2xl border border-[#ffe1b0] bg-[#fff8ef] px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex min-w-0 items-center gap-1 text-xs text-[#d97900]">
                          <span className="shrink-0 uppercase tracking-[0.12em]">Replying to</span>
                          <span className="min-w-0 truncate font-semibold normal-case">
                            {replyingTo.sender === "me" ? "You" : selectedConversation?.name}
                          </span>
                        </div>
                        <p className="truncate text-sm text-[#6b6b6b]">
                          {replyingTo.text || summarizeAttachments(replyingTo.attachments) || "Message"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="rounded-full p-1.5 text-[#8a8a8a] transition hover:bg-white"
                        aria-label="Cancel reply"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : null}

                  <div className="flex min-w-0 items-end gap-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded-md p-1.5 text-[#8a8a8a] transition hover:bg-[#f5f5f5] hover:text-[#1f1f1f]"
                      aria-label="Attach image"
                    >
                      <ImagePlus className="size-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md p-1.5 text-[#8a8a8a] transition hover:bg-[#f5f5f5] hover:text-[#1f1f1f]"
                      aria-label="Attach file"
                    >
                      <Paperclip className="size-[18px]" />
                    </button>
                    <div className="flex flex-1 items-center rounded-full border border-[#e6e6e6] bg-white px-4 py-1.5">
                      <textarea
                        ref={composerTextareaRef}
                        rows={1}
                        value={composerText}
                        onChange={(event) => setComposerText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
                            return;
                          }

                          event.preventDefault();
                          handleSendMessage();
                        }}
                        placeholder="Aa"
                        className="block min-h-6 max-h-40 w-full resize-none border-0 bg-transparent text-[12px] leading-6 text-[#232323] outline-none placeholder:text-[#a0a0a0]"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      variant={composerText.trim() || pendingAttachments.length > 0 ? "default" : "ghost"}
                      className={cn(
                        "h-9 rounded-full px-3 text-[12px]",
                        composerText.trim() || pendingAttachments.length > 0
                          ? "text-white"
                          : "text-[#8a8a8a]",
                      )}
                    >
                      <SendHorizontal className="size-4" />
                      send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AlertDialog
        open={messageIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMessageIdToDelete(null);
          }
        }}
      >
        <AlertDialogContent size="sm" className="rounded-[24px]">
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the message from the current conversation view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteMessage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lightboxState ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxState(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxState(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>

          {lightboxState.attachments.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setLightboxState((previous) =>
                  previous
                    ? {
                        ...previous,
                        currentIndex:
                          (previous.currentIndex - 1 + previous.attachments.length) %
                          previous.attachments.length,
                      }
                    : previous,
                );
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>
          ) : null}

          <div
            className="flex max-h-full w-full max-w-5xl flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightboxState.attachments[lightboxState.currentIndex].url}
              alt={lightboxState.attachments[lightboxState.currentIndex].name}
              className="max-h-[75vh] w-auto max-w-full rounded-3xl object-contain"
            />

            {lightboxState.attachments.length > 1 ? (
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-white/10 px-3 py-2">
                {lightboxState.attachments.map((attachment, index) => (
                  <button
                    key={attachment.id}
                    type="button"
                    onClick={() =>
                      setLightboxState((previous) =>
                        previous
                          ? {
                              ...previous,
                              currentIndex: index,
                            }
                          : previous,
                      )
                    }
                    className={cn(
                      "overflow-hidden rounded-2xl border",
                      index === lightboxState.currentIndex ? "border-white" : "border-white/30",
                    )}
                  >
                    <img src={attachment.url} alt={attachment.name} className="h-14 w-14 object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {lightboxState.attachments.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setLightboxState((previous) =>
                  previous
                    ? {
                        ...previous,
                        currentIndex: (previous.currentIndex + 1) % previous.attachments.length,
                      }
                    : previous,
                );
              }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>
          ) : null}
        </div>
      ) : null}
    </PageLayout>
  );
}
