"use client";

export interface ReplyMessageBoxProps {
  reply: {
    content: string;
  };
  className?: string;
}

export function ReplyMessageBox({ reply, className = "" }: ReplyMessageBoxProps) {
  return (
    <div className={`${className}`}>
      <div
        id="reply-bubble"
        className="relative min-h-48 rounded-[20px] border-[#A55D4F] border-[2px] p-[20px] bg-[#FDF1EA] mt-[50px]"
      >
        <div id="name-tag" className="absolute" />
        <div>{reply.content}</div>
      </div>
    </div>
  );
}
