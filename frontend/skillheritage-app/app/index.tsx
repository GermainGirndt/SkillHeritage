import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { theme } from "../src/styles/theme";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import { InstructionsSemanticSearchService } from "@/domain/semantic-search/SemanticSearchService";
import Instruction from "@/models/Instructions";

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fetchInstructions = async (query: string = "") => {
    setLoading(true);

    if (query.trim() === "") {
      setLoading(false);
      setInstructions([]);
      return;
    }

    try {
      // commented, since we use the SemanticSearchService now
      // const response = await fetch(
      //   `http://10.212.62.23:3000/instructions?q=${query}`
      // );
      // const data = await response.json();

      const results = await InstructionsSemanticSearchService.search(query, 5);
      const instructionsFromService = results.map((res) => res.result);
      setInstructions(instructionsFromService);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInstructions(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        setSearch(e.value[0]);
        setIsListening(false);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startVoiceSearch = async () => {
    if (!Voice) {
      alert(
        "Voice recognition is not supported in Expo Go. Use a Development Build."
      );
      return;
    }
    try {
      setIsListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopVoiceSearch = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillHeritage</Text>

      <TextInput
        placeholder="Search instructions..."
        placeholderTextColor="#888"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <Pressable
        style={[
          styles.voiceButton,
          isListening && { backgroundColor: "#ff4444" },
        ]}
        onPressIn={startVoiceSearch}
        onPressOut={stopVoiceSearch}
      >
        <Text style={styles.voiceText}>
          {isListening ? "Listening..." : "🎙️ Voice search"}
        </Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator
          color={theme.colors.accentGold}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={instructions}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>No instructions yet</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/instructions/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>
                {item.transcript.fullText.slice(0, 20) + "..."}
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.accentGold,
    marginBottom: 16,
  },
  search: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 12,
  },
  voiceButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  voiceText: {
    color: "#fff",
    fontWeight: "600",
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
  },
  cardTitle: {
    color: theme.colors.textMain,
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
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
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
  },
});
