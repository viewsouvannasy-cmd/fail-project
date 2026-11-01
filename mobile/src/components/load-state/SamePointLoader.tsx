import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing } from "react-native";
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

/**
 * Timeline of one loop, as fractions of `duration` (0 → 1):
 *   hub grows → branches shoot out one after another (line, then dot pops)
 *   → brief hold → whole logo fades out → loop restarts.
 */
const HUB_GROW_END = 0.12;
const BRANCH_FIRST_START = 0.1;
const BRANCH_STAGGER = 0.1;
const LINE_DURATION = 0.2;
const DOT_DELAY = 0.12; // dot starts this long after its line starts
const DOT_DURATION = 0.15;
const FADE_START = 0.85;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

export interface LoaderProps extends Omit<
  SvgProps,
  "width" | "height" | "color" | "viewBox" | "accessibilityLabel"
> {
  /** Width in dp. Height follows the logo's aspect ratio. Default: 120. */
  size?: number;
  /** Any colour react-native-svg accepts. Default: "#000". */
  color?: string;
  /** Length of one full loop in ms. Default: 1800. */
  duration?: number;
  /** Screen-reader label. Pass `null` to hide from screen readers. */
  accessibilityLabel?: string | null;
}

export function SamePointLoader({
  size = 120,
  color = "currentColor",
  duration = 1800,
  accessibilityLabel = "Loading",
  ...rest
}: LoaderProps) {
  const height = (size * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH;
  const hidden = accessibilityLabel === null;

  // One value drives everything: 0 → 1, looping.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        // SVG props (r, x2, y2) aren't supported by the native driver.
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration]);

  const frames = useMemo(() => {
    const map = (
      input: number[],
      output: number[],
      easing?: (t: number) => number,
    ) =>
      progress.interpolate({
        inputRange: input,
        outputRange: output,
        extrapolate: "clamp",
        easing,
      });

    return {
      opacity: map([0, FADE_START, 1], [1, 1, 0]),
      hubRadius: map(
        [0, HUB_GROW_END],
        [0, HUB.radius],
        Easing.out(Easing.cubic),
      ),
      branches: BRANCHES.map(({ lineEnd, dot, radius }, i) => {
        const lineStart = BRANCH_FIRST_START + i * BRANCH_STAGGER;
        const lineStop = lineStart + LINE_DURATION;
        const dotStart = lineStart + DOT_DELAY;
        const dotStop = dotStart + DOT_DURATION;
        const ease = Easing.out(Easing.cubic);

        return {
          x2: map([lineStart, lineStop], [LINE_START[0], lineEnd[0]], ease),
          y2: map([lineStart, lineStop], [LINE_START[1], lineEnd[1]], ease),
          r: map([dotStart, dotStop], [0, radius], Easing.out(Easing.back(2))),
          dot,
        };
      }),
    };
  }, [progress]);

  return (
    <Svg
      width={size}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      accessible={!hidden}
      accessibilityRole={hidden ? undefined : "progressbar"}
      accessibilityLabel={hidden ? undefined : accessibilityLabel}
      accessibilityState={hidden ? undefined : { busy: true }}
      importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
      {...rest}
    >
      <AnimatedG opacity={frames.opacity}>
        <AnimatedCircle
          cx={HUB.center[0]}
          cy={HUB.center[1]}
          r={frames.hubRadius}
          fill={color}
        />

        {frames.branches.map(({ x2, y2, r, dot }, i) => (
          <G key={i}>
            <AnimatedLine
              x1={LINE_START[0]}
              y1={LINE_START[1]}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            <AnimatedCircle cx={dot[0]} cy={dot[1]} r={r} fill={color} />
          </G>
        ))}
      </AnimatedG>
    </Svg>
  );
}
