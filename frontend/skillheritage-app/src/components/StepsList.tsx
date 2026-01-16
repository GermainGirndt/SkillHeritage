// This component renders a scrollable list of tutorial steps using the individual StepItem components.
import { View } from 'react-native';
import StepItem from './StepItem';

type Props = {
  activeStep: number;
  onStepPress: (index: number) => void;
};

export default function StepsList({ activeStep, onStepPress }: Props) {
  const steps = [
    { id: 0, time: "00:00", title: "Intro & Preparation", description: "Open hood and prepare 10mm wrench." },
    { id: 1, time: "03:30", title: "Cover Removal", description: "Unscrew three bolts holding the plastic cover." },
    { id: 2, time: "07:30", title: "Part Extraction", description: "Gently pry the element and pull it upwards." },
  ];

  return (
    <View>
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          time={step.time}
          title={step.title}
          description={step.description}
          active={index === activeStep}
          onPress={() => onStepPress(index)}
        />
      ))}
    </View>
  );
}