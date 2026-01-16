// This component embeds and manages the video playback interface for a specific tutorial recording.
import { View, Text, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { theme } from '../styles/theme';
import { API } from '../services/api';

type Props = { videoUri: string };

export default function VideoSection({ videoUri }: Props) {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUri }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
      />
      <Text style={styles.label}>Recording Player</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 12,
  },
  video: {
    height: 180,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  label: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
