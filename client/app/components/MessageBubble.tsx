import { Role } from "../types/types";

export function MessageBubble({
  role,
  content,
  isPending,
}: {
  role: Role;
  content: string;
  isPending?: boolean;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[80%] gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-900 ring-1 ring-slate-100"
        }`}
      >
        {!isUser && (
          <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            RAG
          </span>
        )}
        <p className={`whitespace-pre-line ${isPending ? "text-slate-500" : ""}`}>
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
              </span>
              {content}
            </span>
          ) : (
            content
          )}
        </p>
      </div>
    </div>
  );
}
