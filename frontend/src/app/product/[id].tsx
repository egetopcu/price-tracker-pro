import { Text, View, StyleSheet, ActivityIndicator, FlatList, Linking, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { globalStyles } from "@/styles/global";

const API_URL = "http://localhost:4000";

type Price = {
  price_id: number;
  product_id: number;
  price: number;
  campaign_price: number | null;
  campaign_desc: string | null;
  created_at: string;
};

type ProductDetail = {
  product_id: number;
  name: string;
  url: string;
  base_price: number;
  prices: Price[];
};

const formatPrice = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ProductHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/prices/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ProductDetail = await res.json();
        setProduct(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={globalStyles.container}>
        <Text>Error: {error ?? "Product not found"}</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>Retail: {formatPrice(product.base_price)}</Text>

      <Pressable style={styles.linkButton} onPress={() => Linking.openURL(product.url)}>
        <Text style={styles.linkText}>Open in store</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Price history</Text>

      <FlatList
        data={product.prices}
        keyExtractor={(p) => String(p.price_id)}
        ListEmptyComponent={<Text style={styles.price}>No prices recorded yet.</Text>}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            {item.campaign_price != null && (
              <Text style={styles.campaign}>
                Campaign: {formatPrice(item.campaign_price)}
                {item.campaign_desc ? ` · ${item.campaign_desc}` : ""}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 18, fontWeight: "700" },
  price: { fontSize: 14, marginTop: 4, opacity: 0.8 },
  date: { fontSize: 13, opacity: 0.6 },
  campaign: { fontSize: 14, marginTop: 4, color: "#2e9e5b" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 6 },
  linkButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#4f9cff",
    alignSelf: "flex-start",
  },
  linkText: { color: "#fff", fontWeight: "600" },
});