// This hook manages video recording logic for both Web and Mobile platforms.
import { useState, useRef } from "react";
import { Platform } from "react-native";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { DefaultTutorialsApiClient } from "@/api/TutorialApiClient";

let mediaRecorder: any = null;
let videoChunks: any[] = [];

export function useVideoRecording() {
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [recording, setRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const startWebRecording = async (uploadFn: Function) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaRecorder = new MediaRecorder(stream);
      videoChunks = [];
      mediaRecorder.ondataavailable = (e: any) => { if (e.data.size > 0) videoChunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunks, { type: "video/webm" });
        await uploadFn(URL.createObjectURL(videoBlob), videoBlob);
        mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
        setRecording(false);
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) { console.error(err); }
  };

  const startMobileRecording = async (uploadFn: Function) => {
    if (!cameraRef.current) return;
    try {
      setRecording(true);
      const video = await cameraRef.current.recordAsync({ quality: "720p" } as any);
      if (video?.uri) await uploadFn(video.uri);
    } catch (err) { setRecording(false); }
  };

  const stopRecording = async () => {
    if (Platform.OS === "web") {
      if (mediaRecorder) mediaRecorder.stop();
    } else {
      await cameraRef.current?.stopRecording();
    }
    setRecording(false);
  };

  const uploadVideo = async (uri: string, webBlob?: Blob) => {
    setIsUploading(true);
    try {
      const tutorialId = await DefaultTutorialsApiClient.uploadVideo({ uri, webBlob });
      if (tutorialId) {
        router.replace({ pathname: "/Tutorial/[id]", params: { id: tutorialId } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    cameraRef,
    recording,
    isUploading,
    startRecording: () => Platform.OS === 'web' ? startWebRecording(uploadVideo) : startMobileRecording(uploadVideo),
    stopRecording,
    handleRecordPress: () => recording ? stopRecording() : (Platform.OS === 'web' ? startWebRecording(uploadVideo) : startMobileRecording(uploadVideo))
  };
}