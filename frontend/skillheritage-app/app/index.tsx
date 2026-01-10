import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/styles/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillHeritage</Text>

      <Pressable
        style={styles.card}
        onPress={() => router.push('/player')}
      >
        <Text style={styles.cardTitle}>Last recording</Text>
        <Text style={styles.cardMeta}>Tap to play</Text>
      </Pressable>

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/record')}
      >
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
    fontWeight: '700',
    color: theme.colors.accentGold,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    color: theme.colors.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
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
