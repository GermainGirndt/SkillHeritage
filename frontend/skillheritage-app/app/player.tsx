import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { API } from '../src/services/api';

export default function PlayerScreen() {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: API.videoStream }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        style={styles.video}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
