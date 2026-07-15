import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderHeight?: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export default function LazyImage({
  src,
  alt,
  className,
  placeholderHeight = "h-64",
  ...props
}: LazyImageProps) {
  const [isIntersected, setIsIntersected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fallback if IntersectionObserver is not supported by environment
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "80px", // Trigger slightly before the element becomes fully visible
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]); // Re-observe if src changes

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden w-full ${placeholderHeight}`}
      id={`lazy-image-container-${alt.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Sleek Pulse/Shimmer Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 animate-pulse flex items-center justify-center rounded-2xl">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}

      {isIntersected && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`${className || ""} ${isLoaded ? "block" : "hidden"}`}
          {...props}
        />
      )}
    </div>
  );
}
