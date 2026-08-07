import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML emitted from the backend before it touches the DOM.
 * Runs identically on server and client (isomorphic). Every
 * `dangerouslySetInnerHTML` site must pass through here — never render
 * raw user/editor content.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe'],
    FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload'],
  });
}