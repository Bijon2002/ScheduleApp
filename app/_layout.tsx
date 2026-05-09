import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/utils/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 64,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: COLORS.surfaceElevated,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            borderRadius: 0,
            shadowColor: COLORS.shadow,
            shadowOpacity: 0.22,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
          tabBarItemStyle: { borderRadius: 8, marginHorizontal: 8 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Timeline',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

function TabIcon({ name, color, focused }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string; focused: boolean }) {
  return <Ionicons name={name} size={focused ? 22 : 20} color={color} />;
}
