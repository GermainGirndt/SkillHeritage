import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { theme } from '../src/styles/theme';
import { API } from '../src/services/api';

let mediaRecorder: any = null;
let videoChunks: any[] = [];

export default function RecordScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView | null>(null);
  
  const [recording, setRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaRecorder = new MediaRecorder(stream);
      videoChunks = [];

      mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) videoChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log("Web recording finished");
        await uploadVideo(videoUrl, videoBlob);
        stream.getTracks().forEach(track => track.stop());
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
    console.log("Starting mobile record...");
    const options: any = {
      quality: '720p', 
      audio: false,
    };

    const video = await cameraRef.current.recordAsync(options);
    
    if (video && video.uri) {
      console.log("Captured URI:", video.uri);
      
      await uploadVideo(video.uri);
    }
  } catch (err) {
    console.error("Android Error:", err);
    setRecording(false);
    Alert.alert("Error", "Recording failed. Check console.");
  }
};

  const stopMobileRecording = async () => {
    setRecording(false);
    setTimeout(async () => {
      await cameraRef.current?.stopRecording();
    }, 500);
  };

  const handleRecordPress = async () => {
    if (Platform.OS === 'web') {
      recording ? stopWebRecording() : startWebRecording();
    } else {
      recording ? stopMobileRecording() : startMobileRecording();
    }
  };

  async function uploadVideo(uri: string, webBlob?: Blob) {
    setIsUploading(true);
    const formData = new FormData();

    if (webBlob) {
      formData.append('file', webBlob, 'video.mp4');
    } else {
      formData.append('file', { uri, type: 'video/mp4', name: 'video.mp4' } as any);
    }

    try {
      console.log("Sendind on server...");
      const res = await fetch(API.uploadVideo, { method: 'POST', body: formData });
      if (res.ok) {
        Alert.alert("Success", "Film saved!");
        router.replace('/');
      }
    } catch (e) {
      console.error("Sending error:", e);
      Alert.alert("Error", "The film wasn't saved.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && !recording ? (
        <View style={[styles.camera, {justifyContent: 'center', alignItems: 'center'}]}>
             <Text style={{color: 'white'}}>Camera is ready </Text>
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} mode="video" />
      )}
      
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: 'white'}}>Wysyłanie...</Text>
        </View>
      )}

      <Pressable
        onPress={handleRecordPress}
        style={[styles.button, recording && { borderColor: 'red' }]}
      >
        <View style={recording ? styles.stopIcon : styles.startIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  button: {
    position: 'absolute', bottom: 50, alignSelf: 'center',
    width: 80, height: 80, borderRadius: 40, borderWidth: 5,
    borderColor: 'white', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  startIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'red' },
  stopIcon: { width: 30, height: 30, backgroundColor: 'red', borderRadius: 5 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', zIndex: 200
  }
});