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
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  FileText,
  Heart,
  Image,
  Loader2,
  Pin,
  Reply,
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
  replyToId?: string | null;
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
  reply_to_id?: string | null;
};

type MessageReadPayload = {
  user_id: string;
  message_ids: string[];
};

type MessageDeletedPayload = {
  message_id: string;
};

type MessageLikesUpdatedPayload = {
  message_id: string;
  likes: number;
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

const MessageImageGrid = ({
  imageUrls,
  onImageClick,
}: {
  imageUrls: string[];
  onImageClick?: (clickedIndex: number) => void;
}) => {
  const total = imageUrls.length;
  if (total === 0) return null;

  return (
    <div className="mb-2 grid max-w-xl grid-cols-6 gap-1 overflow-hidden rounded-xl border border-border bg-muted/20 p-1">
      {imageUrls.map((imageUrl, index) => (
        <button
          type="button"
          onClick={() => onImageClick?.(index)}
          key={`${imageUrl}-${index}`}
          className={`${getDiscordTileClasses(total, index)} overflow-hidden rounded-md`}
        >
          <img
            src={imageUrl}
            alt={`Attachment ${index + 1}`}
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
          />
        </button>
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
    replyToId: message.reply_to_id ?? null,
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
  const [likesCountByMessageId, setLikesCountByMessageId] = useState<
    Record<string, number>
  >({});
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    imageUrls: string[];
    currentIndex: number;
  } | null>(null);

  const selectedThreadIdRef = useRef(selectedThreadId);
  const pendingImagesRef = useRef(pendingImages);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  pendingImagesRef.current = pendingImages;

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
    setReplyingTo(null);
  }, [selectedThreadId]);

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

  useEffect(() => {
    if (!lightboxState) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxState(null);
        return;
      }
      if (event.key === "ArrowRight") {
        setLightboxState((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            currentIndex:
              (previous.currentIndex + 1) % previous.imageUrls.length,
          };
        });
        return;
      }
      if (event.key === "ArrowLeft") {
        setLightboxState((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            currentIndex:
              (previous.currentIndex - 1 + previous.imageUrls.length) %
              previous.imageUrls.length,
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxState]);

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

  const getQuotedMessage = (message: ChatMessage) => {
    if (!message.replyToId || !selectedThread) return null;
    return (messagesByThread[selectedThread.id] ?? []).find(
      (candidate) => candidate.serverId === message.replyToId,
    );
  };

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

    const onMessageLikesUpdated = (payload: MessageLikesUpdatedPayload) => {
      const messageId = String(payload?.message_id ?? "").trim();
      if (!messageId) return;
      setLikesCountByMessageId((prev) => ({
        ...prev,
        [messageId]: Math.max(0, Number(payload.likes ?? 0)),
      }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("message_read", onMessageRead);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("message_likes_updated", onMessageLikesUpdated);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("message_read", onMessageRead);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("message_likes_updated", onMessageLikesUpdated);
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

  useEffect(() => {
    const messageIds = selectedMessages
      .map((message) => message.serverId)
      .filter((id): id is string => Boolean(id));
    if (!messageIds.length || !currentUserId) return;

    let cancelled = false;
    const loadLikes = async () => {
      const entries = await Promise.all(
        messageIds.map(async (messageId) => {
          try {
            const response = await fetch(
              `${chatServiceBaseUrl}/chat/message/${messageId}/likes`,
            );
            if (!response.ok) return { messageId, count: 0, likedByMe: false };
            const likes = (await response.json()) as Array<{ id?: string }>;
            return {
              messageId,
              count: likes.length,
              likedByMe: likes.some((like) => like?.id === currentUserId),
            };
          } catch {
            return { messageId, count: 0, likedByMe: false };
          }
        }),
      );

      if (cancelled) return;
      setLikesCountByMessageId((prev) => {
        const next = { ...prev };
        entries.forEach((entry) => {
          next[entry.messageId] = entry.count;
        });
        return next;
      });
      setLikedMessageIds((prev) => {
        const nextSet = new Set(prev);
        entries.forEach((entry) => {
          if (entry.likedByMe) {
            nextSet.add(entry.messageId);
          } else {
            nextSet.delete(entry.messageId);
          }
        });
        return Array.from(nextSet);
      });
    };

    void loadLikes();
    return () => {
      cancelled = true;
    };
  }, [chatServiceBaseUrl, currentUserId, selectedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [selectedThreadId, selectedMessages.length]);

  const sendSocketMessage = (payload: {
    messageType: number;
    messageData?: string;
    imageUrls?: string[];
    replyToId?: string;
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
        ...(payload.messageData ? { message_data: payload.messageData } : {}),
        ...(payload.imageUrls ? { image_urls: payload.imageUrls } : {}),
        ...(payload.replyToId ? { reply_to_id: payload.replyToId } : {}),
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
      replyToId: replyingTo?.serverId,
      onErrorMessage: "Message send failed:",
    });
    setDraft("");
  };

  const handleToggleReaction = async (message: ChatMessage) => {
    const messageId = message.serverId;
    if (!messageId || !currentUserId) return;
    const currentlyLiked = likedMessageIds.includes(messageId);

    setLikedMessageIds((prev) =>
      currentlyLiked
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
    setLikesCountByMessageId((prev) => ({
      ...prev,
      [messageId]: Math.max(
        0,
        (prev[messageId] ?? 0) + (currentlyLiked ? -1 : 1),
      ),
    }));

    const socket = getTypedSocket();
    if (socket?.connected) {
      socket.emit(currentlyLiked ? "unlike_message" : "like_message", {
        message_id: messageId,
      });
      return;
    }

    const method = currentlyLiked ? "DELETE" : "POST";
    try {
      const response = await fetch(
        `${chatServiceBaseUrl}/chat/message/${messageId}/like/${currentUserId}`,
        { method },
      );
      if (!response.ok) throw new Error("Like update failed");
      const payload = (await response.json()) as { likes?: number };
      setLikesCountByMessageId((prev) => ({
        ...prev,
        [messageId]: Math.max(0, Number(payload.likes ?? prev[messageId] ?? 0)),
      }));
    } catch {
      setLikedMessageIds((prev) =>
        currentlyLiked
          ? [...prev, messageId]
          : prev.filter((id) => id !== messageId),
      );
      setLikesCountByMessageId((prev) => ({
        ...prev,
        [messageId]: Math.max(
          0,
          (prev[messageId] ?? 0) + (currentlyLiked ? 1 : -1),
        ),
      }));
    }
  };

  const handleReplyToMessage = (message: ChatMessage) => {
    setReplyingTo(message);
    composerTextareaRef.current?.focus();
  };

  const handleCancelReply = () => setReplyingTo(null);

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
      const uploadedUrls: string[] = [];
      for (const item of queue) {
        const url = await uploadChatAsset(item.file, "image");
        uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        sendSocketMessage({
          messageType: ChatMessageType.Image,
          imageUrls: uploadedUrls,
          replyToId: replyingTo?.serverId,
          onErrorMessage: "Image send failed:",
        });
      }
      clearImageDraft();
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
        ...(messageType === ChatMessageType.Image
          ? { imageUrls: [url] }
          : { messageData: payload }),
        replyToId: replyingTo?.serverId,
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
      setReplyingTo((prev) =>
        prev?.serverId === messageServerId ? null : prev,
      );
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
    if (replyingTo) setReplyingTo(null);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const textarea = composerTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 176)}px`;
  };

  const handleOpenLightbox = (imageUrls: string[], clickedIndex: number) => {
    if (!imageUrls.length) return;
    setLightboxState({ imageUrls, currentIndex: clickedIndex });
  };

  const handleCloseLightbox = () => setLightboxState(null);

  const handleLightboxNext = () => {
    setLightboxState((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        currentIndex: (previous.currentIndex + 1) % previous.imageUrls.length,
      };
    });
  };

  const handleLightboxPrevious = () => {
    setLightboxState((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        currentIndex:
          (previous.currentIndex - 1 + previous.imageUrls.length) %
          previous.imageUrls.length,
      };
    });
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
                    const messageImageUrls = message.imageUrls ?? [];
                    const quotedMessage = getQuotedMessage(message);
                    const likesCount = message.serverId
                      ? (likesCountByMessageId[message.serverId] ?? 0)
                      : 0;

                    return (
                      <div key={likeKey} className="mb-5">
                        <div className="group/message relative flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
                          <div className="absolute right-2 top-0 z-10 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-border bg-background p-1 opacity-0 shadow-sm transition-opacity duration-150 group-hover/message:opacity-100">
                            <button
                              type="button"
                              aria-label="Reply to message"
                              onClick={() => handleReplyToMessage(message)}
                              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Reply className="size-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={
                                isMessageLiked
                                  ? "Unlike message"
                                  : "Like message"
                              }
                              onClick={() => void handleToggleReaction(message)}
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
                              {likesCount > 0 && (
                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                  {likesCount} like{likesCount > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            {message.replyToId && (
                              <div className="mb-2 max-w-xl rounded-lg border-l-2 border-primary bg-muted/40 px-3 py-2">
                                <p className="mb-0.5 text-xs font-medium text-primary">
                                  Reply
                                </p>
                                {quotedMessage ? (
                                  quotedMessage.fileUrl ? (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                      📎{" "}
                                      {quotedMessage.fileName ?? "Attachment"}
                                    </p>
                                  ) : quotedMessage.imageUrls?.length ? (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                      📷{" "}
                                      {quotedMessage.imageUrls.length > 1
                                        ? `${quotedMessage.imageUrls.length} photos`
                                        : "Photo"}
                                    </p>
                                  ) : (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                      {quotedMessage.text || "Message"}
                                    </p>
                                  )
                                ) : (
                                  <p className="line-clamp-2 text-xs italic text-muted-foreground">
                                    Original message unavailable
                                  </p>
                                )}
                              </div>
                            )}

                            <MessageImageGrid
                              imageUrls={messageImageUrls}
                              onImageClick={(clickedIndex) =>
                                handleOpenLightbox(
                                  messageImageUrls,
                                  clickedIndex,
                                )
                              }
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
                  <div ref={messagesEndRef} />
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
                  {attachmentUploading && (
                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                      <Loader2 className="size-3.5 animate-spin" />
                      Uploading attachment...
                    </div>
                  )}
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
                              disabled={attachmentUploading}
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
                        disabled={attachmentUploading}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                  {replyingTo && (
                    <div className="mb-2 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-xs font-medium text-primary">
                          Replying to{" "}
                          {replyingTo.from === "me"
                            ? "yourself"
                            : selectedThread?.name}
                        </p>
                        {replyingTo.fileUrl ? (
                          <p className="truncate text-xs text-muted-foreground">
                            📎 {replyingTo.fileName ?? "Attachment"}
                          </p>
                        ) : replyingTo.imageUrls?.length ? (
                          <p className="truncate text-xs text-muted-foreground">
                            📷{" "}
                            {replyingTo.imageUrls.length > 1
                              ? `${replyingTo.imageUrls.length} photos`
                              : "Photo"}
                          </p>
                        ) : (
                          <p className="truncate text-sm text-muted-foreground">
                            {replyingTo.text}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label="Cancel reply"
                        onClick={handleCancelReply}
                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
                      >
                        <X className="size-3.5" />
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
                      {attachmentUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowUp className="size-4" />
                      )}
                      {attachmentUploading ? "sending..." : "send"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {lightboxState && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 px-4 pb-4 pt-10"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={handleCloseLightbox}
        >
          <button
            type="button"
            aria-label="Close image viewer"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={handleCloseLightbox}
          >
            <X className="size-5" />
          </button>
          {lightboxState.imageUrls.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              onClick={(event) => {
                event.stopPropagation();
                handleLightboxPrevious();
              }}
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          <div
            className="mt-3 flex h-[calc(100vh-7rem)] w-full max-w-6xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex h-full w-full flex-col items-center">
              <div className="flex h-[76vh] w-full items-center justify-center overflow-x-auto overflow-y-hidden">
                <img
                  src={lightboxState.imageUrls[lightboxState.currentIndex]}
                  alt={`Expanded attachment ${lightboxState.currentIndex + 1}`}
                  className="h-full w-auto max-w-none rounded-lg object-contain"
                />
              </div>
              <div className="absolute bottom-20 rounded-full bg-black/45 px-3 py-1 text-sm text-white">
                {lightboxState.currentIndex + 1} /{" "}
                {lightboxState.imageUrls.length}
              </div>
            </div>
            {lightboxState.imageUrls.length > 1 && (
              <div className="mt-3 flex max-w-full gap-2 overflow-x-auto px-2 pb-2">
                {lightboxState.imageUrls.map((thumbnailUrl, index) => {
                  const isActive = index === lightboxState.currentIndex;
                  return (
                    <button
                      key={`${thumbnailUrl}-${index}`}
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
                      className={`shrink-0 overflow-hidden rounded-md border ${
                        isActive ? "border-white" : "border-white/30"
                      }`}
                    >
                      <img
                        src={thumbnailUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-14 w-14 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {lightboxState.imageUrls.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              onClick={(event) => {
                event.stopPropagation();
                handleLightboxNext();
              }}
            >
              <ChevronRight className="size-6" />
            </button>
          )}
        </div>
      )}
    </PageLayout>
  );
}
