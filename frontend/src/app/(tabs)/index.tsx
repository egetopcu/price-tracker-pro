import { Text, View, StyleSheet, ActivityIndicator, FlatList, Linking, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { globalStyles } from "@/styles/global";



const API_URL = "http://localhost:4000"


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
  latest_price: Price | null;
};



export default function Products() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, []);




  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Products</Text>

      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error}</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => Linking.openURL(item.url)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>
              ₺{item.base_price.toLocaleString("tr-TR")}
            </Text>
            {item.latest_price && (
              <Text style={styles.price}>
                Latest: ₺{item.latest_price.price.toLocaleString("tr-TR")}
              </Text>
            )}
          </Pressable>
        )}
      />

    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ffffff22",
  },
  name: { fontSize: 15, fontWeight: "600" },
  price: { fontSize: 14, marginTop: 4, opacity: 0.8 },
});
