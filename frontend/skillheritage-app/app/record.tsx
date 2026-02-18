// TODO: Gosia:move to a separate file
// This screen handles video recording for both Web and Android platforms.
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { theme } from "../src/styles/theme";
import { API } from "../src/services/api";
import { DefaultTutorialsApiClient } from "@/api/TutorialApiClient";

let mediaRecorder: any = null;
let videoChunks: any[] = [];

export default function RecordScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [recording, setRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMicrophonePermission();
    })();
  }, []);

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      mediaRecorder = new MediaRecorder(stream);
      videoChunks = [];

      mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) videoChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const videoBlob = new Blob(videoChunks, {
            type: "video/webm",
          });
          const videoUrl = URL.createObjectURL(videoBlob);

          await uploadVideo(videoUrl, videoBlob);

          console.log("Video uploaded successfully");
        } catch (err) {
          console.error("Upload failed:", err);
        }

        // 5. Stop all media tracks (important!)
        mediaRecorder.stream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());

        // 6. Reset state
        videoChunks = [];
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
      console.log("Recording on laptop has started");
    } catch (err) {
      console.error("Error on camera web:", err);
      alert("Web camera error");
    }
  };

  const stopWebRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      console.log("Stopped recording on laptop");
    }
  };

  const startMobileRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setRecording(true);
      const video = await cameraRef.current.recordAsync({
        quality: "720p",
      } as any);

      if (video && video.uri) {
        await uploadVideo(video.uri);
      }
    } catch (err) {
      console.error("Mobile Recording Error:", err);
      setRecording(false);
      Alert.alert("Error", "Recording failed.");
    }
  };

  const stopMobileRecording = async () => {
    if (cameraRef.current) {
      setRecording(false);
      await cameraRef.current.stopRecording();
    }
  };

  const handleRecordPress = () => {
    if (Platform.OS === "web") {
      recording ? stopWebRecording() : startWebRecording();
    } else {
      recording ? stopMobileRecording() : startMobileRecording();
    }
  };

  async function uploadVideo(uri: string, webBlob?: Blob): Promise<string> {
    setIsUploading(true);

    let tutorialIdPrivate = "";
    try {
      tutorialIdPrivate = await DefaultTutorialsApiClient.uploadVideo({
        uri,
        webBlob,
      });

      setIsUploading(false);

      console.log(`Uploaded video with tutorial ID: ${tutorialIdPrivate}`);
      if (!tutorialIdPrivate) {
        throw new Error("No tutorial ID returned from upload");
      }
      router.replace({
        pathname: "/Tutorial/[id]",
        params: { id: tutorialIdPrivate },
      });
    } catch (e) {
      console.error("Upload error:", e);
      console.log("Upload error details:");
      console.log(JSON.stringify(e));
      console.log(e instanceof Error ? e.message : e);

      const msg = "Upload failed. Check server connection";
      Platform.OS === "web" ? alert(msg) : Alert.alert("Error", msg);
    } finally {
      setIsUploading(false);
    }
    return tutorialIdPrivate;
  }

  if (!cameraPermission || !microphonePermission) {
    return <View style={styles.container} />;
  }
  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera and microphone access is required.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={() => {
            requestCameraPermission();
            requestMicrophonePermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" && !recording ? (
        <View style={styles.webPlaceholder}>
          <Text style={{ color: "white" }}>Web Camera Ready</Text>
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          mode="video"
          facing="back"
        />
      )}

      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "white", marginTop: 10 }}>
            Uploading to server...
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleRecordPress}
        style={[styles.button, recording && { borderColor: "red" }]}
      >
        <View style={recording ? styles.stopIcon : styles.startIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  camera: { flex: 1 },
  webPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionText: { color: "white", textAlign: "center", marginBottom: 20 },
  permissionButton: {
    backgroundColor: "gold",
    padding: 15,
    borderRadius: 10,
    alignSelf: "center",
  },
  permissionButtonText: { fontWeight: "bold" },
  button: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  startIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "red",
  },
  stopIcon: { width: 30, height: 30, backgroundColor: "red", borderRadius: 5 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
});
