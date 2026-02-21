import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { theme } from "./src/constants/theme";

// Global JS error & unhandled promise rejection logger
// Ensures errors are emitted via `console.error` so they appear in Android Studio logcat.
const setupGlobalErrorLogging = () => {
  try {
    const globalAny: any = global;

    const defaultHandler = globalAny.ErrorUtils?.getGlobalHandler && globalAny.ErrorUtils.getGlobalHandler();

    const globalHandler = (error: any, isFatal?: boolean) => {
      console.error("[Global JS Error]", { error, isFatal });
      if (typeof defaultHandler === "function") {
        defaultHandler(error, isFatal);
      }
    };

    if (globalAny.ErrorUtils?.setGlobalHandler) {
      globalAny.ErrorUtils.setGlobalHandler(globalHandler);
    }

    // Unhandled promise rejections
    if (typeof globalAny.addEventListener === "function") {
      globalAny.addEventListener("unhandledrejection", (ev: any) => {
        console.error("[Unhandled Promise Rejection]", ev?.reason || ev);
      });
    } else if (typeof (globalAny as any).onunhandledrejection === "function") {
      (globalAny as any).onunhandledrejection = (ev: any) => {
        console.error("[Unhandled Promise Rejection]", ev?.reason || ev);
      };
    }
  } catch (e) {
    // If anything goes wrong while setting up logging, at least log the failure.
    // eslint-disable-next-line no-console
    console.error("Failed to setup global error logging", e);
  }
};

setupGlobalErrorLogging();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
