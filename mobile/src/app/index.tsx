import { View } from "react-native";
import { Redirect } from "expo-router";
import { isUserLogin } from "@/store/auth/auth-func";
import { useEffect, useState } from "react";

// components
import { SamePointLoader } from "@/components/load-state/SamePointLoader";

const index = () => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUserLogin = async () => {
      const res = await isUserLogin();
      if (!res.ok) {
        setIsLogin(false);
        return;
      }
      setIsLogin(true);
    };
    fetchUserLogin();
  }, []);

  if (isLogin === false) {
    return <Redirect href="/(auth)/signup" />;
  }

  if (isLogin === true) {
    return <Redirect href="/(tab)" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <SamePointLoader size={100} />
    </View>
  );
};

export default index;
