// This component displays technical and functional information about the SkillHeritage system.
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { theme } from "../styles/theme";

export default function SystemInfoModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Information</Text>
      <View style={styles.separator} />
      <Text style={styles.description}>
        SkillHeritage is an industrial-grade documentation system. 
        It leverages AI-driven transcription and structuring to preserve 
        expert technical knowledge through video-based tutorials.
      </Text>
      
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Return to Dashboard</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.accentGold,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    width: "80%",
    backgroundColor: "#333",
    marginVertical: 20,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  link: {
    marginTop: 30,
    padding: 15,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});