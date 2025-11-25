from langchain_core.prompts import ChatPromptTemplate

QA_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "you are a helpful assitant that ONLY uses the provided context to answer questions.",
            "If the answer is not in the context, respond exactly with "
            " 'I don't know based on provide context(documents)'. Include internal knowledge.",
        ),
        (
            "human",
            "Context:\n{context}\n\nQuestion: {question}\n\nProvide a concise answer.",
        ),
    ]
)