import { ChatRecord } from "@/types";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SendMessageParams {
  message: string,
  onChunk?: (chunk: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
}

const FingerPrintContext = createContext<{
  fingerprint: string;
  records: Readonly<ChatRecord>[];
  sendMessage: (params: Readonly<SendMessageParams>) => Promise<void>;
}>({
  fingerprint: "",
  records: [],
  sendMessage: async () => { throw new Error("Not implemented"); },
});

export const ChatProvider = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  const [fingerprint, setFingerprint] = useState<string>("");
  const [records, setRecords] = useState<Readonly<{
    role: "ai" | "user";
    content: string;
  }>[]>([]);

  useEffect(() => {
    const loadFp = async () => {
      const fingerprint = await FingerprintJS.load();
      const { visitorId } = await fingerprint.get();

      setFingerprint(visitorId);
    }
    loadFp();
  }, []);

  const sendMessage = useCallback(async ({
    message,
    onChunk,
    onDone,
    onError,
  }: Readonly<SendMessageParams>): Promise<void> => {
    try {
      setRecords((oldRecords) => [...oldRecords, { role: "user", content: message }]);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message,
          user_id: fingerprint,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI response failed:", errorText);
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      // 处理服务器发送的事件流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("No readable stream available");
      }

      let resp = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim());

              if (data.content) {
                resp += data.content;
                onChunk?.(data.content);
              }

              if (data.done) {
                onDone?.();
                return;
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn("Error parsing SSE data:", parseError);
            }
          }
        }
      }

      setRecords((oldRecords) => [...oldRecords, { role: "ai", content: resp }]);
      onDone?.();
    } catch (error) {
      console.error("Error in streaming chat:", error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [fingerprint]);

  return (
    <FingerPrintContext.Provider value={{ fingerprint, records, sendMessage }}>
      {children}
    </FingerPrintContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(FingerPrintContext);
  if (!context) {
    throw new Error("useChat() must be used within a FingerprintProvider");
  }
  return context;
}