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
  Ellipsis,
  Heart,
  ImagePlus,
  Paperclip,
  Search,
  SendHorizontal,
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

const MAX_IMAGE_ATTACHMENTS = 10;

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
  const parsedAttachment = parseAttachmentMessageData(message.message_data ?? "");
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
    messageType !== ChatMessageType.Text && messageType !== ChatMessageType.Image
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
    const raw = import.meta.env.VITE_SOCKET_URL?.trim() || "http://localhost:3002";
    return raw.replace(/\/$/, "");
  }, []);

  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImageDraft[]>([]);
  const [pendingGenericFile, setPendingGenericFile] = useState<File | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>({});
  const [likedMessageIds, setLikedMessageIds] = useState<string[]>([]);

  const selectedThreadIdRef = useRef(selectedThreadId);
  const pendingImagesRef = useRef(pendingImages);
  pendingImagesRef.current = pendingImages;

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? null;
  const selectedMessages = selectedThread ? (messagesByThread[selectedThread.id] ?? []) : [];

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
          message.serverId && ids.has(message.serverId) ? { ...message, read: true } : message,
        ),
      };
    });

    const socket = getSocketClient();
    if (socket?.connected) {
      socket.emit("mark_read", { otherUserId: threadId, messageIds });
    }
  };

  useEffect(() => {
    const socket = getSocketClient();
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

      const incomingThreadId = senderId === currentUserId ? receiverId : senderId;
      const isMine = senderId === currentUserId;
      const incomingList = messagesByThread[incomingThreadId] ?? [];
      const mapped = mapMessageFromApi(payload, currentUserId, incomingList.length);

      setMessagesByThread((prev) => {
        const existing = prev[incomingThreadId] ?? [];
        if (payload.id && existing.some((message) => message.serverId === payload.id)) {
          return prev;
        }
        return {
          ...prev,
          [incomingThreadId]: [...existing, { ...mapped, id: existing.length + 1 }],
        };
      });

      setThreads((prev) =>
        prev.some((thread) => thread.id === incomingThreadId)
          ? prev.map((thread) => {
              if (thread.id !== incomingThreadId) return thread;
              const isActive = selectedThreadIdRef.current === incomingThreadId;
              return {
                ...thread,
                lastMessage: threadPreviewLabel(mapped.messageType, mapped.text),
                lastAt: mapped.at,
                unread: isActive || isMine ? thread.unread : thread.unread + 1,
              };
            })
          : [
              {
                id: incomingThreadId,
                name: incomingThreadId,
                role: "User",
                lastMessage: threadPreviewLabel(mapped.messageType, mapped.text),
                lastAt: mapped.at,
                unread: isMine || selectedThreadIdRef.current === incomingThreadId ? 0 : 1,
                online: false,
              },
              ...prev,
            ],
      );

      if (!isMine && selectedThreadIdRef.current === incomingThreadId && payload.id) {
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
            message.serverId && ids.has(message.serverId) ? { ...message, read: true } : message,
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
    const socket = getSocketClient();
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
      const response = await fetch(`${chatServiceBaseUrl}/chat/threads?${params.toString()}`);
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
      const response = await fetch(`${chatServiceBaseUrl}/chat/conversation?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load conversation");
      const payload = (await response.json()) as { messages?: ConversationMessageApi[] };
      const list = [...(payload.messages ?? [])]
        .reverse()
        .map((message, index) => mapMessageFromApi(message, currentUserId, index));
      setMessagesByThread((prev) => ({ ...prev, [threadId]: list }));
    } catch {
      setMessagesByThread((prev) => ({ ...prev, [threadId]: prev[threadId] ?? [] }));
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
      .filter((message) => message.from === "them" && !message.read && message.serverId)
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
    const socket = getSocketClient();
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
          // eslint-disable-next-line no-console
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
    const data = (await response.json()) as { publicUrl: string; signedUrl?: string };
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
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleGenericFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const url = await uploadChatAsset(pendingGenericFile, isImage ? "image" : "file");
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <PageLayout>
      <div className="h-[calc(100vh-56px)] overflow-hidden bg-background p-4">
        <section className="h-full overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex h-full min-h-0">
            <aside className="w-[340px] border-r border-border">
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-xl font-semibold">Messages</h1>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                      socketConnected ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {socketConnected ? "Live" : "Offline"}
                  </span>
                </div>
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search conversations"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="h-[calc(100%-90px)] overflow-y-auto">
                {visibleThreads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      setThreads((prev) =>
                        prev.map((item) => (item.id === thread.id ? { ...item, unread: 0 } : item)),
                      );
                    }}
                    className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left ${
                      selectedThreadId === thread.id ? "bg-muted/50" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="h-11 w-11 rounded-full bg-muted" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{thread.name}</p>
                        <span className="text-xs text-muted-foreground">{thread.lastAt}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                        {thread.unread > 99 ? "99+" : thread.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="text-base font-semibold">
                      {selectedThread?.name ?? "Select conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedThread?.role ?? "No active conversation"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="size-5" />
                </Button>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {!selectedThread && (
                  <p className="text-sm text-muted-foreground">Pick a conversation from the left.</p>
                )}
                {selectedMessages.map((message) => {
                  const mine = message.from === "me";
                  const likeKey = message.serverId ?? String(message.id);
                  const liked = likedMessageIds.includes(likeKey);
                  const fileLabel = message.fileName ?? "Download file";

                  return (
                    <div key={`${message.serverId ?? "local"}-${message.id}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`group relative max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                          mine
                            ? "rounded-br-md bg-[linear-gradient(90deg,var(--color-main),var(--color-second))] text-white"
                            : "rounded-bl-md border border-border bg-white text-foreground"
                        }`}
                      >
                        <div className="absolute -top-3 right-2 hidden items-center gap-1 rounded-lg border border-border bg-white p-1 group-hover:flex">
                          <button
                            type="button"
                            onClick={() =>
                              setLikedMessageIds((prev) =>
                                prev.includes(likeKey) ? prev.filter((id) => id !== likeKey) : [...prev, likeKey],
                              )
                            }
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                          >
                            <Heart className={`size-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                          </button>
                          {mine && (
                            <button
                              type="button"
                              onClick={() => void handleDeleteMessage(message.serverId)}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>

                        {message.imageUrls && message.imageUrls.length > 0 ? (
                          <div className="mb-2 grid grid-cols-2 gap-1">
                            {message.imageUrls.map((url, index) => (
                              <img
                                key={`${url}-${index}`}
                                src={url}
                                alt={`Attachment ${index + 1}`}
                                className="max-h-56 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        ) : null}

                        {message.fileUrl ? (
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={mine ? "underline text-white" : "underline"}
                          >
                            📎 {fileLabel}
                          </a>
                        ) : (
                          <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
                        )}
                        <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/80" : "text-muted-foreground"}`}>
                          {message.at}
                          {mine ? ` • ${message.read ? "Seen" : "Sent"}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border p-3">
                <input
                  id="jobby-chat-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageInput}
                  disabled={!selectedThread || !currentUserId || attachmentUploading}
                />
                <input
                  id="jobby-chat-file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleGenericFileInput}
                  disabled={!selectedThread || !currentUserId || attachmentUploading}
                />

                {pendingImages.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-2">
                    {pendingImages.map((item) => (
                      <div key={item.id} className="relative">
                        <img src={item.previewUrl} alt={item.file.name} className="h-14 w-14 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingImage(item.id)}
                          className="absolute -right-1 -top-1 rounded-full border border-border bg-white p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => void handleSendImages()} disabled={attachmentUploading}>
                      Send images
                    </Button>
                  </div>
                )}

                {pendingGenericFile && (
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2">
                    <p className="truncate text-xs">📎 {pendingGenericFile.name}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => void handleSendGenericFile()} disabled={attachmentUploading}>
                        Send file
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setPendingGenericFile(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => document.getElementById("jobby-chat-image-upload")?.click()}
                    disabled={!selectedThread || !currentUserId || attachmentUploading}
                  >
                    <ImagePlus className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => document.getElementById("jobby-chat-file-upload")?.click()}
                    disabled={!selectedThread || !currentUserId || attachmentUploading}
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={!selectedThread || !currentUserId || attachmentUploading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!selectedThread || !currentUserId || attachmentUploading || !draft.trim()}
                  >
                    <SendHorizontal className="size-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
