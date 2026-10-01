"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

type RevealProps = HTMLAttributes<HTMLDivElement>;

export function Reveal({ className = "", ...props }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.dataset.revealReady = "true";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      element.dataset.revealVisible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.revealVisible = "true";
        observer.unobserve(entry.target);
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`reveal-item ${className}`.trim()}
      {...props}
    />
  );
}
