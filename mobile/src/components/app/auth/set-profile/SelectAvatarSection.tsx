// library
import { View, Text, ScrollView, Pressable } from "react-native";
import { useState } from "react";

// components
import { Avatar } from "@/components/avatar/Avatar";

// context
import { useUserSetProfile } from "@/context/useUserSetProfile";

// constants
import { AVATAR_NAME } from "@/constants/avatar-name";
import { BACKGROUND_COLOR } from "@/constants/color";

export function SelectAvatarSection() {
  const [onSection, setOnSection] = useState<"avatar" | "background">("avatar");

  const { data: userForm, setDataForm } = useUserSetProfile();

  const numColumns = 5;
  const data = onSection === "avatar" ? AVATAR_NAME : BACKGROUND_COLOR;
  const remainder = data.length % numColumns;
  const paddedData =
    remainder === 0
      ? data
      : [...data, ...new Array(numColumns - remainder).fill(null)];
  const dataLength = paddedData.length;

  const rows: (typeof paddedData)[] = [];
  for (let i = 0; i < paddedData.length; i += numColumns) {
    rows.push(paddedData.slice(i, i + numColumns));
  }

  return (
    <View className="bg-card border-border border rounded-[20px] overflow-hidden">
      <View className="flex-row border-b border-border">
        <Pressable
          onPress={() => setOnSection("avatar")}
          className={`flex-1 p-3 ${onSection === "avatar" ? "bg-accent-secondary" : ""}`}
        >
          <Text className="text-lg text-center text-foreground ">Avatar</Text>
        </Pressable>
        <Pressable
          onPress={() => setOnSection("background")}
          className={`flex-1 p-3 ${onSection === "background" ? "bg-accent-secondary" : ""}`}
        >
          <Text className="text-lg text-center text-foreground">
            background
          </Text>
        </Pressable>
      </View>
      {onSection === "avatar" ? (
        <ScrollView
          className="h-[220px]"
          nestedScrollEnabled
          contentContainerClassName="p-3 gap-3"
        >
          {rows.map((row, indexRow) => {
            return (
              <View key={indexRow} className="flex-row gap-3">
                {row.map((item, index) =>
                  item === null ? (
                    <View key={index} className="flex-1 aspect-square" />
                  ) : (
                    <Pressable
                      onPress={() => setDataForm("avatar", item)}
                      key={index}
                      className="items-center justify-center flex-1 overflow-hidden rounded-full  aspect-square"
                      style={{ backgroundColor: userForm.bg }}
                    >
                      <Avatar avatar={item} size={50} />
                    </Pressable>
                  ),
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView
          className="h-[220px]"
          nestedScrollEnabled
          contentContainerClassName="p-3 gap-3"
        >
          {rows.map((row, indexRow) => {
            return (
              <View key={indexRow} className="flex-row gap-3">
                {row.map((item, index) => {
                  return item === null ? (
                    <View key={index} className="flex-1 aspect-square" />
                  ) : (
                    <Pressable
                      onPress={() => setDataForm("bg", item)}
                      key={index}
                      className="items-center justify-center flex-1 overflow-hidden rounded-full aspect-square"
                      style={{ backgroundColor: item }}
                    />
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
