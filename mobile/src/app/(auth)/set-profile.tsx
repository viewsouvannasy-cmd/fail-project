// library
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Pressable, useColorScheme } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// components
import { ProfileSection } from "@/components/app/(auth)/set-profile/ProfileSection";
import { SelectAvatarSection } from "@/components/app/(auth)/set-profile/SelectAvatarSection";
import { SpinnerLoad } from "@/components/load-state/sipnnerLoad";

// context
import { useUserSetProfile } from "@/context/useUserSetProfile";

// store
import { useSetProfile } from "@/store/user/user";

const SetProfile = () => {
  const colorScheme = useColorScheme();

  const { data } = useUserSetProfile();

  const { mutate, isPending } = useSetProfile();

  function handleDoneSetProfile() {
    mutate({
      user_name: data.name,
      avatar: data.avatar,
      bg: data.bg,
    });
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAwareScrollView
        bottomOffset={30}
        contentContainerClassName="justify-end flex-1 p-4 gap-5"
      >
        <ProfileSection />
        <SelectAvatarSection />
        <Pressable
          onPress={handleDoneSetProfile}
          className="p-3 active:bg-background-inverse/70 bg-background-inverse rounded-[10px] items-center"
        >
          {!isPending ? (
            <Text className="text-foreground-inverse text-lg">Done</Text>
          ) : (
            <SpinnerLoad
              size={24}
              borderWidth={2}
              color={colorScheme === "dark" ? "#000" : "#fff"}
            />
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SetProfile;
