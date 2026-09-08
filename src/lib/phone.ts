/**
 * Bangladeshi mobile helpers — single source of truth for every phone
 * field (guest signup, listing contact, WhatsApp, shop owner).
 *
 * - `normalizeBdMobile`: keeps digits only, converts +880/880 country-code
 *   form to the local 01XXXXXXXXX form, caps at 11 chars. Safe to run on
 *   every keystroke (never mangles a valid prefix mid-typing).
 * - `isValidBdMobile`: strict 11-digit 013–019 check for submit-time gates
 *   and inline hints.
 */
export function normalizeBdMobile(raw: string): string {
  let d = raw.replace(/\D/g, '');
  // Convert the Bangladesh country prefix as soon as it is recognisable so
  // typing +880... cannot be truncated at 11 international-format digits.
  if (d.startsWith('880')) d = '0' + d.slice(3);
  return d.slice(0, 11);
}

export function isValidBdMobile(v: string): boolean {
  return /^01[3-9]\d{8}$/.test(v);
}
