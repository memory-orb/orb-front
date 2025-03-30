"use client";
import { OrbButtonSmall } from "@/utils/styled";
import { addToast } from "@heroui/react";
import EncryptButton from "../EncryptButton";
import MemoryDownloader from "../MemoryDownloader";
import MemoryUploader from "../MemoryUploader";

export default function OperationGroup({ className }: { className?: string }) {
  return (
    <div className={`${className} flex gap-6 justify-center`}>
      <EncryptButton onUploadFinished={(id) => addToast({ color: "success", title: "Upload success", description: `Arweave TX ID: ${id}` })}>
        {(onOpen) => (
          <OrbButtonSmall onClick={onOpen}>
            分享记忆
          </OrbButtonSmall>
        )}
      </EncryptButton>
      <MemoryUploader></MemoryUploader>
      <MemoryDownloader></MemoryDownloader>
    </div>
  );
}
