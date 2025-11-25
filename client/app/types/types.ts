export type Role = "user" | "assistant";

export type ChatMessage = {
    id: string;
    role: Role;
    content: string;
}

export type DocumentMetaData = {
    document_id: string;
    filename: string;
    content_type: string;
    stored_path: string;
    chunk_count: number;
}

export type UploadResponse = {
    session_id: string;
    documents: DocumentMetaData[]
}