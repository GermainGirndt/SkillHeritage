import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../src/styles/theme';

type Instruction = {
  id: string;
  title: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    /**
     * Hier sollen später die Anleitungen vom Backend / AI geladen werden.
     * Zum Beispiel: Transkriptionen oder generierte Schritt-für-Schritt-Instruktionen.
     */
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillHeritage</Text>

      {/* Text search */}
      <TextInput
        placeholder="Search instructions..."
        placeholderTextColor="#888"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {/* Voice search (UI only) */}
      <Pressable style={styles.voiceButton}>
        <Text style={styles.voiceText}>🎙️ Voice search</Text>
      </Pressable>

      {/* Instruction list from backend */}
      <FlatList
        data={instructions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No instructions yet
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </Pressable>
        )}
      />

      {/* Record video */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/record')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

/**
 * This screen prepares the home UI for displaying AI-generated instructions.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.accentGold,
    marginBottom: 16,
  },
  search: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
  },
  voiceButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  voiceText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
  },
});