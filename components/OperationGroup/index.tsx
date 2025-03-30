"use client";
import { OrbButtonSmall } from "@/utils/styled";
import { addToast } from "@heroui/react";
import DecryptButton from "../DecryptButton";
import EncryptButton from "../EncryptButton";
import MemoryDownloader from "../MemoryDownloader";
import MemoryUploader from "../MemoryUploader";

export default function OperationGroup({ className }: { className?: string }) {
  return (
    <div className={`${className} flex gap-6 justify-center`}>
      <EncryptButton onUploadFinished={(id) => addToast({ color: "success", title: "Upload success", description: `Arweave TX ID: ${id}` })}>
        {(onOpen) => (
          <OrbButtonSmall onClick={onOpen}>
            Share
          </OrbButtonSmall>
        )}
      </EncryptButton>
      <DecryptButton>
        {(onOpen) => (
          <OrbButtonSmall onClick={onOpen}>
            Decrypt
          </OrbButtonSmall>
        )}
      </DecryptButton>
      <MemoryUploader></MemoryUploader>
      <MemoryDownloader></MemoryDownloader>
    </div>
  );
}
