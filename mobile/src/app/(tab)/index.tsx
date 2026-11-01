import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind
      </Text>
      <View className="p-3 bg-black">
        <Link href="/(auth)/signup">
          <Text className="text-white">signup</Text>
        </Link>
      </View>
    </View>
  );
}
