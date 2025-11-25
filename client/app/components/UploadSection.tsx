import { ChangeEvent } from "react";
import { DocumentMetadata } from "../types/types";
import { DocumentList } from "./DocumentList";

type UploadSectionProps = {
  selectedFiles: File[];
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onClearSelection: () => void;
  isUploading: boolean;
  uploadError: string | null;
  uploadedDocs: DocumentMetadata[];
};

export function UploadSection({
  selectedFiles,
  onFilesChange,
  onUpload,
  onClearSelection,
  isUploading,
  uploadError,
  uploadedDocs,
}: UploadSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Upload documents</h2>
          <p className="text-sm text-slate-500">
            We index up to two files per upload. Supported formats: PDF, TXT, DOCX,
            Markdown.
          </p>
        </div>
        {uploadedDocs.length > 0 && (
          <span className="text-xs font-medium text-slate-500">
            {uploadedDocs.length} file{uploadedDocs.length > 1 ? "s" : ""} indexed
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="document-upload">
          Choose files
        </label>
        <input
          id="document-upload"
          type="file"
          multiple
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={onFilesChange}
          className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 focus:border-slate-900 focus:outline-none"
        />
        {selectedFiles.length > 0 && (
          <ul className="space-y-2 text-sm text-slate-600">
            {selectedFiles.map((file) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100"
              >
                <span className="truncate pr-3">{file.name}</span>
                <span className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onUpload}
            disabled={isUploading}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isUploading ? "Uploading…" : "Upload & index"}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={!selectedFiles.length || isUploading}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition enabled:hover:border-slate-900 enabled:hover:text-slate-900 disabled:cursor-not-allowed"
          >
            Clear selection
          </button>
        </div>
        {uploadError && <p className="text-sm text-rose-600">{uploadError}</p>}
      </div>

      {uploadedDocs.length > 0 && (
        <div className="mt-5">
          <DocumentList documents={uploadedDocs} />
        </div>
      )}
    </div>
  );
}
