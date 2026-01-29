import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { theme } from "../src/styles/theme";
import { TutorialsRepository } from "@/api/tutorial.api.client";

import {
  ITutorialSemanticSearchHit,
  DummyTutorialsSemanticSearchAPIClient,
  ITutorialsSemanticSearchAPIClient,
} from "@/api/semantic-search.api.client";
import AudioRecorder from "./AudioRecorder";

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tutorialSearchHits, setTutorialSearchHits] = useState<ITutorialSemanticSearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTutorials = async (query: string = "") => {
    setLoading(true);

    try {
      if (query.trim() === "") {
        const allData = await TutorialsRepository.getAll();
        
        const mappedResults = allData.map((t: any) => ({
          tutorial: t,
          score: 1,
          fileId: t._id, 
          filename: t.videoFileName
        }));
        setTutorialSearchHits(mappedResults);
      } else {
        const apiClient: ITutorialsSemanticSearchAPIClient = new DummyTutorialsSemanticSearchAPIClient();
        const results = await apiClient.search(query, 5);
        setTutorialSearchHits(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials("");
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTutorials(search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillHeritage</Text>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for tutorials..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          color={theme.colors.accentGold}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={tutorialSearchHits}
          keyExtractor={(item) => item.tutorial._id}
          ListEmptyComponent={
            <Text style={styles.empty}>No tutorials found.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/Tutorial/${item.tutorial._id}`)}
            >
              <Text style={styles.cardTitle}>{item.tutorial.title}</Text>
              <Text style={styles.cardSubtitle}>
                {item.tutorial.shortDescription}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push("/record")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 20 },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.accentGold,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    color: "#fff",
  },
  empty: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.3)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  cardTitle: { color: theme.colors.textMain, fontSize: 16, fontWeight: "600" },
  cardSubtitle: { color: theme.colors.textSecondary, marginTop: 8 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    ...Platform.select({
      web: { boxShadow: "0px 4px 8px rgba(0,0,0,0.4)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  fabText: { color: "#fff", fontSize: 32 },
});