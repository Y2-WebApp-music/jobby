import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChatMessageType,
  buildAttachmentMessageData,
  getSocketClient,
  inferMessageTypeFromFile,
  parseAttachmentMessageData,
  threadPreviewLabel,
} from "@/services/socketService";
import { useAuthStore } from "@/store/auth";
import {
  ArrowUp,
  Ellipsis,
  FileText,
  Heart,
  Image,
  Pin,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ChatThread = {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  online: boolean;
};

type ChatMessage = {
  id: number;
  serverId?: string;
  from: "me" | "them";
  text: string;
  messageType: number;
  at: string;
  read: boolean;
  imageUrls?: string[];
  fileUrl?: string;
  fileName?: string;
};

type ChatThreadApi = {
  otherUserId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastAt?: string | null;
  unread: number;
  online: boolean;
};

type AttachmentApi = {
  url?: string;
};

type ConversationMessageApi = {
  id: string;
  user_id: string;
  receive_user_id: string;
  message_data: string | null;
  message_type?: number | null;
  created_at?: string | null;
  read?: boolean;
  attachments?: AttachmentApi[];
};

type MessageReadPayload = {
  user_id: string;
  message_ids: string[];
};

type MessageDeletedPayload = {
  message_id: string;
};

type PendingImageDraft = {
  id: string;
  file: File;
  previewUrl: string;
};

type SocketClientLike = {
  connected?: boolean;
  emit: (
    event: string,
    payload?: unknown,
    callback?: (ack?: { error?: string }) => void,
  ) => void;
  on: <T = unknown>(event: string, handler: (payload: T) => void) => void;
  off: <T = unknown>(event: string, handler: (payload: T) => void) => void;
  connect: () => void;
};

const MAX_IMAGE_ATTACHMENTS = 10;
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getTypedSocket = (): SocketClientLike | null =>
  getSocketClient() as SocketClientLike | null;

const getDiscordTileClasses = (total: number, index: number): string => {
  if (total === 1) return "col-span-6 row-span-6 aspect-[4/3]";
  if (total === 2) return "col-span-3 row-span-3 aspect-square";
  if (total === 3) {
    return index === 0
      ? "col-span-4 row-span-6 aspect-[4/5]"
      : "col-span-2 row-span-3 aspect-square";
  }
  if (total === 4) return "col-span-3 row-span-3 aspect-square";
  if (total === 5) {
    return index < 2
      ? "col-span-3 row-span-3 aspect-square"
      : "col-span-2 row-span-3 aspect-square";
  }
  return "col-span-2 row-span-2 aspect-square";
};

const MessageImageGrid = ({ imageUrls }: { imageUrls: string[] }) => {
  const total = imageUrls.length;
  if (total === 0) return null;

  return (
    <div className="mb-2 grid max-w-xl grid-cols-6 gap-1 overflow-hidden rounded-xl border border-border bg-muted/20 p-1">
      {imageUrls.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className={`${getDiscordTileClasses(total, index)} overflow-hidden rounded-md`}
        >
          <img
            src={imageUrl}
            alt={`Attachment ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

const renderHighlightedText = (text: string, query: string) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return text;

  const parts = text.split(
    new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi"),
  );

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === normalizedQuery.toLowerCase();
    if (!isMatch) return <span key={`${part}-${index}`}>{part}</span>;

    return (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-yellow-200/80 px-0.5 text-foreground"
      >
        {part}
      </mark>
    );
  });
};

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const mapMessageFromApi = (
  message: ConversationMessageApi,
  currentUserId: string,
  index: number,
): ChatMessage => {
  const messageType = message.message_type ?? ChatMessageType.Text;
  const parsedAttachment = parseAttachmentMessageData(
    message.message_data ?? "",
  );
  const attachmentUrls = (message.attachments ?? [])
    .map((item) => item.url ?? "")
    .filter(Boolean);
  const imageUrls =
    messageType === ChatMessageType.Image
      ? attachmentUrls.length > 0
        ? attachmentUrls
        : parsedAttachment?.url
          ? [parsedAttachment.url]
          : undefined
      : undefined;

  const fileUrl =
    messageType !== ChatMessageType.Text &&
    messageType !== ChatMessageType.Image
      ? parsedAttachment?.url
      : undefined;

  return {
    id: index + 1,
    serverId: message.id,
    from: message.user_id === currentUserId ? "me" : "them",
    text: message.message_data ?? "",
    messageType,
    at: formatTime(message.created_at),
    read: Boolean(message.read),
    imageUrls,
    fileUrl,
    fileName: parsedAttachment?.name,
  };
};

export default function MessagePage() {
  const authUser = useAuthStore((state) => state.user);
  const currentUserId = authUser?.id ?? "";
  const chatServiceBaseUrl = useMemo(() => {
    const raw =
      import.meta.env.VITE_SOCKET_URL?.trim() || "http://localhost:3002";
    return raw.replace(/\/$/, "");
  }, []);

  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImageDraft[]>([]);
  const [pendingGenericFile, setPendingGenericFile] = useState<File | null>(
    null,
  );
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messagesByThread, setMessagesByThread] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [likedMessageIds, setLikedMessageIds] = useState<string[]>([]);

  const selectedThreadIdRef = useRef(selectedThreadId);
  const pendingImagesRef = useRef(pendingImages);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  pendingImagesRef.current = pendingImages;

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) ?? null;
  const selectedMessages = useMemo(
    () => (selectedThread ? (messagesByThread[selectedThread.id] ?? []) : []),
    [messagesByThread, selectedThread],
  );

  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (thread) =>
        thread.name.toLowerCase().includes(q) ||
        thread.role.toLowerCase().includes(q) ||
        thread.lastMessage.toLowerCase().includes(q),
    );
  }, [query, threads]);

  const markMessagesAsRead = (threadId: string, messageIds: string[]) => {
    if (!threadId || !messageIds.length) return;

    setMessagesByThread((prev) => {
      const existing = prev[threadId] ?? [];
      const ids = new Set(messageIds);
      return {
        ...prev,
        [threadId]: existing.map((message) =>
          message.serverId && ids.has(message.serverId)
            ? { ...message, read: true }
            : message,
        ),
      };
    });

    const socket = getTypedSocket();
    if (socket?.connected) {
      socket.emit("mark_read", { otherUserId: threadId, messageIds });
    }
  };

  useEffect(() => {
    const socket = getTypedSocket();
    if (!socket) return;

    const onConnect = () => {
      setSocketConnected(true);
      if (selectedThreadIdRef.current) {
        socket.emit("join_conversation", {
          otherUserId: selectedThreadIdRef.current,
        });
      }
    };
    const onDisconnect = () => setSocketConnected(false);

    const onMessage = (payload: ConversationMessageApi) => {
      const senderId = String(payload.user_id ?? "").trim();
      const receiverId = String(payload.receive_user_id ?? "").trim();
      if (!senderId || !receiverId) return;

      const incomingThreadId =
        senderId === currentUserId ? receiverId : senderId;
      const isMine = senderId === currentUserId;
      const incomingList = messagesByThread[incomingThreadId] ?? [];
      const mapped = mapMessageFromApi(
        payload,
        currentUserId,
        incomingList.length,
      );

      setMessagesByThread((prev) => {
        const existing = prev[incomingThreadId] ?? [];
        if (
          payload.id &&
          existing.some((message) => message.serverId === payload.id)
        ) {
          return prev;
        }
        return {
          ...prev,
          [incomingThreadId]: [
            ...existing,
            { ...mapped, id: existing.length + 1 },
          ],
        };
      });

      setThreads((prev) =>
        prev.some((thread) => thread.id === incomingThreadId)
          ? prev.map((thread) => {
              if (thread.id !== incomingThreadId) return thread;
              const isActive = selectedThreadIdRef.current === incomingThreadId;
              return {
                ...thread,
                lastMessage: threadPreviewLabel(
                  mapped.messageType,
                  mapped.text,
                ),
                lastAt: mapped.at,
                unread: isActive || isMine ? thread.unread : thread.unread + 1,
              };
            })
          : [
              {
                id: incomingThreadId,
                name: incomingThreadId,
                role: "User",
                lastMessage: threadPreviewLabel(
                  mapped.messageType,
                  mapped.text,
                ),
                lastAt: mapped.at,
                unread:
                  isMine || selectedThreadIdRef.current === incomingThreadId
                    ? 0
                    : 1,
                online: false,
              },
              ...prev,
            ],
      );

      if (
        !isMine &&
        selectedThreadIdRef.current === incomingThreadId &&
        payload.id
      ) {
        markMessagesAsRead(incomingThreadId, [payload.id]);
      }
    };

    const onMessageRead = (payload: MessageReadPayload) => {
      const ids = new Set((payload?.message_ids ?? []).map((id) => String(id)));
      if (!ids.size) return;
      setMessagesByThread((prev) => {
        const next: Record<string, ChatMessage[]> = {};
        for (const [threadId, messages] of Object.entries(prev)) {
          next[threadId] = messages.map((message) =>
            message.serverId && ids.has(message.serverId)
              ? { ...message, read: true }
              : message,
          );
        }
        return next;
      });
    };

    const onMessageDeleted = (payload: MessageDeletedPayload) => {
      const targetId = String(payload?.message_id ?? "").trim();
      if (!targetId) return;
      setMessagesByThread((prev) => {
        const next: Record<string, ChatMessage[]> = {};
        for (const [threadId, messages] of Object.entries(prev)) {
          next[threadId] = messages
            .filter((message) => message.serverId !== targetId)
            .map((message, index) => ({ ...message, id: index + 1 }));
        }
        return next;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("message_read", onMessageRead);
    socket.on("message_deleted", onMessageDeleted);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("message_read", onMessageRead);
      socket.off("message_deleted", onMessageDeleted);
    };
  }, [currentUserId, messagesByThread]);

  useEffect(() => {
    const socket = getTypedSocket();
    if (!socket?.connected || !selectedThreadId) return;
    socket.emit("join_conversation", { otherUserId: selectedThreadId });
  }, [selectedThreadId]);

  const loadThreads = async () => {
    if (!currentUserId) {
      setThreads([]);
      setSelectedThreadId("");
      return;
    }
    try {
      const params = new URLSearchParams({
        userId: currentUserId,
        limit: "100",
      });
      const response = await fetch(
        `${chatServiceBaseUrl}/chat/threads?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to load threads");
      const data = (await response.json()) as ChatThreadApi[];
      const mapped = data.map((thread) => ({
        id: thread.otherUserId,
        name: thread.name || thread.otherUserId,
        role: thread.role || "User",
        lastMessage: thread.lastMessage ?? "",
        lastAt: formatTime(thread.lastAt),
        unread: Number(thread.unread ?? 0),
        online: Boolean(thread.online),
      }));
      setThreads(mapped);
      setSelectedThreadId((prev) => prev || mapped[0]?.id || "");
    } catch {
      setThreads([]);
      setSelectedThreadId("");
    }
  };

  const loadConversation = async (threadId: string) => {
    if (!threadId || !currentUserId) return;
    try {
      const params = new URLSearchParams({
        userId: currentUserId,
        otherUserId: threadId,
        limit: "100",
      });
      const response = await fetch(
        `${chatServiceBaseUrl}/chat/conversation?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to load conversation");
      const payload = (await response.json()) as {
        messages?: ConversationMessageApi[];
      };
      const list = [...(payload.messages ?? [])]
        .reverse()
        .map((message, index) =>
          mapMessageFromApi(message, currentUserId, index),
        );
      setMessagesByThread((prev) => ({ ...prev, [threadId]: list }));
    } catch {
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: prev[threadId] ?? [],
      }));
    }
  };

  useEffect(() => {
    void loadThreads();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedThreadId) return;
    void loadConversation(selectedThreadId);
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const unreadIncomingIds = selectedMessages
      .filter(
        (message) =>
          message.from === "them" && !message.read && message.serverId,
      )
      .map((message) => message.serverId as string);
    if (!unreadIncomingIds.length) return;
    markMessagesAsRead(selectedThreadId, unreadIncomingIds);
  }, [selectedThreadId, selectedMessages]);

  const sendSocketMessage = (payload: {
    messageType: number;
    messageData: string;
    onErrorMessage: string;
  }) => {
    if (!selectedThread || !currentUserId) return;
    const socket = getTypedSocket();
    if (!socket?.connected) return;

    socket.emit(
      "message",
      {
        receive_user_id: selectedThread.id,
        message_type: payload.messageType,
        message_data: payload.messageData,
      },
      (ack?: { error?: string }) => {
        if (ack?.error) {
          console.error(payload.onErrorMessage, ack.error);
        }
      },
    );
  };

  const uploadChatAsset = async (file: File, kind: "image" | "file") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", kind === "image" ? "chat/images" : "chat/files");
    const path = kind === "image" ? "image" : "file";
    const response = await fetch(`${chatServiceBaseUrl}/chat/upload/${path}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Upload failed");
    }
    const data = (await response.json()) as {
      publicUrl: string;
      signedUrl?: string;
    };
    const url = data.signedUrl || data.publicUrl;
    if (!url) throw new Error("No upload URL");
    return url;
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !selectedThread || !currentUserId) return;
    sendSocketMessage({
      messageType: ChatMessageType.Text,
      messageData: trimmed,
      onErrorMessage: "Message send failed:",
    });
    setDraft("");
  };

  const clearImageDraft = () => {
    setPendingImages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleImageInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files?.length) return;

    const currentCount = pendingImagesRef.current.length;
    const allowed = Math.max(0, MAX_IMAGE_ATTACHMENTS - currentCount);
    if (allowed === 0) {
      event.currentTarget.value = "";
      return;
    }

    const additions: PendingImageDraft[] = [];
    for (let i = 0; i < files.length && additions.length < allowed; i += 1) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      additions.push({
        id,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (additions.length > 0) {
      setPendingImages((prev) => [...prev, ...additions]);
      setPendingGenericFile(null);
    }
    event.currentTarget.value = "";
  };

  const handleSendImages = async () => {
    if (!pendingImages.length || !selectedThread || !currentUserId) return;
    setAttachmentUploading(true);
    try {
      const queue = [...pendingImages];
      for (const item of queue) {
        const url = await uploadChatAsset(item.file, "image");
        const payload = buildAttachmentMessageData(url, item.file.name);
        sendSocketMessage({
          messageType: ChatMessageType.Image,
          messageData: payload,
          onErrorMessage: "Image send failed:",
        });
        removePendingImage(item.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleGenericFileInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    clearImageDraft();
    setPendingGenericFile(file);
  };

  const handleSendGenericFile = async () => {
    if (!pendingGenericFile || !selectedThread || !currentUserId) return;
    setAttachmentUploading(true);
    try {
      const isImage = pendingGenericFile.type.startsWith("image/");
      const url = await uploadChatAsset(
        pendingGenericFile,
        isImage ? "image" : "file",
      );
      const messageType = isImage
        ? ChatMessageType.Image
        : inferMessageTypeFromFile(pendingGenericFile);
      const payload = buildAttachmentMessageData(url, pendingGenericFile.name);
      sendSocketMessage({
        messageType,
        messageData: payload,
        onErrorMessage: "File send failed:",
      });
      setPendingGenericFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleDeleteMessage = async (messageServerId?: string) => {
    if (!messageServerId || !currentUserId) return;
    const shouldDelete = window.confirm("Delete this message?");
    if (!shouldDelete) return;

    try {
      const response = await fetch(
        `${chatServiceBaseUrl}/chat/message/${messageServerId}/user/${currentUserId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Delete failed");

      setMessagesByThread((prev) => {
        const next: Record<string, ChatMessage[]> = {};
        for (const [threadId, messages] of Object.entries(prev)) {
          next[threadId] = messages
            .filter((message) => message.serverId !== messageServerId)
            .map((message, index) => ({ ...message, id: index + 1 }));
        }
        return next;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendComposer = async () => {
    if (attachmentUploading) return;
    if (pendingImages.length > 0) {
      await handleSendImages();
    }
    if (pendingGenericFile) {
      await handleSendGenericFile();
    }
    if (draft.trim()) {
      handleSend();
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const textarea = composerTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 176)}px`;
  };

  return (
    <PageLayout>
      <div className="w-full overflow-y-auto bg-background px-6 py-6">
        <div className="w-full">
          <div className="mb-4 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-medium">Message</h1>
            <div className="w-full sm:max-w-72">
              <Input
                placeholder="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                socketConnected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {socketConnected ? "Live" : "Offline"}
            </span>
          </div>

          <section className="h-[calc(100vh-190px)] min-h-140 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex h-full min-h-0">
              <aside className="w-[35%] min-w-75 border-r border-border">
                <div className="h-full overflow-y-auto">
                  {visibleThreads.length === 0 && (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      No matching chats or messages.
                    </div>
                  )}
                  {visibleThreads.map((thread) => {
                    const isSelected = thread.id === selectedThreadId;
                    const isUnread = thread.unread > 0;

                    return (
                      <div
                        key={thread.id}
                        className={`group/conv relative border-b border-border transition-colors ${
                          isSelected
                            ? "border-l-2 border-l-primary bg-muted/40"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedThreadId(thread.id);
                            setThreads((prev) =>
                              prev.map((item) =>
                                item.id === thread.id
                                  ? { ...item, unread: 0 }
                                  : item,
                              ),
                            );
                          }}
                          className="w-full px-4 py-3 pr-10 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <div className="size-14 rounded-full bg-muted" />
                              {isUnread && (
                                <Pin className="absolute -right-1 -top-1 size-3.5 fill-primary text-primary" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xl font-medium">
                                  {renderHighlightedText(thread.name, query)}
                                </p>
                                <span className="shrink-0 text-sm text-muted-foreground">
                                  {thread.lastAt}
                                </span>
                              </div>
                              <p className="truncate text-base text-muted-foreground">
                                {renderHighlightedText(
                                  thread.lastMessage,
                                  query,
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                        {thread.unread > 0 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                            {thread.unread > 99 ? "99+" : thread.unread}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-muted" />
                      <div>
                        <h2 className="text-2xl font-medium">
                          {selectedThread?.name ?? "Select conversation"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedThread?.role ?? "No active conversation"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                    >
                      <Ellipsis className="size-5" />
                    </Button>
                  </div>
                </div>

                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  {!selectedThread && (
                    <p className="text-sm text-muted-foreground">
                      Pick a conversation from the left.
                    </p>
                  )}
                  {selectedMessages.map((message) => {
                    const mine = message.from === "me";
                    const likeKey = message.serverId ?? String(message.id);
                    const isMessageLiked = likedMessageIds.includes(likeKey);
                    const fileLabel = message.fileName ?? "Download file";

                    return (
                      <div key={likeKey} className="mb-5">
                        <div className="group/message relative flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
                          <div className="absolute right-2 top-0 z-10 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-border bg-background p-1 opacity-0 shadow-sm transition-opacity duration-150 group-hover/message:opacity-100">
                            <button
                              type="button"
                              aria-label={
                                isMessageLiked
                                  ? "Unlike message"
                                  : "Like message"
                              }
                              onClick={() =>
                                setLikedMessageIds((prev) =>
                                  prev.includes(likeKey)
                                    ? prev.filter((id) => id !== likeKey)
                                    : [...prev, likeKey],
                                )
                              }
                              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Heart
                                className={`size-4 ${
                                  isMessageLiked
                                    ? "fill-red-500 text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                            {mine && (
                              <button
                                type="button"
                                aria-label="Delete message"
                                onClick={() =>
                                  void handleDeleteMessage(message.serverId)
                                }
                                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label="More message actions"
                              disabled
                              className="cursor-not-allowed rounded-md p-1 text-muted-foreground/50"
                            >
                              <Ellipsis className="size-4" />
                            </button>
                          </div>
                          <div className="mt-1 size-10 shrink-0 rounded-full bg-muted" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <p className="text-xl font-medium">
                                {mine ? "You" : selectedThread?.name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {message.at}
                              </span>
                            </div>

                            <MessageImageGrid
                              imageUrls={message.imageUrls ?? []}
                            />

                            {message.fileUrl ? (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                📎 {fileLabel}
                              </a>
                            ) : (
                              <p className="max-w-full whitespace-pre-wrap wrap-anywhere text-lg leading-7 text-foreground">
                                {renderHighlightedText(message.text, query)}
                              </p>
                            )}
                            {mine && (
                              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                                {message.read ? "Seen" : "Sent"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border px-4 py-3">
                  <input
                    id="jobby-chat-image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageInput}
                    disabled={
                      !selectedThread || !currentUserId || attachmentUploading
                    }
                  />
                  <input
                    id="jobby-chat-file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleGenericFileInput}
                    disabled={
                      !selectedThread || !currentUserId || attachmentUploading
                    }
                  />
                  {pendingImages.length > 0 && (
                    <div className="mb-3 rounded-xl bg-muted/40 p-2">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {pendingImages.length}/{MAX_IMAGE_ATTACHMENTS} photos
                          selected
                        </p>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {pendingImages.map((item, index) => (
                          <div key={item.id} className="relative">
                            <img
                              src={item.previewUrl}
                              alt={`Pending upload ${index + 1}`}
                              className="h-20 w-full rounded-lg border border-border object-cover"
                            />
                            <button
                              type="button"
                              aria-label={`Remove selected image ${index + 1}`}
                              onClick={() => removePendingImage(item.id)}
                              className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1 text-foreground"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pendingGenericFile && (
                    <div className="mb-3 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                      <p className="truncate text-xs">
                        📎 {pendingGenericFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPendingGenericFile(null)}
                        className="rounded-full border border-border bg-background p-1 text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() =>
                        document
                          .getElementById("jobby-chat-image-upload")
                          ?.click()
                      }
                      disabled={
                        !selectedThread || !currentUserId || attachmentUploading
                      }
                    >
                      <Image className="size-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() =>
                        document
                          .getElementById("jobby-chat-file-upload")
                          ?.click()
                      }
                      disabled={
                        !selectedThread || !currentUserId || attachmentUploading
                      }
                    >
                      <FileText className="size-5" />
                    </Button>
                    <div className="flex-1">
                      <textarea
                        ref={composerTextareaRef}
                        rows={1}
                        placeholder="Aa"
                        value={draft}
                        onChange={(event) =>
                          handleDraftChange(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key !== "Enter" ||
                            event.shiftKey ||
                            event.nativeEvent.isComposing
                          ) {
                            return;
                          }
                          event.preventDefault();
                          void handleSendComposer();
                        }}
                        disabled={
                          !selectedThread ||
                          !currentUserId ||
                          attachmentUploading
                        }
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 mb-[-1.5%] min-h-10 max-h-44 w-full resize-none rounded-3xl border bg-transparent px-4 py-2 leading-6 outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant={
                        draft.trim() ||
                        pendingImages.length ||
                        pendingGenericFile
                          ? "default"
                          : "ghost"
                      }
                      className={
                        draft.trim() ||
                        pendingImages.length ||
                        pendingGenericFile
                          ? "gap-1 px-4"
                          : "gap-1 text-muted-foreground"
                      }
                      onClick={() => void handleSendComposer()}
                      disabled={
                        !selectedThread || !currentUserId || attachmentUploading
                      }
                    >
                      <ArrowUp className="size-4" />
                      send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
