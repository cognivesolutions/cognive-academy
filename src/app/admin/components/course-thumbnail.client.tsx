"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  defaultImg?: string;
  loading?: "lazy" | "eager";
};

export default function CourseThumbnail({
  src,
  alt = "",
  className = "",
  defaultImg,
  loading = "lazy",
}: Props) {
  const DEFAULT_IMG =
    defaultImg ?? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";

  const initial = src ?? DEFAULT_IMG;
  const [current, setCurrent] = useState<string>(initial);

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      className={className}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement;
        if (target.src !== DEFAULT_IMG) target.src = DEFAULT_IMG;
      }}
    />
  );
}
