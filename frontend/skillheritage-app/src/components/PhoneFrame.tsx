import { View, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import VideoSection from './VideoSection';
import ProgressBar from './ProgressBar';
import StepsList from './StepsList';

export default function PhoneFrame() {
  return (
    <View style={styles.phone}>
      <View style={styles.topBar} />
      <View style={styles.content}>
        <VideoSection />
        <ProgressBar />
        <StepsList />
      </View>
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
