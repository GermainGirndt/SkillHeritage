// This screen displays the detailed view of a tutorial, including video playback, a timestamped timeline, and AI-generated instructions.
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/src/styles/theme";
import ITutorial from "@/models/ITutorial";
import VideoSection, {
  VideoSectionHandle,
} from "@/src/components/VideoSection";

import ProgressBar from "@/src/components/ProgressBar";
import StepItem from "@/src/components/StepItem";
import { TutorialsApiClient } from "@/api/tutorial.api.client";
import env from "@/config/dotenv";

export default function TutorialDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const videoRef = useRef<VideoSectionHandle>(null);

  const [tutorial, setTutorial] = useState<ITutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "manual">("timeline");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function loadTutorial() {
      if (!id) return;
      try {
        // const data = await TutorialsRepository.getById(id as string);
        console.log(`Fetching tutorial data`);
        const tutorial = await TutorialsApiClient.getById(id as string);

        setTutorial(tutorial);

        // If processing is not complete, check again in 5 seconds
        if (tutorial.processingStatus !== "completed") {
          timer = setTimeout(loadTutorial, 5000);
        }
      } catch (e) {
        console.error("Failed to load tutorial", e);
      } finally {
        setLoading(false);
      }
    }
    loadTutorial();
    return () => clearTimeout(timer);
  }, [id]);

  if (loading && !tutorial)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accentGold} />
        <Text style={{ color: "white", marginTop: 10 }}>
          Loading tutorial...
        </Text>
      </View>
    );

  if (!tutorial)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Tutorial not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tutorial.title || "Processing..."}
        </Text>
      </View>

      {/* Video section with dynamic stream URL */}
      <VideoSection
        ref={videoRef}
        videoUri={`${env.DEFAULT_BACKEND_API_BASE_URL}/tutorials/${id}/video/stream`}
      />

      {/* Tabs to switch between Video Timeline and Text Guide */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "timeline" && styles.activeTab]}
          onPress={() => setActiveTab("timeline")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "timeline" && styles.activeTabText,
            ]}
          >
            Video Timeline
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "manual" && styles.activeTab]}
          onPress={() => setActiveTab("manual")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "manual" && styles.activeTabText,
            ]}
          >
            Tutorial Guide 📄
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {tutorial.processingStatus !== "completed" ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color={theme.colors.accentGold} />
            <Text style={styles.statusText}>
              ✨ AI is generating your tutorial steps...
            </Text>
            <Text style={styles.subStatusText}>
              This will take about a minute.
            </Text>
          </View>
        ) : activeTab === "timeline" ? (
          <View>
            <View style={styles.progressSection}>
              <ProgressBar
                progress={
                  tutorial.timelinedAudioTranscript?.length > 0
                    ? ((activeStepIndex + 1) /
                        tutorial.timelinedAudioTranscript.length) *
                      100
                    : 0
                }
                title={
                  tutorial.timelinedAudioTranscript
                    ? tutorial.timelinedAudioTranscript[activeStepIndex]?.text
                    : "Introduction"
                }
              />
            </View>

            <View style={styles.stepsList}>
              {tutorial.timelinedAudioTranscript?.map((item, index) => (
                <StepItem
                  key={index}
                  time={`${Math.floor(item.timestamp / 60)}:${Math.floor(
                    item.timestamp % 60,
                  )
                    .toString()
                    .padStart(2, "0")}`}
                  title={`Step ${item.order}`}
                  description={item.text}
                  active={index === activeStepIndex}
                  onPress={() => {
                    setActiveStepIndex(index);
                    videoRef.current?.seekTo(item.timestamp);
                  }}
                />
              ))}
            </View>
          </View>
        ) : (
          /* AI-generated text instruction section */
          <View style={styles.manualContainer}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>GENERATED BY AI FROM VIDEO</Text>
            </View>
            <View style={styles.manualCard}>
              <Text style={styles.manualTitle}>Full Tutorial Instructions</Text>
              <Text style={styles.manualContent}>
                {tutorial.structuredInstructions}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push("/record")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  error: { color: "white", textAlign: "center" },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { color: "#fff", fontSize: 16, marginRight: 15 },
  headerTitle: {
    color: theme.colors.accentGold,
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: theme.colors.primary },
  tabText: { color: theme.colors.textSecondary, fontWeight: "bold" },
  activeTabText: { color: theme.colors.primary },
  content: { flex: 1 },
  progressSection: {
    padding: 20,
    backgroundColor: theme.colors.card,
    marginBottom: 10,
  },
  stepsList: { padding: 20 },
  statusBox: { padding: 40, alignItems: "center" },
  statusText: { color: "#fff", marginTop: 20, fontWeight: "bold" },
  subStatusText: { color: "#888", marginTop: 5, fontSize: 12 },
  manualContainer: { padding: 20 },
  aiBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#333",
    padding: 6,
    borderRadius: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  aiBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "bold",
  },
  manualCard: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
  },
  manualTitle: {
    color: theme.colors.accentGold,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  manualContent: { color: "#ddd", lineHeight: 22, fontSize: 14 },
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
      web: { boxShadow: "0px 4px 4px rgba(0,0,0,0.3)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "300" },
});
