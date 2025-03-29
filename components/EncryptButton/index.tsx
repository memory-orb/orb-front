"use client";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import React, { useState } from "react";
import AccessControlConditionsEditor from "./access-condition-editor";
import { AccessControlConditions } from "@lit-protocol/types";
import { useArweave } from "@/contexts/arweaveContext";
import { useLitProtocol } from "@/contexts/litProtocolContext";

interface UploadButtonProps {
  onUploadFinished?: (arweaveTransId: string) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUploadFinished }) => {
  const [conditions, setConditions] = useState<AccessControlConditions>([]);
  const [isUploading, setUploading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { uploadFile } = useArweave();
  const { encryptFile } = useLitProtocol();

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploading(true);

    try {
      // Encrypt
      const file = event.target?.files?.[0];
      if (!file) {
        throw new Error("No file selected");
      }

      console.log("conditions", conditions);

      const { ciphertext, dataToEncryptHash } = await encryptFile(
        file,
        conditions
      );

      // Upload to arweave
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(
        JSON.stringify({
          ciphertext,
          dataToEncryptHash,
          condition: conditions,
          originalFileName: file.name,
        })
      );
      const arweaveTransId = await uploadFile(uint8Array.buffer as ArrayBuffer);
      if (arweaveTransId) {
        onUploadFinished?.(arweaveTransId);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      // setStatusMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        className="w-[122px] h-[34px] rounded-[50px] bg-[rgba(255,255,255,0.7)]"
        onClick={onOpen}
        disabled={isUploading}
      >
        <span className="font-normal text-[#666666] text-[16px]">
          {isUploading ? "Uploading" : "Upload"}
        </span>
      </button>
      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} scrollBehavior="inside" size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="select-none">Encrypt & Upload Memory</ModalHeader>
              <ModalBody>
                <AccessControlConditionsEditor value={conditions} onChange={(condition) => { setConditions(condition) }} />
                <input
                  id="memory-upload"
                  type="file"
                  hidden
                  accept=".snapshot"
                  onChange={handleUpload}
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Cancel</Button>
                <Button
                  color="primary"
                  onPress={() => document.getElementById("memory-upload")?.click()}
                >
                  Upload
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default UploadButton;
