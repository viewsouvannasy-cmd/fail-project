import LongArrowIcon from "./list-icon/LongArrowIcon";

import type { ComponentType } from "react";
import type { Icon } from "@/types/icon";

const icons = {
  "long-arrow-icon": LongArrowIcon,
} satisfies Record<string, ComponentType<Icon>>;

export type IconName = keyof typeof icons;

interface Props extends Icon {
  name: IconName;
}

export function Icon({ name, ...props }: Props) {
  const Component = icons[name];
  return <Component {...props} />;
}
