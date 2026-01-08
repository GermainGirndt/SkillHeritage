import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { theme } from '../styles/theme';
import PhoneFrame from '../components/PhoneFrame';

export default function LessonScreen() {
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(40);

  return (
    <View style={styles.root}>
      <PhoneFrame />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
