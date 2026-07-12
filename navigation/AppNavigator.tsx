// navigation/AppNavigator.tsx
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { theme } from "../theme";

import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import HomeScreen from "../screens/home/HomeScreen";
import EditPostScreen from "../screens/home/EditPostScreen";
import ReelsScreen from "../screens/reels/ReelsScreen";
import CreateReelScreen from "../screens/reels/CreateReelScreen";
import SearchScreen from "../screens/search/SearchScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import NotificationsScreen from "../screens/profile/NotificationsScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import FollowersListScreen from "../screens/profile/FollowersListScreen";
import UserListScreen from "../screens/chat/UserListScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import ChatListScreen from "../screens/chat/ChatListScreen";
import CreateStoryScreen from "../screens/stories/CreateStoryScreen";
import StoryViewer from "../screens/stories/StoryViewer";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

const TAB_ICONS: Record<string, string> = {
  Home:          "Home",
  Search:        "Search",
  Reels:         "Reels",
  Chats:         "Msgs",
  Notifications: "Alerts",
  Profile:       "Profile",
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[tabSt.wrap, focused && tabSt.wrapFocused]}>
      <Text style={[tabSt.text, focused && tabSt.textFocused]}>
        {TAB_ICONS[name] || name}
      </Text>
    </View>
  );
}

const tabSt = StyleSheet.create({
  wrap: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  wrapFocused: { backgroundColor: theme.colors.primarySoft },
  text: { fontSize: 10, fontWeight: "700", color: theme.colors.textMuted, letterSpacing: 0.3 },
  textFocused: { color: theme.colors.primary },
});

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 62, paddingBottom: 8, paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: TAB_ICONS[route.name] || route.name,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NavTheme}>
      <Stack.Navigator
        initialRouteName={user ? "Main" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={HomeTabs} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="EditPost" component={EditPostScreen} />
        <Stack.Screen name="UserProfile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="FollowersList" component={FollowersListScreen} />
        <Stack.Screen name="Users" component={UserListScreen} />
        <Stack.Screen name="CreateReel" component={CreateReelScreen} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { color: theme.colors.text, fontWeight: "700", fontSize: 16 },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="StoryViewer" component={StoryViewer} />
        <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}