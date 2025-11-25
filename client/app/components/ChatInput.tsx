import { FormEvent } from "react";

type ChatInputFormProps = {
  input: string;
  onInputChange: (value: string) => void;
  documentIds: string;
  onDocumentIdsChange: (value: string) => void;
  isLoading: boolean;
  chatError: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatInputForm({
  input,
  onInputChange,
  documentIds,
  onDocumentIdsChange,
  isLoading,
  chatError,
  onSubmit,
}: ChatInputFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm" htmlFor="question">
        <span className="font-medium text-slate-700">Your question</span>
        <textarea
          id="question"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          rows={3}
          placeholder="Ask something specific about your documents…"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-900"
        />
      </label>

      <label
        className="flex flex-col gap-1 text-xs text-slate-500"
        htmlFor="documentIds"
      >
        <span className="font-semibold uppercase tracking-wide">
          Document filter (optional)
        </span>
        <input
          id="documentIds"
          value={documentIds}
          onChange={(event) => onDocumentIdsChange(event.target.value)}
          placeholder="Comma-separated document IDs to restrict retrieval"
          className="rounded-2xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-900"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          {isLoading ? "Awaiting response…" : "Responses stay within this session's context."}
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          {chatError && <p className="text-sm text-rose-600">{chatError}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Sending…" : "Send question"}
          </button>
        </div>
      </div>
    </form>
  );
}
