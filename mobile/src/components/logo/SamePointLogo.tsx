import Svg, { Circle, G, Line, type SvgProps } from "react-native-svg";

type Point = readonly [x: number, y: number];

interface Branch {
  /** Where the line ends (the end nearest the dot). */
  lineEnd: Point;
  /** Centre of the dot at the end of the line. */
  dot: Point;
  /** Dot radius. */
  radius: number;
}

const VIEWBOX_WIDTH = 208.77;
const VIEWBOX_HEIGHT = 203.86;

const HUB: { center: Point; radius: number } = { center: [21, 21], radius: 21 };

/** All four lines start from this one point. */
const LINE_START: Point = [38.4, 38.8];

const STROKE_WIDTH = 6;

const BRANCHES: readonly Branch[] = [
  { lineEnd: [115.24, 159.39], dot: [126.47, 177.01], radius: 17 },
  { lineEnd: [66.61, 165.48], dot: [71.26, 186.36], radius: 17.5 },
  { lineEnd: [128.2, 107.38], dot: [144.8, 120.06], radius: 17 },
  { lineEnd: [171.47, 83.26], dot: [191.52, 89.96], radius: 17.25 },
];

export interface LogoProps extends Omit<
  SvgProps,
  "width" | "height" | "color" | "viewBox" | "accessibilityLabel"
> {
  /** Width in dp. Height follows the logo's aspect ratio. Default: 120. */
  size?: number;
  /** Any colour react-native-svg accepts. Default: "#000". */
  color?: string;
  /** Screen-reader label. Pass `null` to hide the logo from screen readers. */
  accessibilityLabel?: string | null;
}

export function SamePointLogo({
  size = 120,
  color = "currentColor",
  accessibilityLabel = "Logo",
  ...rest
}: LogoProps) {
  const height = (size * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH;
  const hidden = accessibilityLabel === null;

  return (
    <Svg
      width={size}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      accessible={!hidden}
      accessibilityRole={hidden ? undefined : "image"}
      accessibilityLabel={hidden ? undefined : accessibilityLabel}
      importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
      {...rest}
    >
      <Circle
        cx={HUB.center[0]}
        cy={HUB.center[1]}
        r={HUB.radius}
        fill={color}
      />

      {BRANCHES.map(({ lineEnd, dot, radius }, i) => (
        <G key={i}>
          <Line
            x1={LINE_START[0]}
            y1={LINE_START[1]}
            x2={lineEnd[0]}
            y2={lineEnd[1]}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
          <Circle cx={dot[0]} cy={dot[1]} r={radius} fill={color} />
        </G>
      ))}
    </Svg>
  );
}
