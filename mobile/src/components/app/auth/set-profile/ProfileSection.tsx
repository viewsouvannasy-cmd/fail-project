// library
import { View, TextInput, useColorScheme } from "react-native";
import { useState } from "react";
import Foundation from "@expo/vector-icons/Foundation";

// components
import { Avatar } from "@/components/avatar/Avatar";

// context
import { useUserSetProfile } from "@/context/useUserSetProfile";

export function ProfileSection() {
  const { data, setDataForm } = useUserSetProfile();

  const [inputName, setInputName] = useState("");
  const colorScheme = useColorScheme();

  return (
    <View className="items-center gap-2">
      <View
        className=" rounded-full overflow-hidden"
        style={{ backgroundColor: data.bg }}
      >
        <Avatar avatar={data.avatar} size={100} />
      </View>
      <View className="flex-row items-center gap-3 ">
        <TextInput
          placeholder="My Name"
          placeholderTextColor="rgb(120, 120, 120)"
          placeholderClassName="font-bold"
          className="text-3xl text-foreground "
          value={data.name}
          onChangeText={(e) => setDataForm("name", e)}
        />
        {inputName.length === 0 && (
          <Foundation
            name="pencil"
            size={20}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        )}
      </View>
    </View>
  );
}
