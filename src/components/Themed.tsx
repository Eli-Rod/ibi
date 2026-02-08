import { PropsWithChildren } from 'react';
import { Text, TextProps, View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function ThemedView(props: PropsWithChildren<ViewProps>) {
  const { theme } = useTheme();
  return <View {...props} style={[{ backgroundColor: theme.colors.background }, props.style]} />;
}

export function ThemedCard(props: PropsWithChildren<ViewProps>) {
  const { theme } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius,
          padding: theme.spacing(1.75),
        },
        props.style,
      ]}
    />
  );
}

export function ThemedText({ style, ...rest }: TextProps) {
  const { theme } = useTheme();
  // 👇 Garantia: se por acaso theme.fonts vier undefined (não deve mais),
  // ainda assim usamos 'System' e não quebramos.
  const ff = theme.fonts?.regular ?? 'System';
  return <Text {...rest} style={[{ color: theme.colors.text, fontFamily: ff }, style]} />;
}