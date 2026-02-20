import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import BirthProfileInputScreen from "../screens/BirthProfileInputScreen";
import ChartPreviewScreen from "../screens/ChartPreviewScreen";
import { colors } from "../constants/theme";

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, loading, hasProfile } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Authenticated but no birth profile yet
  if (!hasProfile) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="BirthProfileInput"
          component={BirthProfileInputScreen}
        />
        <Stack.Screen
          name="ChartPreview"
          component={ChartPreviewScreen}
        />
      </Stack.Navigator>
    );
  }

  // Authenticated with profile → main app
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
