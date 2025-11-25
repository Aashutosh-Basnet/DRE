import { RefObject } from "react";
import { ChatMessage } from "../types/types";
import { MessageBubble } from "./MessageBubble";


type ChatWindowProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  chatContainerRef: RefObject<HTMLDivElement | null>;
};

export function ChatWindow({ messages, isLoading, chatContainerRef }: ChatWindowProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50/80 p-4">
      <div
        ref={chatContainerRef}
        className="h-[420px] space-y-4 overflow-y-auto pr-1 sm:h-[520px]"
      >
        {messages.length === 0 && !isLoading ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
            <p className="font-medium text-slate-600">No messages yet</p>
            <p>Share a question about your uploaded documents to get started.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))
        )}
        {isLoading && <MessageBubble role="assistant" content="Thinking…" isPending />}
      </div>
    </div>
  );
}
