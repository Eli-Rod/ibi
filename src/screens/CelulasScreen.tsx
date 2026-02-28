import { ThemedText, ThemedView } from '../components/Themed';
export default function CelulasScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>Células</ThemedText>
      <ThemedText>Conteúdo institucional da igreja…</ThemedText>
    </ThemedView>
  );
}