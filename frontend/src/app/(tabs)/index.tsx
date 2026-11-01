import { Text, View, StyleSheet, ActivityIndicator, FlatList, Pressable, Alert} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { globalStyles } from "@/styles/global";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable"
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";


const API_URL = "http://localhost:4000";
const ACTION_WIDTH = 80;


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

function DeleteAction({ drag, onPress }: { drag: SharedValue<number>; onPress: () => void }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + ACTION_WIDTH }],
  }));

  return (
    <Reanimated.View style={[styles.deleteAction, animatedStyle]}>
      <Pressable style={styles.deleteButton} onPress={onPress}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </Reanimated.View>
  );
}

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

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };
  const deleteProduct = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== id));
    try {
      const res = await fetch(`${API_URL}/products/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      Alert.alert("Delete failed", e instanceof Error ? e.message : "Something went wrong");
      load();
    }
  };

  const confirmDelete = (item: Item, close: () => void) => {
    Alert.alert("Delete product", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel", onPress: close },
      { text: "Delete", style: "destructive", onPress: () => deleteProduct(item.product_id) },
    ]);
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
          <Swipeable
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            renderRightActions={(_progress, drag, methods) => (
              <DeleteAction drag={drag} onPress={() => confirmDelete(item, methods.close)} />
            )}
          >
            <Pressable style={globalStyles.card} 
              onPress={() => router.push(`/product/${item.product_id}`)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>
                Retail: ₺{item.base_price.toLocaleString("tr-TR")}
              </Text>
              <Text style={styles.price}>
                Current: ₺{item.latest_price.price.toLocaleString("tr-TR")}
              </Text>
              {item.latest_price.campaign_price != null && (
                <Text style={globalStyles.campaign}>
                  Campaign: {item.latest_price.campaign_price}
                  {` · ${item.latest_price.campaign_desc}`}
                </Text>
              )}
            </Pressable>
          </Swipeable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 15, fontWeight: "600" },
  price: { fontSize: 14, marginTop: 4, opacity: 0.8 },
  deleteAction: { width: ACTION_WIDTH },
  deleteButton: {
    flex: 1,
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "600" },
});