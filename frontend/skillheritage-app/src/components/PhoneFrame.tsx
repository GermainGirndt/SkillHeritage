import { View, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.phone}>
      <View style={styles.topBar} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    width: 360,
    height: 720,
    backgroundColor: theme.colors.bg,
    borderRadius: 24,
    overflow: 'hidden',
  },
  topBar: {
    height: 40,
    backgroundColor: theme.colors.card,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
