import { NativeTabs } from "expo-router/native-tabs";
import { useColorScheme } from "react-native";

export default function _layout() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";
  const color = isDark ? "#ffffff" : "#000000";

  return (
    <NativeTabs tintColor={color}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "folder",
            selected: "folder.fill",
          }}
          md="folder"
        />
        <NativeTabs.Trigger.Label>Project</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "message",
            selected: "message.fill",
          }}
          md="chat"
        />
        <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "tray",
            selected: "tray.fill",
          }}
          md="inbox"
        />
        <NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insight">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "chart.bar",
            selected: "chart.bar.fill",
          }}
          md="bar_chart"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger.Label>Insight</NativeTabs.Trigger.Label>
    </NativeTabs>
  );
}
