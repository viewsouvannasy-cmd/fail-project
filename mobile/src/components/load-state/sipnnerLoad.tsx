import { View } from "react-native";

interface SpinnerLoadProps {
  size?: number;
  color?: string;
  borderWidth?: number;
}

export function SpinnerLoad({
  size = 20,
  color = "currentColor",
  borderWidth = 2,
}: SpinnerLoadProps) {
  return (
    <View
      className="h-10 w-10 animate-spin rounded-full border-4  border-t-transparent"
      style={{
        borderColor: color,
        height: size,
        width: size,
        borderWidth: borderWidth,
      }}
    />
  );
}
