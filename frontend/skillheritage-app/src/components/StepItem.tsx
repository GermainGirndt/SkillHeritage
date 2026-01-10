import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../styles/theme';

type Props = {
  time: string;
  title: string;
  description: string;
  active?: boolean;
  onPress?: () => void;
};

export default function StepItem({
  time,
  title,
  description,
  active,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.item, active && styles.active]}>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    marginBottom: 12,
    opacity: 0.5,
  },
  active: {
    opacity: 1,
    borderColor: theme.colors.accentGold,
    borderWidth: 1,
  },
  time: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    width: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  desc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
