import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChartViewScreen from "../screens/ChartViewScreen";
import BirthProfileInputScreen from "../screens/BirthProfileInputScreen";
import { colors } from "../constants/theme";

const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0 },
  headerTintColor: colors.text,
  cardStyle: { backgroundColor: colors.background },
};

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={stackScreenOptions}>
      <ChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Conversations" }}
      />
      <ChatStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Chat" }}
      />
    </ChatStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <ProfileStack.Screen
        name="ChartView"
        component={ChartViewScreen}
        options={{ title: "My Chart" }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={BirthProfileInputScreen}
        options={{ title: "Edit Birth Details" }}
      />
    </ProfileStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let icon: keyof typeof Ionicons.glyphMap = "person-outline";
          if (route.name === "ChartTab") icon = "planet-outline";
          else if (route.name === "ChatTab") icon = "chatbubbles-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ChartTab"
        component={ChartViewScreen}
        options={{
          tabBarLabel: "My Chart",
          headerTitle: "My Birth Chart",
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0 },
          headerTintColor: colors.text,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ tabBarLabel: "Chat" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}
