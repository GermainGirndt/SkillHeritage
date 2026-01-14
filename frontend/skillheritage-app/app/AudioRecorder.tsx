import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
} from "expo-audio";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

type Props = {
  onRecorded?: (uri: string) => void;
};

export default function AudioRecorder({ onRecorded }: Props) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  console.log(
    `Camera permission: ${cameraPermission?.status}, Microphone permission: ${microphonePermission?.status}`
  );

  // Recorder
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // Player (hook-managed, safe even when source is null)
  const player = useAudioPlayer(recordingUri);
  const playerStatus = useAudioPlayerStatus(player);

  const isRecording = !!recorderState?.isRecording;
  const isPlaying = !!playerStatus?.playing;

  const [statusText, setStatusText] = useState("Idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        const perm = await requestRecordingPermissionsAsync();
        setHasPermission(perm.granted);
      } catch (e) {
        console.warn(e);
        setHasPermission(false);
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      if (hasPermission === false) {
        Alert.alert("Microphone permission", "Permission not granted.");
        return;
      }

      // Stop playback before recording
      try {
        player.pause();
      } catch {}

      setStatusText("Starting…");
      setSeconds(0);

      await recorder.prepareToRecordAsync();
      recorder.record();

      setStatusText("Recording");
    } catch (e: any) {
      console.warn(e);
      Alert.alert(
        "Recording error",
        e?.message ?? "Could not start recording."
      );
      setStatusText("Error starting recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (!isRecording) return;

      setStatusText("Stopping…");

      await recorder.stop();
      const uri = recorder.uri ?? null;

      if (!uri) {
        setStatusText("No recording saved");
        return;
      }

      setRecordingUri(uri);
      setStatusText("Saved");
      onRecorded?.(uri);
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Stop error", e?.message ?? "Could not stop recording.");
      setStatusText("Error stopping");
    }
  };

  const playPause = async () => {
    try {
      if (!recordingUri) {
        Alert.alert("No recording", "Record something first.");
        return;
      }

      if (isPlaying) {
        player.pause();
        setStatusText("Paused");
        return;
      }

      // expo-audio doesn’t auto-rewind at end; handle replay
      const atEnd =
        (playerStatus?.duration ?? 0) > 0 &&
        (playerStatus?.currentTime ?? 0) >= (playerStatus?.duration ?? 0);

      if (atEnd) player.seekTo(0);

      player.play();
      setStatusText("Playing");
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Playback error", e?.message ?? "Could not play recording.");
      setStatusText("Playback error");
    }
  };

  useEffect(() => {
    if (playerStatus?.didJustFinish) {
      setStatusText("Finished");
    }
  }, [playerStatus?.didJustFinish]);

  const reset = async () => {
    try {
      if (isRecording) return;

      try {
        player.pause();
        player.seekTo(0);
      } catch {}

      setRecordingUri(null);
      setSeconds(0);
      setStatusText("Idle");
    } catch {}
  };

  const mmss = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Audio Recorder</Text>
        <Text style={styles.muted}>Requesting microphone permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Audio Recorder</Text>
        <Text style={styles.muted}>
          Microphone permission denied. Enable it in system settings and reload
          the app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Audio Recorder</Text>

      <View style={styles.row}>
        <Text style={styles.badge}>{statusText}</Text>
        <Text style={styles.timer}>{mmss(seconds)}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.btn, isRecording ? styles.btnStop : styles.btnRec]}
        >
          <Text style={styles.btnText}>{isRecording ? "Stop" : "Record"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playPause}
          disabled={!recordingUri || isRecording}
          style={[
            styles.btn,
            !recordingUri || isRecording ? styles.btnDisabled : styles.btnPlay,
          ]}
        >
          <Text style={styles.btnText}>{isPlaying ? "Pause" : "Play"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={reset}
          disabled={isRecording && Platform.OS !== "web"}
          style={[
            styles.btn,
            isRecording ? styles.btnDisabled : styles.btnGhost,
          ]}
        >
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {recordingUri ? (
        <Text style={styles.uri} numberOfLines={2}>
          Saved to: {recordingUri}
        </Text>
      ) : (
        <Text style={styles.muted}>No recording yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 12,
  },
  timer: { marginLeft: "auto", fontVariant: ["tabular-nums"], fontSize: 14 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnText: { fontWeight: "600" },
  btnRec: { backgroundColor: "#111" },
  btnStop: { backgroundColor: "#111" },
  btnPlay: { backgroundColor: "#111" },
  btnGhost: { backgroundColor: "transparent" },
  btnDisabled: { opacity: 0.4 },
  muted: { color: "#666" },
  uri: { fontSize: 12, color: "#444" },
});
