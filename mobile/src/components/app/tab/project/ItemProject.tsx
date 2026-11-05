// library
import { View, Text } from "react-native";

// components
import { Icon } from "@/components/icons/Icon";

// types
import type { Project } from "@/app/(tab)";
import { Avatar } from "@/components/avatar/Avatar";

interface ItemProjectProps {
  item: Project;
}

export function ItemProject({ item }: ItemProjectProps) {
  const completePercent = Math.round(
    (item.complete_tasks / item.total_tasks) * 100,
  );

  return (
    <View
      className="p-5 rounded-[20px] gap-3"
      style={{ backgroundColor: item.bg }}
    >
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-row items-center gap-4">
          <Text className="text-[25px]">{item.emoji}</Text>

          <View>
            <Text className="text-xl font-semibold">{item.project_name}</Text>
            <Text className="text-foreground-secondary-strong">
              View: sever can run normaly now
            </Text>
          </View>
        </View>
        <View className="h-[35px] w-[35px] items-center justify-center bg-white shadow-sm rounded-full">
          <Icon name="long-arrow-icon" size={15} strokeWidth={12} />
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center ">
          <View className="flex-row">
            <View className="border-[1.5px] rounded-full overflow-hidden border-white bg-black">
              <Avatar avatar="pixel-cat" size={22} />
            </View>
            <View className="border-[1.5px] -left-3 rounded-full overflow-hidden border-white bg-red-600">
              <Avatar avatar="pixel-cat" size={22} />
            </View>
            <View className="border-[1.5px] -left-6 rounded-full overflow-hidden border-white bg-red-400">
              <Avatar avatar="pixel-dog" size={22} />
            </View>
          </View>
          <Text className="text-sm -left-4 text-foreground-secondary-strong">
            {item.number_member} member
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="relative w-20 h-2 overflow-hidden rounded-full bg-foreground-secondary/20 ">
            <View
              className="left-0 h-5 bg-foreground-secondary-strong"
              style={{ width: `${completePercent}%` }}
            />
          </View>
          <Text className="text-sm font-semibold text-foreground-secondary-strong">
            {item.complete_tasks}/{item.total_tasks}
          </Text>
        </View>
      </View>
    </View>
  );
}
