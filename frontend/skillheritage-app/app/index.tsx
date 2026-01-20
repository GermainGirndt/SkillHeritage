import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { theme } from "../src/styles/theme";
// import { API } from "../src/services/api";

// Should we really use @react-native-voice? It just works in dev builds, not in Expo Go.
// It think it's better to use the native microphone access from expo-audio or expo-camera
// and then convert it into text via an API call to the backend (or locally using Whisper).
import { Audio } from "expo-av";

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
  const [isRecordingSearch, setIsRecordingSearch] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // const API_URL = "http://10.212.51.177:3000";
  // const API_URL = "http://192.168.0.35:3000";
  // const API_URL = "http://10.208.69.172:3000";
  const API_URL = "http://localhost:3000";
  

  const fetchTutorials = async (query: string = "") => {
    setLoading(true);

    if (query.trim() === "") {
      setLoading(false);
      setTutorialSearchHits([]);
      return;
    }

    try {
      const apiClient: ITutorialsSemanticSearchAPIClient = new DummyTutorialsSemanticSearchAPIClient();
      const results = await apiClient.search(query, 5);
      setTutorialSearchHits(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTutorials(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const startRecordingSearch = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setIsRecordingSearch(true);
      }
    } catch (err) { console.error(err); }
  };

  const stopRecordingSearch = async () => {
    setIsRecordingSearch(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) handleTranscription(uri);
  };

  const handleTranscription = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", { uri, type: "audio/m4a", name: "search_query.m4a" } as any);
      const response = await fetch(`${API_URL}/tutorials/stt`, { method: "POST", body: formData });
      // const response = await fetch(`${API.uploadVideo}/stt`, { method: "POST", body: formData  });
      const data = await response.json();
      if (data.text) setSearch(data.text);
    } catch (e) {
      Alert.alert("Error", "Could not process voice search.");
    } finally { setLoading(false); }
  };

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
        <Pressable
          style={[styles.micButton, isRecordingSearch && { backgroundColor: "#ff4444" }]}
          onPressIn={startRecordingSearch}
          onPressOut={stopRecordingSearch}
        >
          <Text style={styles.micIcon}>{isRecordingSearch ? "🔴" : "🎙️"}</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.accentGold} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tutorialSearchHits}
          keyExtractor={(item) => item.tutorial.id}
          ListEmptyComponent={<Text style={styles.empty}>No tutorials found.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/Tutorial/${item.tutorial.id}`)}
            >
              <Text style={styles.cardTitle}>{item.tutorial.title}</Text>
              <Text style={styles.cardSubtitle}>{item.tutorial.shortDescription}</Text>
            </Pressable>
          )}
        />
      )}

      <AudioRecorder onRecorded={(uri) => console.log("Recorded file:", uri)} />
      <Pressable style={styles.fab} onPress={() => router.push("/record")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 20 },
  logo: { fontSize: 20, fontWeight: "700", color: theme.colors.accentGold, marginBottom: 16 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  searchInput: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, color: "#fff", marginRight: 10 },
  micButton: { backgroundColor: theme.colors.primary, width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  micIcon: { fontSize: 20 },
  empty: { color: theme.colors.textSecondary, textAlign: "center", marginTop: 40 },
  card: { backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: theme.colors.textMain, fontSize: 16, fontWeight: "600" },
  cardSubtitle: { color: theme.colors.textSecondary, marginTop: 8 },
  fab: { position: "absolute", right: 24, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  fabText: { color: "#fff", fontSize: 32 },
});