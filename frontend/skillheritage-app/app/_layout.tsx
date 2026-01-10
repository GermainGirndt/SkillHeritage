import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Home',
            headerShown: true 
          }} 
        />
        
        <Stack.Screen 
          name="record" 
          options={{ 
            title: 'Recording', 
            headerTransparent: true,
            headerTintColor: '#fff' 
          }} 
        />
        
        <Stack.Screen 
          name="player" 
          options={{ 
            title: 'Player' 
          }} 
        />

        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Information' 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}