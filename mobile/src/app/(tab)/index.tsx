// library
import { useRef } from "react";
import { Text, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  clamp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

// components
import { Avatar } from "@/components/avatar/Avatar";
import { ItemProject } from "@/components/app/tab/project/ItemProject";

import type { CardBgColor } from "@/constants/color";

export type Project = {
  emoji: string;
  project_name: string;
  number_member: number;
  total_tasks: number;
  complete_tasks: number;
  bg: CardBgColor;
};

const data: Project[] = [
  {
    emoji: "💾",
    project_name: "Backup System",
    number_member: 2,
    total_tasks: 30,
    complete_tasks: 20,
    bg: "#DDE7FF",
  },
  {
    emoji: "☎️",
    project_name: "Call Center App",
    number_member: 4,
    total_tasks: 45,
    complete_tasks: 12,
    bg: "#DFF7E8",
  },
  {
    emoji: "⚽️",
    project_name: "Football League Tracker",
    number_member: 3,
    total_tasks: 25,
    complete_tasks: 25,
    bg: "#FFE1E1",
  },
  {
    emoji: "🏈",
    project_name: "Fantasy Sports Dashboard",
    number_member: 5,
    total_tasks: 60,
    complete_tasks: 38,
    bg: "#EDE2FF",
  },
  {
    emoji: "📱",
    project_name: "Mobile App Redesign",
    number_member: 6,
    total_tasks: 80,
    complete_tasks: 54,
    bg: "#FFF0D6",
  },
  {
    emoji: "💻",
    project_name: "Developer Portal",
    number_member: 3,
    total_tasks: 40,
    complete_tasks: 5,
    bg: "#DDF7F4",
  },
];
export default function App() {
  return (
    <SafeAreaView className="flex-1 gap-5 p-5 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between ">
        <Text className="text-4xl font-semibold text-foreground">Project</Text>
        <View className="items-center justify-center w-[40px] overflow-hidden rounded-full h-[40px] bg-emerald-200">
          <Avatar avatar="pixel-cat" size={40} />
        </View>
      </View>

      <Animated.FlatList
        data={data}

        contentContainerClassName="gap-5 grow"
        ListHeaderComponent={
          <View>
            <TextInput
              className="p-4 rounded-full border-border bg-background-muted"
              placeholderTextColor="rgb(120,120,120)"
              placeholder="Search..."
            />
          </View>
        }
        ListFooterComponent={<View className="mb-20"></View>}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item }) => <ItemProject item={item} />}
      />
    </SafeAreaView>
  );
}
