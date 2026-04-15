"use client";

import { useMemo, useState } from "react";

type CoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function CoverImage({ src, alt, className = "" }: CoverImageProps) {
  const imageUrl = useMemo(() => src?.trim() || "", [src]);
  const [failedUrl, setFailedUrl] = useState("");

  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-4xl font-black text-gray-400 ${className}`}
      >
        Manga
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(imageUrl)}
    />
  );
}
