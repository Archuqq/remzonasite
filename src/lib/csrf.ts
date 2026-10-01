export function isSameOriginMutation(
  requestHeaders: Headers,
  siteUrl: string,
): boolean {
  let expected: URL;

  try {
    expected = new URL(siteUrl);
  } catch {
    return false;
  }

  const originHeader = requestHeaders.get("origin");
  let hasValidOrigin = false;
  if (originHeader) {
    try {
      const origin = new URL(originHeader);
      if (origin.origin !== expected.origin) {
        const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
        const isLocalDevelopmentOrigin =
          process.env.NODE_ENV === "development" &&
          localHosts.has(origin.hostname) &&
          requestHeaders.get("host")?.toLowerCase() === origin.host.toLowerCase();
        if (!isLocalDevelopmentOrigin) return false;
      }
      hasValidOrigin = true;
    } catch {
      return false;
    }
  }

  const fetchSite = requestHeaders.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  // A trusted browser Origin is authoritative behind reverse proxies that rewrite Host.
  if (hasValidOrigin) return true;

  const forwardedHost = requestHeaders
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || requestHeaders.get("host");
  if (!host || host.toLowerCase() !== expected.host.toLowerCase()) return false;

  return true;
}
