// This route renders the systemInfoModal.
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import SystemInfoModal from '../src/components/systemInfoModal';

export default function ModalScreen() {
  return (
    <>
      <SystemInfoModal />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}