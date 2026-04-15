export function getPagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 50 ? limit : 10;

  const skip = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, skip };
}