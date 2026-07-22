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
    mode: "mock" | "lark-cli" | "feishu";
    status: string;
  };
  error?: string;
};

const storageKey = "gin-consultation-session";

export function ConsultationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);

  const helperText = useMemo(() => {
    if (!messages.length) {
      return "可以问网站相关的任何问题";
    }

    return "对话会保存在当前浏览器会话里。";
  }, [messages.length]);

  const refreshMessages = useCallback(async (nextSessionId: string) => {
    const response = await fetch(
      `/api/consult?sessionId=${encodeURIComponent(nextSessionId)}`,
    );
    const payload = (await response.json()) as ConsultResponse;

    if (payload.messages) {
      setMessages(payload.messages);
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

    const interval = window.setInterval(() => {
      void refreshMessages(sessionId);
    }, 5000);

    return () => window.clearInterval(interval);
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

    try {
      const response = await fetch("/api/consult", {
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
        throw new Error(payload.error || "发送失败");
      }

      setSessionId(payload.sessionId);
      window.localStorage.setItem(storageKey, payload.sessionId);
      setMessages(payload.messages);
    } catch (sendError) {
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

  return (
    <aside className={`consultation ${isOpen ? "is-open" : ""}`} aria-label="咨询对话">
      <button
        className="consultation-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls="consultation-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        问Gin
      </button>

      <section className="consultation-panel" id="consultation-panel">
        <header className="consultation-header">
          <div>
            <p>
              <span aria-hidden="true" />
              真人回复
            </p>
            <h2>有什么问题，直接问我。</h2>
          </div>
          <button
            className="consultation-close"
            type="button"
            aria-label="关闭咨询窗口"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </header>

        <div className="consultation-messages" ref={messageListRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="consultation-empty">
              <p>{helperText}</p>
              <span>本地会先用 mock 飞书回复验证链路。</span>
            </div>
          ) : (
            messages.map((message) => (
              <article
                className={`consultation-message ${message.role}`}
                key={message.id}
              >
                <p>{message.text}</p>
                {message.status === "waiting" ? <span>等待回复</span> : null}
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
            {error ? <p role="alert">{error}</p> : <span aria-hidden="true" />}
            <button type="submit" disabled={isSending || !input.trim()}>
              {isSending ? "发送中" : "发送"}
            </button>
          </div>
        </form>
      </section>
    </aside>
  );
}
