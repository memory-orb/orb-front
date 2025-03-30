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
import { useEthers } from "@/contexts/ethersContext";
import { addToast, Divider, Input } from "@heroui/react";

interface UploadButtonProps {
  onUploadFinished?: (arweaveTransId: string) => void;
}

const EncryptButton: React.FC<UploadButtonProps> = ({ onUploadFinished }) => {
  const [condition, setCondition] = useState<AccessControlConditions>([]);
  const [isUploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setArweaveMapping } = useEthers();
  const { uploadFile } = useArweave();
  const { encryptFile } = useLitProtocol();

  const encoder = new TextEncoder();

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

      console.log("conditions", condition);

      const { ciphertext, dataToEncryptHash } = await encryptFile({ file, condition });

      // Upload to arweave
      const uint8Array = encoder.encode(
        JSON.stringify({
          ciphertext,
          dataToEncryptHash,
          condition: condition,
          originalFileName: file.name,
        })
      );
      setStatusMessage("Uploading...");
      const arweaveTransId = await uploadFile(uint8Array.buffer as ArrayBuffer);
      if (arweaveTransId) {
        setStatusMessage(`Uploaded arweave id: ${arweaveTransId}, sharing...`);
        await setArweaveMapping({
          arweaveId: arweaveTransId,
          price: price,
          description: description,
        });
        addToast({ color: "success", title: "Share successfully" });
        onUploadFinished?.(arweaveTransId);
      } else {
        throw new Error("Upload result is empty");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      setStatusMessage("Upload failed");
      throw error;
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
                <Input label="Description" value={description} onValueChange={setDescription} />
                <Input label="Price" value={price} onValueChange={setPrice} />
                <Divider />
                <AccessControlConditionsEditor value={condition} onChange={(newCondition) => { setCondition(newCondition) }} />
                <input
                  id="memory-upload"
                  type="file"
                  hidden
                  accept=".snapshot"
                  onChange={handleUpload}
                />
              </ModalBody>
              <ModalFooter>
                <span>{statusMessage}</span>
                <Button onPress={onClose}>Cancel</Button>
                <Button
                  color="primary"
                  isLoading={isUploading}
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

export default EncryptButton;
