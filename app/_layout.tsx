import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HealthProvider } from '../context/HealthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HealthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </HealthProvider>
    </SafeAreaProvider>
  );
}
