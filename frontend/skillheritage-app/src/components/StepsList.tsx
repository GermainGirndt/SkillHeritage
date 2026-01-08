import { View } from 'react-native';
import StepItem from './StepItem';

const steps = [
  { id: 1, title: 'Prepare the tools', active: true },
  { id: 2, title: 'Initial sharpening' },
  { id: 3, title: 'Fine tuning' },
  { id: 4, title: 'Final inspection' },
];

export default function StepsList() {
  return (
    <View>
      {steps.map(step => (
        <StepItem key={step.id} {...step} />
      ))}
    </View>
  );
}
