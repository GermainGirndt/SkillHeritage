import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function StepItem({ title, active }: any) {
  return (
    <View style={[styles.item, active && styles.active]}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    marginBottom: 8,
  },
  active: {
    borderColor: theme.colors.accentGold,
    borderWidth: 1,
  },
  text: {
    color: theme.colors.textMain,
  },
});
