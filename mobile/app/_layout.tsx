import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Meus remédios' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: 'Novo remédio' }} />
      <Stack.Screen name="remedio/[id]" options={{ title: 'Remédio' }} />
    </Stack>
  )
}