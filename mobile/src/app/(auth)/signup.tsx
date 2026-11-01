// library
import {
  View,
  Text,
  Pressable,
  TextInput,
  StatusBar,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

// store
import { useGoogleRegister } from "@/store/oauth/oauth";

// components
import { SpinnerLoad } from "@/components/load-state/sipnnerLoad";

// halper function
import { SamePointLogo } from "@/components/logo/SamePointLogo";

const Signup = () => {
  const colorScheme = useColorScheme();

  const [inputEmail, setInputEmail] = useState("");

  const { mutate, isPending } = useGoogleRegister();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        contentContainerClassName="flex-1 justify-between "
        bottomOffset={30}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
        <View className="flex-1 p-4 items-center justify-center">
          <View className="items-center gap-3">
            <SamePointLogo size={85} />
            <Text className="text-3xl text-foreground font-medium">
              SamePoint
            </Text>
          </View>
        </View>
        <View className={`p-4 gap-3`}>
          <View className="gap-3">
            <TextInput
              className="border border-border text-foreground p-3 rounded-[8px]"
              placeholder="Enter your email"
              onChangeText={setInputEmail}

              value={inputEmail}
            />
            <Pressable className="p-3 active:bg-background-inverse/70 bg-background-inverse rounded-[10px] items-center ">
              <Text className="text-foreground-inverse text-lg">Continue</Text>
            </Pressable>
          </View>
          <View className=" flex-row items-center gap-4">
            <View className="bg-border flex-1 h-[1px] " />
            <Text className="text-border">Or</Text>
            <View className="bg-border flex-1 h-[1px] " />
          </View>
          <Pressable
            onPress={() => mutate()}
            className="p-3 flex-row active:bg-background-inverse/70  justify-center bg-background-inverse rounded-[10px] items-center "
          >
            {!isPending ? (
              <View className="flex flex-row items-center gap-2">
                <Image
                  source={require("@/assets/images/google.png")}
                  style={{ width: 17, height: 17 }}
                />
                <Text className="text-foreground-inverse text-lg ">
                  Continue with Google
                </Text>
              </View>
            ) : (
              <SpinnerLoad
                size={24}
                borderWidth={2}
                color={colorScheme === "dark" ? "#000" : "#fff"}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Signup;
