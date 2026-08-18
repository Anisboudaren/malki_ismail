export const PAGE_SIZE = 20;
export const LIBRARY_PAGE_SIZE = 24;

export function parsePage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function pageArgs(page: number, size = PAGE_SIZE) {
  const p = Math.max(1, page);
  return { skip: (p - 1) * size, take: size, page: p };
}

export function pageCount(total: number, size = PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, total) / size));
}
