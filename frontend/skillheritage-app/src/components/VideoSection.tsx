import { View, Text, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { theme } from '../styles/theme';
import { forwardRef, useImperativeHandle } from 'react';

type Props = { videoUri: string };

export interface VideoSectionHandle {
  seekTo: (seconds: number) => void;
}

const VideoSection = forwardRef<VideoSectionHandle, Props>(({ videoUri }, ref) => {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false
    player.play();
  });

  // Expose seekTo to parent
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (player) {
        player.replay();
        player.seekBy(seconds);
        
      }
    },
  }));

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
});

export default VideoSection;

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