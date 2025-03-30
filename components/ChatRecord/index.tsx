"use client";
import DecryptButton from "../DecryptButton";
import EncryptButton from "../EncryptButton";
import { addToast } from "@heroui/toast";
import { OrbButton } from "@/utils/styled";
import MemoryUploader from "../MemoryUploader";
import MemoryDownloader from "../MemoryDownloader";

interface LastSendMessageBoxProps {
  message: string;
  className?: string;
}

const MessageRecords: React.FC<LastSendMessageBoxProps> = ({
  message,
  className,
}: LastSendMessageBoxProps) => {
  return (
    <div className={`flex flex-col w-full justify-end space-y-[20px] ${className}`}>
      <div className="flex ml-auto gap-2">
        <EncryptButton onUploadFinished={(id) => addToast({ color: "success", title: "Upload success", description: `Arweave TX ID: ${id}` })}>
          {(onOpen) => (
            <OrbButton onClick={onOpen}>
              Share
            </OrbButton>
          )}
        </EncryptButton>
        <DecryptButton>
          {(onOpen) => (
            <OrbButton onClick={onOpen}>
              Decrypt
            </OrbButton>
          )}
        </DecryptButton>
        <MemoryUploader></MemoryUploader>
        <MemoryDownloader></MemoryDownloader>
      </div>
      <div
        className="w-full p-[40px] rounded-[15px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)",
        }}
      >
        <span
          className="font-bold text-[26px]"
          style={{
            letterSpacing: "0em",
          }}
        >
          {message}
        </span>
      </div>
    </div>
  );
}

export default MessageRecords;
