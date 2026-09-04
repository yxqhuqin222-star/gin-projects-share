"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  classifyRequestFailure,
  classifyStatus,
  ErrorKind,
} from "./error-config";
import { ErrorState } from "./error-state";

type ChatMessage = {
  id: string;
  role: "visitor" | "assistant" | "operator";
  text: string;
  status?: "sent" | "waiting" | "delivered" | "failed";
  createdAt: string;
};

type ConsultResponse = {
  sessionId: string;
  messages: ChatMessage[];
  relay?: {
    mode: "lark-cli" | "feishu";
    status: string;
  };
  error?: string;
};

const storageKey = "gin-consultation-session";
const refreshIntervalMs = 1000;
const requestTimeoutMs = 8000;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export function ConsultationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("api");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const helperText = useMemo(() => {
    if (!messages.length) {
      return "可以问网站相关的任何问题";
    }

    return "对话会保存在当前浏览器会话里。";
  }, [messages.length]);

  const refreshMessages = useCallback(async (nextSessionId: string) => {
    try {
      const response = await fetchWithTimeout(
        `/api/consult?sessionId=${encodeURIComponent(nextSessionId)}`,
      );
      const payload = (await response.json()) as ConsultResponse;

      if (!response.ok) {
        setErrorKind(classifyStatus(response.status));
        setError(payload.error || "对话暂时没有加载成功。");
        return;
      }

      setError("");

      if (payload.messages) {
        setMessages(payload.messages);
      }
    } catch (refreshError) {
      setErrorKind(classifyRequestFailure(refreshError));
      setError("对话暂时没有加载成功。");
    }
  }, []);

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem(storageKey);

    if (storedSessionId) {
      window.queueMicrotask(() => {
        setSessionId(storedSessionId);
        void refreshMessages(storedSessionId);
      });
    }
  }, [refreshMessages]);

  useEffect(() => {
    if (!isOpen || !sessionId) {
      return;
    }

    const refreshTimeout = window.setTimeout(() => {
      void refreshMessages(sessionId);
    }, 0);

    const interval = window.setInterval(() => {
      void refreshMessages(sessionId);
    }, refreshIntervalMs);

    return () => {
      window.clearTimeout(refreshTimeout);
      window.clearInterval(interval);
    };
  }, [isOpen, refreshMessages, sessionId]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || isSending) {
      return;
    }

    setIsSending(true);
    setError("");
    setInput("");
    let nextErrorKind: ErrorKind = "api";

    try {
      const response = await fetchWithTimeout("/api/consult", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message,
        }),
      });
      const payload = (await response.json()) as ConsultResponse;

      if (!response.ok) {
        nextErrorKind = classifyStatus(response.status);
        throw new Error(payload.error || "发送失败");
      }

      setSessionId(payload.sessionId);
      window.localStorage.setItem(storageKey, payload.sessionId);
      setMessages(payload.messages);
    } catch (sendError) {
      setErrorKind(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "network"
          : sendError instanceof DOMException
            ? classifyRequestFailure(sendError)
            : nextErrorKind,
      );
      setError(sendError instanceof Error ? sendError.message : "发送失败");
      setInput(message);
    } finally {
      setIsSending(false);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();

    if (!input.trim() || isSending) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  }

  function closePanel() {
    setIsOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  return (
    <aside className={`consultation ${isOpen ? "is-open" : ""}`} aria-label="咨询对话">
      <button
        className="consultation-trigger"
        type="button"
        ref={triggerRef}
        aria-expanded={isOpen}
        aria-controls="consultation-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        问Gin
      </button>

      {isOpen ? (
        <section className="consultation-panel" id="consultation-panel">
          <header className="consultation-header">
            <div>
              <p>
                <span aria-hidden="true" />
                真人回复
              </p>
              <h2>把问题发给 Gin</h2>
            </div>
            <button
              className="consultation-close"
              type="button"
              aria-label="关闭咨询窗口"
              onClick={closePanel}
            >
              ×
            </button>
          </header>

          <div className="consultation-messages" ref={messageListRef} aria-live="polite">
            {messages.length === 0 ? (
              <div className="consultation-empty">
                <p>{helperText}</p>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  className={`consultation-message ${message.role}`}
                  key={message.id}
                >
                  <p>{message.text}</p>
                </article>
              ))
            )}
          </div>

          <form className="consultation-form" onSubmit={handleSubmit}>
            <label htmlFor="consultation-input">
              <span>你的问题</span>
              <span>{input.length}/800</span>
            </label>
            <textarea
              id="consultation-input"
              maxLength={800}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="比如：可以加微信细聊吗"
              rows={3}
              value={input}
            />
            <div className="consultation-actions">
              {error ? (
                <ErrorState
                  kind={errorKind}
                  title={error}
                  description="咨询入口仍可继续使用，检查网络后可以再次发送。"
                />
              ) : (
                <span aria-hidden="true" />
              )}
              <button type="submit" disabled={isSending || !input.trim()}>
                {isSending ? "发送中" : "发送"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </aside>
  );
}
