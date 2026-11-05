import type { SvgProps } from "react-native-svg";

export interface Icon extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}
