import { SymbolView } from "expo-symbols";
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
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: t.requests.title,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "list.bullet", android: "list", web: "list" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: t.pro.forPros,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "briefcase.fill", android: "work", web: "work" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.auth.login,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "person.fill", android: "person", web: "person" }}
              tintColor={color}
              size={24}
            />
          ),
          ...(Platform.OS === "android" ? { title: "Account" } : {}),
        }}
      />
    </Tabs>
  );
}
