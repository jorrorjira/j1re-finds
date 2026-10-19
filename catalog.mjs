export function filterProducts(products, { query = '', category = 'all' } = {}) {
  const search = query.trim().normalize('NFC').toLocaleLowerCase('th');
  return products.filter(product => {
    const matchesCategory = category === 'all' || product.category === category;
    const text = [product.id, product.name, ...(product.tags || [])].join(' ').normalize('NFC').toLocaleLowerCase('th');
    return matchesCategory && text.includes(search);
  });
}

export function affiliateHref({ url, demo = false }) {
  if (demo || typeof url !== 'string' || url !== url.trim()) return null;
  try {
    const parsed = new URL(url);
    const hosts = ['s.shopee.co.th', 'shope.ee', 'shopee.co.th', 'www.shopee.co.th'];
    return parsed.protocol === 'https:' && hosts.includes(parsed.hostname) && !parsed.username && !parsed.password && !parsed.port ? url : null;
  } catch {
    return null;
  }
}
