import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n";

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PALETTE.azure,
        tabBarInactiveTintColor: "#6B8FA3",
        tabBarStyle: { backgroundColor: PALETTE.white, borderTopColor: PALETTE.line },
        headerStyle: { backgroundColor: PALETTE.bg },
        headerTintColor: PALETTE.navy,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home.sendRequest,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: t.requests.title,
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: t.pro.forPros,
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.auth.login,
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          ...(Platform.OS === "android" ? { title: "Account" } : {}),
        }}
      />
    </Tabs>
  );
}
