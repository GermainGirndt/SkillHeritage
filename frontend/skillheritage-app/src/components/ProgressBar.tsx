import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function ProgressBar() {
  const progress = 40; // % – potem z backendu lub stanu

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.title}>Sharpening the Blade</Text>
        <Text style={styles.timer}>04:00 / 10:00</Text>
      </View>

      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  timer: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  bar: {
    marginTop: 8,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
});
