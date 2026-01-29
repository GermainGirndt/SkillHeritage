// This is a test file for the integrated Audio API in React Native using Expo

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
import axios from "axios";
type Props = {
  onRecorded?: (uri: string) => void;
};

export default function AudioRecorder({ onRecorded }: Props) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

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
  const [transciption, setransciption] = useState<string | null>(null);
  useEffect(() => {
    console.log(
      `Camera permission: ${cameraPermission?.status}, Microphone permission: ${microphonePermission?.status}`,
    );

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
        e?.message ?? "Could not start recording.",
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

  const transcribe = async () => {
    if (!recordingUri) {
      Alert.alert("No recording", "Record something first.");
      return;
    }

    try {
      const formData = new FormData();
      let blob = await fetch(recordingUri).then((res) => res.blob());
      formData.append("audiofile", blob);
      console.log(formData);
      axios({
        method: "post",
        url: "http://127.0.0.1:3000/transcription",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((response) => {
          setransciption(response.data.text);
        })
        .catch((error) => console.error(error));
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Transcription error", e?.message ?? "Something went wrong.");
    }
  };

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

      <View style={styles.row}>
        <TouchableOpacity onPress={transcribe} style={[styles.btn]}>
          <Text style={styles.btnText}>{"Transcribe"}</Text>
        </TouchableOpacity>
      </View>
      {transciption ? (
        <Text style={styles.uri} numberOfLines={2}>
          {transciption}
        </Text>
      ) : (
        <Text style={styles.muted}>No transciption yet.</Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 12,

    // Light surface so it stands out on dark screens
    backgroundColor: "#F8FAFC", // near-white
    borderWidth: 1,
    borderColor: "#E2E8F0",

    // Shadow (iOS) + elevation (Android)
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 0.2,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },

  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  timer: {
    marginLeft: "auto",
    fontVariant: ["tabular-nums"],
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  btn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",

    // Make buttons feel tappable on light surface
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  btnText: {
    fontWeight: "800",
    color: "#0F172A",
  },

  // Primary-ish buttons (blue)
  btnRec: {
    backgroundColor: "#2563EB",
    borderColor: "#1D4ED8",
  },
  btnStop: {
    backgroundColor: "#DC2626",
    borderColor: "#B91C1C",
  },
  btnPlay: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0284C7",
  },

  // Ghost button that still reads on the light card
  btnGhost: {
    backgroundColor: "transparent",
    borderColor: "#CBD5E1",

    // remove button surface feel
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },

  // Make disabled state still visible (not too faint)
  btnDisabled: {
    opacity: 0.55,
  },

  muted: {
    color: "#475569",
  },

  uri: {
    fontSize: 12,
    color: "#334155",
  },
});
