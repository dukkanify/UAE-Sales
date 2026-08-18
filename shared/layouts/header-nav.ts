export function categoryPageHref(slug: string) {
  return `/categories/${slug}`;
}

export function categorySearchHref(slug: string, query: string) {
  return `/categories/${slug}?q=${encodeURIComponent(query)}`;
}

export function categoryCityHref(slug: string, city: string) {
  return `/categories/${slug}?city=${encodeURIComponent(city)}`;
}
