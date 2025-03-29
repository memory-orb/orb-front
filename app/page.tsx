"use client";
import MessageRecords from "@/components/ChatRecord";
import { MessageInput } from "@/components/ChatInput/message-input-box";
import { ReplyMessageBox } from "@/components/ChatReply/message-reply-box";
import character from "@/public/character.png";
import { memoryService } from "@/utils/memoryService";
import { addToast } from "@heroui/toast";
import Image from "next/image";
import { useState } from "react";
import { useChat } from "@/contexts/chatContext";

export default function Home() {
  const [lastMessage, setLastMessage] = useState("");
  const [lastReply, setLastReply] = useState({ content: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { sendMessage } = useChat();

  const handleSendMessage = async (message: string) => {
    setLastMessage(message);
    setLastReply({ content: "(Thinking...)" });
    await sendMessage({
      message,
      onChunk: (chunk) => {
        setLastReply((oldReply) => {
          if (oldReply.content === "(Thinking...)") {
            return {
              content: chunk,
            };
          }
          return {
            content: `${oldReply.content}${chunk}`,
          };
        });
      },
      onError: (error) => {
        addToast({
          title: "Error sending message",
          description: error.message,
          color: "danger",
        });
      }
    });
  };

  const handleLoadMemory = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);

    try {
      console.log("Loading memory...");
      const file = event.target.files?.[0];
      if (!file) {
        throw new Error("No file selected");
      }
      await memoryService.importMemory(file);
      console.log("File uploaded successfully:", file.name, file.size, "bytes");
    } catch {
    } finally {
      setIsLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const fileName = await memoryService.exportMemory();
      console.log(`Memory exported: ${fileName}`);
    } catch (error) {
      console.error("Error during file download:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-[url(../public/bg-home.png)] w-screen h-screen bg-cover bg-center bg-no-repeat flex">
      <div className="flex-row flex left-0 right-0 w-full mx-auto gap-32 max-w-[1180px]">
        {/* Left container */}
        <Image
          src={character}
          alt="character"
          className="w-[258px] h-[381px] mt-auto mb-20"
          width={258}
          height={381}
        />
        {/* Right container */}
        <div className="flex-grow flex flex-col gap-10 h-[calc(100vh-80px)] p-5">
          <ReplyMessageBox className="flex-grow" reply={lastReply} />
          <MessageRecords
            message={lastMessage}
            handleLoadMemory={handleLoadMemory}
            handleDownload={handleDownload}
            isDownloading={isDownloading}
            isLoading={isLoading}
            className="flex"
          />
          <MessageInput onSend={(message) => handleSendMessage(message)} />
        </div>
      </div>
    </div>
  );
}