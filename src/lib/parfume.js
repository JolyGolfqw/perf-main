function parseJsonList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizeCategory(value) {
  const raw = String(value || '').trim().toLowerCase();

  if (['male', 'men', 'man', 'm'].includes(raw)) return 'male';
  if (['female', 'women', 'woman', 'f'].includes(raw)) return 'female';
  if (['unisex', 'uni', 'u'].includes(raw)) return 'unisex';

  return 'unisex';
}

function normalizeBadge(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (['new', 'novelty', 'fresh'].includes(raw)) return 'new';
  if (['hit', 'bestseller', 'best', 'popular', 'top'].includes(raw)) return 'hit';
  return '';
}

export function resolveParfumeId(item) {
  return item?.id ?? item?.ID ?? item?._id ?? item?.parfume?.id ?? item?.parfume?.ID ?? item?.parfume?._id ?? null;
}

export function normalizeParfume(item) {
  const notes = parseJsonList(item.notes);
  const availableVolumes = parseJsonList(item.available_volumes);
  const pricePerMl = Number(item.price_per_ml ?? item.price ?? 0);

  return {
    id: resolveParfumeId(item),
    name: item.name || '',
    description: item.description || item.desc || '',
    brand: item.brand || '',
    category: normalizeCategory(item.category),
    notes,
    notesText: notes.join(', '),
    price_per_ml: pricePerMl,
    price: pricePerMl,
    available_volumes: availableVolumes,
    availableVolumes,
    image_url: item.image_url || item.img || '',
    img: item.image_url || item.img || '',
    is_active: item.is_active ?? true,
    badge: normalizeBadge(item.badge),
    created_at: item.created_at || item.CreatedAt || '',
    updated_at: item.updated_at || item.UpdatedAt || '',
  };
}

export function normalizeParfumeList(items = []) {
  return items.map(normalizeParfume);
}

export function createParfumeFormPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    brand: form.brand.trim(),
    category: form.category,
    notes: form.notes
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    price_per_ml: Number(form.price_per_ml),
    available_volumes: form.available_volumes
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((value) => Number.isFinite(value) && value > 0),
    badge: form.badge,
    is_active: form.is_active,
    imageFile: form.imageFile,
    image_url: form.imageUrl,
  };
}

export function productToForm(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    brand: product.brand || '',
    category: product.category || 'unisex',
    notes: Array.isArray(product.notes) ? product.notes.join(', ') : product.notesText || '',
    price_per_ml: String(product.price_per_ml ?? product.price ?? ''),
    available_volumes: Array.isArray(product.available_volumes)
      ? product.available_volumes.join(', ')
      : Array.isArray(product.availableVolumes)
        ? product.availableVolumes.join(', ')
        : '',
    badge: product.badge || '',
    is_active: product.is_active ?? true,
    imageFile: null,
    imageUrl: product.image_url || product.img || '',
    imagePreview: '',
  };
}
