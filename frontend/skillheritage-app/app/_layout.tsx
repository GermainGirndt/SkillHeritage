// This file defines the global navigation structure and theme settings for the entire app.
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
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Main Search Screen */}
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'SkillHeritage',
            headerShown: true 
          }} 
        />
        
        {/* Camera/Recording Screen */}
        <Stack.Screen 
          name="record" 
          options={{ 
            title: 'Record New Tutorial',
            headerTransparent: true,
            headerTintColor: '#fff' 
          }} 
        />
        
        {/* Dynamic Tutorial Route */}
        <Stack.Screen 
          name="Tutorial/[id]" 
          options={{ 
            title: 'Tutorial Player',
            headerShown: false
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