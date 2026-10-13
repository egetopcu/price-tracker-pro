import { Text, View, StyleSheet, ActivityIndicator, FlatList, Linking, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
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

type Item = {
  product_id: number;
  name: string;
  url: string;
  base_price: number;
  latest_price: Price;
};

export default function Products() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/prices/latest`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Item[] = await res.json();
      setItems(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Products</Text>

      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error}</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product_id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <Pressable style={globalStyles.card} onPress={() => router.push(`/product/${item.product_id}`)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>
              Retail: ₺{item.base_price.toLocaleString("tr-TR")}
            </Text>
            <Text style={styles.price}>
              Current: ₺{item.latest_price.price.toLocaleString("tr-TR")}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 15, fontWeight: "600" },
  price: { fontSize: 14, marginTop: 4, opacity: 0.8 },
});