export const API_BASE = 'http://192.168.1.23:4000';
 
export type Price = {
  price_id: number;
  product_id: number;
  price: number;
  campaign_price: number | null;
  campaing_desc: string | null;
  created_at: string;
};
 
export type Product = {
  product_id: number;
  name: string;
  url: string;
  base_price: number;
  latest_price: Price | null;
};
 
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
 
export const api = {
  listProducts: () => request<Product[]>('/api/products'),
  getPriceHistory: (productId: number) =>
    request<Price[]>(`/api/products/${productId}/prices`),
  addProduct: (url: string) =>
    request<{ added: boolean; reason?: string }>('/api/products', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  removeProduct: (productId: number) =>
    request<{ removed: boolean }>(`/api/products/${productId}`, {
      method: 'DELETE',
    }),
};