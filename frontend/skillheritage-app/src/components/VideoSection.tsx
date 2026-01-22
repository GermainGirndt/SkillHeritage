// This component embeds and manages the video playback interface for a specific tutorial recording.
import { View, Text, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { theme } from '../styles/theme';

type Props = { videoUri: string };

export default function VideoSection({ videoUri }: Props) {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={true}
        contentFit="contain"
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