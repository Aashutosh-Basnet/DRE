// app/page.tsx
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChatMessage, DocumentMetadata, UploadResponse } from "../app/types/types";
import { UploadSection } from "../app/components/UploadSection";
import { ChatWindow } from "../app/components/ChatWindow";
import { ChatInputForm } from "../app/components/ChatInput";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function Home() {
  const initialSessionId = useMemo(() => createId(), []);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [documentIds, setDocumentIds] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const clearFileSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      setSelectedFiles([]);
      return;
    }

    const limitedFiles = Array.from(files).slice(0, 2);
    setSelectedFiles(limitedFiles);
  };

  const handleUploadDocuments = async () => {
    if (!selectedFiles.length) {
      setUploadError("Select up to two documents to upload.");
      return;
    }

    setUploadError(null);
    setChatError(null);
    setIsUploading(true);

    const formData = new FormData();
    selectedFiles.slice(0, 2).forEach((file) => {
      formData.append("files", file);
    });

    if (sessionId.trim()) {
      formData.append("session_id", sessionId.trim());
    }

    try {
      const response = await fetch(`${API_BASE_URL}/document/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to upload documents.");
      }

      const data: UploadResponse = await response.json();
      setSessionId(data.session_id);

      setUploadedDocs((prev) => {
        const merged = new Map(prev.map((doc) => [doc.document_id, doc]));
        data.documents?.forEach((doc) => merged.set(doc.document_id, doc));
        return Array.from(merged.values());
      });

      setDocumentIds((prev) => {
        const existing = prev
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        const mergedIds = Array.from(
          new Set([
            ...existing,
            ...data.documents.map((doc) => doc.document_id),
          ])
        );
        return mergedIds.join(", ");
      });

      clearFileSelection();
    } catch (uploadErr) {
      const message =
        uploadErr instanceof Error
          ? uploadErr.message
          : "Unable to upload documents.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    if (!sessionId.trim()) {
      setChatError("Please provide a session ID before asking a question.");
      return;
    }

    setChatError(null);
    const question = input.trim();
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const formattedDocumentIds = documentIds
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          session_id: sessionId.trim(),
          document_ids: formattedDocumentIds.length
            ? formattedDocumentIds
            : null,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to reach the RAG service.");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content:
          data.answer?.trim() ||
          "I wasn't able to find an answer in your documents.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Something went wrong.";
      setChatError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setSessionId(createId());
    setMessages([]);
    setChatError(null);
    setUploadedDocs([]);
    setDocumentIds("");
    setUploadError(null);
    clearFileSelection();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex flex-1 flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">RAG Workspace</p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Chat with your indexed documents
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Ask focused questions. Responses are constrained to the retrieved
                context.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 p-4 text-sm md:w-auto">
              <label className="flex flex-col gap-1" htmlFor="sessionId">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Session ID
                </span>
                <input
                  id="sessionId"
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={handleNewSession}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              >
                Start fresh session
              </button>
            </div>
          </header>

          <UploadSection
            selectedFiles={selectedFiles}
            onFilesChange={handleFilesChange}
            onUpload={handleUploadDocuments}
            onClearSelection={clearFileSelection}
            isUploading={isUploading}
            uploadError={uploadError}
            uploadedDocs={uploadedDocs}
          />

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            chatContainerRef={chatContainerRef}
          />

          <ChatInputForm
            input={input}
            onInputChange={setInput}
            documentIds={documentIds}
            onDocumentIdsChange={setDocumentIds}
            isLoading={isLoading}
            chatError={chatError}
            onSubmit={handleSubmit}
          />
        </section>
      </main>
    </div>
  );
}
