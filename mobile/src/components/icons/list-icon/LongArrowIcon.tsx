import Svg, { Path } from "react-native-svg";

import type { Icon } from "@/types/icon";

function LongArrowIcon({
  size = 22,
  color = "#000",
  strokeWidth = 8,
  ...props
}: Icon) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      {/* Diagonal shaft */}
      <Path
        d="M14 86 L86 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
      {/* Arrowhead */}
      <Path
        d="M42 12 H88 V58"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export default LongArrowIcon;
