// Diese Komponente zeigt eine Liste von Video-Schritten an.
import { View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import StepItem from './StepItem';
import { API } from '../services/api';

type Step = {
  id: number;
  time: string;
  title: string;
  description: string;
  progress: number;
};

type Props = {
  activeStep: number;
  onStepPress: (index: number, progress: number, title: string) => void;
};

export default function StepsList({ activeStep, onStepPress }: Props) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
  //   try {
  //     const response = await fetch(`${API.baseUrl}/steps`); // endpoint for steps
  //     const data = await response.json();
  //     setSteps(data);
  //   } catch (error) {
  //     console.error("Error fetching the steps:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  };

  if (loading) return <ActivityIndicator color="blue" />;
  if (steps.length === 0) return <Text>No steps to show</Text>;

  return (
    <View>
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          time={step.time}
          title={step.title}
          description={step.description}
          active={index === activeStep}
          onPress={() =>
            onStepPress(index, step.progress, step.title)
          }
        />
      ))}
    </View>
  );
}