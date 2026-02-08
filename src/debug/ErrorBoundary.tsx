import React from 'react';
import { ScrollView, Text, View } from 'react-native';

type State = { error?: Error; info?: { componentStack: string } | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: undefined, info: null };

  componentDidCatch(error: Error, info: any) {
    // loga no Metro
    console.error('@@ ERROR BOUNDARY CAUGHT', error, info?.componentStack);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Erro capturado pelo ErrorBoundary</Text>
          <Text selectable>{String(this.state.error)}</Text>
          <View style={{ height: 12 }} />
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Componente/stack:</Text>
          <Text selectable>{this.state.info?.componentStack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}