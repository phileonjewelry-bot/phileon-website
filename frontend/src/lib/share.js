export async function shareProduct({ title, text, url }) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  // Mobile native share
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return { ok: true, method: "native" };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  // Desktop fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { ok: true, method: "copy" };
  } catch (e) {
    return { ok: false, error: e };
  }
}