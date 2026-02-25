// This screen displays the camera UI and uses the useVideoRecording hook for logic.
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useVideoRecording } from "../src/hooks/useVideoRecording";

export default function RecordScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const { cameraRef, recording, isUploading, handleRecordPress } = useVideoRecording();

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMicrophonePermission();
    })();
  }, []);

  if (!cameraPermission?.granted || !microphonePermission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Permissions required.</Text>
        <Pressable style={styles.permissionButton} onPress={() => { requestCameraPermission(); requestMicrophonePermission(); }}>
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} mode="video" facing="back" />
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "white", marginTop: 10 }}>Uploading to server...</Text>
        </View>
      )}
      <Pressable onPress={handleRecordPress} style={[styles.button, recording && { borderColor: "red" }]}>
        <View style={recording ? styles.stopIcon : styles.startIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  camera: { flex: 1 },
  button: { position: "absolute", bottom: 50, alignSelf: "center", width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: "white", justifyContent: "center", alignItems: "center" },
  startIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "red" },
  stopIcon: { width: 30, height: 30, backgroundColor: "red", borderRadius: 5 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  permissionText: { color: "white", textAlign: "center", marginBottom: 20 },
  permissionButton: { backgroundColor: "gold", padding: 15, borderRadius: 10, alignSelf: "center" },
  permissionButtonText: { fontWeight: "bold" },
});