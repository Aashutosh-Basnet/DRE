import { DocumentMetadata } from "../types/types";

export function DocumentList({ documents }: { documents: DocumentMetadata[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">Indexed documents</p>
      <ul className="space-y-3 text-sm text-slate-600">
        {documents.map((doc) => (
          <li
            key={doc.document_id}
            className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-900">{doc.filename}</span>
                <span className="text-xs font-mono text-slate-500">
                  {doc.document_id.slice(0, 8)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {doc.chunk_count} chunk{doc.chunk_count === 1 ? "" : "s"} ·{" "}
                {doc.content_type}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
