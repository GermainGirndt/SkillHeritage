// This component displays a visual progress bar with a title and a calculated timer for the current step.
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

type Props = {
  progress: number;
  title: string;
  duration?: string;
};

export default function ProgressBar({ progress, title, duration = '10:00' }: Props) {
  const currentTime =
    progress === 0 ? '00:00' : `0${Math.floor(progress / 10)}:30`;

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.timer}>
          {currentTime} / {duration}
        </Text>
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
