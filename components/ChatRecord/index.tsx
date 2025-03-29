"use client";

import { useLitProtocol } from "@/contexts/litProtocolContext";
import DecryptButton from "../DecryptButton";
import EncryptButton from "../EncryptButton";

interface LastSendMessageBoxProps {
  message: string;
  className?: string;
  isLoading?: boolean;
  isDownloading?: boolean;
  handleLoadMemory: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDownload: () => Promise<void>;
}

const MessageRecords: React.FC<LastSendMessageBoxProps> = ({
  message,
  className,
  isDownloading,
  isLoading,
  handleDownload,
  handleLoadMemory,
}: LastSendMessageBoxProps) => {
  const { } = useLitProtocol();

  return (
    <div className={`flex flex-col w-full justify-end space-y-[20px] ${className}`}>
      <div className="flex ml-auto gap-2">
        <EncryptButton />
        <DecryptButton />
        <button
          className="w-[122px] h-[34px] rounded-[50px] bg-[rgba(255,255,255,0.7)]"
          onClick={() => {
            document.getElementById("memory-load")?.click();
          }}
          disabled={isLoading}
        >
          <span className="font-normal text-[#666666] text-[16px]">
            {isLoading ? "Loading" : "Load Memory"}
          </span>
        </button>
        <button
          className="w-[122px] h-[34px] rounded-[50px] bg-[rgba(255,255,255,0.7)]"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <span className="font-normal text-[#666666] text-[16px]">
            {isDownloading ? "Saving" : "Save Memory"}
          </span>
        </button>
        <button className="w-[122px] h-[34px] rounded-[50px] bg-[rgba(255,255,255,0.7)]">
          <span className="font-normal text-[#666666] text-[16px]">
            More&nbsp;Records
          </span>
        </button>
        <input
          id="memory-load"
          type="file"
          hidden
          accept=".snapshot"
          onChange={handleLoadMemory}
        />
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
