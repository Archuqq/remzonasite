"use client";

import { useEffect, useRef, useState } from "react";

type MapEmbedProps = {
  mapUrl: string;
  fallbackUrl: string;
};

type MapStatus = "idle" | "loading" | "loaded" | "error";

export function MapEmbed({ mapUrl, fallbackUrl }: MapEmbedProps) {
  const mapHostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapStatus>("idle");

  useEffect(() => {
    const mapHost = mapHostRef.current;
    if (!mapHost) return;
    const host = mapHost;

    let active = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadMap();
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    function loadMap() {
      if (!active || host.querySelector("script[data-remzona-map]")) {
        return;
      }

      setStatus("loading");
      const script = document.createElement("script");
      script.async = true;
      script.charset = "utf-8";
      script.dataset.remzonaMap = "true";
      script.src = mapUrl;
      script.onload = () => {
        if (active) setStatus("loaded");
      };
      script.onerror = () => {
        if (active) setStatus("error");
      };
      host.appendChild(script);
    }

    observer.observe(host);

    return () => {
      active = false;
      observer.disconnect();
      host.replaceChildren();
    };
  }, [mapUrl]);

  return (
    <div className="relative h-[450px] overflow-hidden bg-section-alt md:h-[520px] lg:h-[560px]">
      <div
        aria-busy={status === "loading"}
        className="h-full w-full"
      >
        {status !== "loaded" ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
            {status === "error" ? (
              <a
                className="font-semibold text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                href={fallbackUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Открыть в Яндекс Картах →
              </a>
            ) : (
              "Карта загружается рядом с сервисом"
            )}
          </div>
        ) : null}
        <div
          className="absolute inset-0"
          data-remzona-map-host="true"
          ref={mapHostRef}
        />
      </div>
      {status === "loaded" ? null : (
        <a
          className="absolute bottom-4 right-4 inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-[0_8px_24px_rgba(21,25,28,0.08)] hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          href={fallbackUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Открыть в Яндекс Картах
        </a>
      )}
    </div>
  );
}