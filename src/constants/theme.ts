import { MD3DarkTheme } from "react-native-paper";

export const colors = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  primaryDark: "#5B21B6",
  secondary: "#F59E0B",
  background: "#0F0A1A",
  surface: "#1A1128",
  surfaceLight: "#251A38",
  text: "#F5F3FF",
  textSecondary: "#A8A0B8",
  error: "#EF4444",
  success: "#10B981",
  border: "#2D2248",
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: "#FFFFFF",
    onSurface: colors.text,
    onBackground: colors.text,
    outline: colors.border,
  },
};
