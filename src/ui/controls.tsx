import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, PanResponder, Platform, Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Check, CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import { bothSchemes, gradientFill, nativeDriver, Palette, themes, Tone, type, useScheme } from './theme';
import { haptic, HapticKind } from './haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ToneIcon = ({ kind, size = 20 }: { kind: Tone; size?: number }) => {
  const { tone } = themes[useScheme()];
  const Component = { success: CircleCheck, info: Info, warning: TriangleAlert, danger: CircleAlert }[kind];
  return <Component accessible={false} size={size} color={tone[kind].fg} strokeWidth={2} />;
};

/** Pressable with a spring press-in scale, pressed tint and optional haptic on press. */
export function Tap({ style, pressedStyle, haptic: kind = 'tap', scaleTo = .97, onPress, onPressIn, onPressOut, disabled, children, ...rest }:
  Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; pressedStyle?: StyleProp<ViewStyle>; haptic?: HapticKind | null; scaleTo?: number; children?: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const spring = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: nativeDriver, speed: 40, bounciness: toValue === 1 ? 8 : 0 }).start();
  return <AnimatedPressable {...rest} disabled={disabled}
    onPressIn={e => { setPressed(true); spring(scaleTo); onPressIn?.(e); }}
    onPressOut={e => { setPressed(false); spring(1); onPressOut?.(e); }}
    onPress={e => { if (kind) haptic[kind](); onPress?.(e); }}
    style={[style, pressed && pressedStyle, { transform: [{ scale }] }]}>{children}</AnimatedPressable>;
}

type Variant = 'primary' | 'secondary' | 'danger';
export function Button({ children, onPress, variant = 'primary', secondary = false, disabled = false, loading = false, icon, testID, hapticKind = 'tap' }:
  { children: string; onPress: () => void; variant?: Variant; secondary?: boolean; disabled?: boolean; loading?: boolean; icon?: React.ReactNode; testID?: string; hapticKind?: HapticKind }) {
  const scheme = useScheme(); const { C, tone } = themes[scheme]; const s = STYLES[scheme];
  const v: Variant = secondary ? 'secondary' : variant;
  const fg = v === 'secondary' ? C.secondaryInk : v === 'danger' ? C.red : C.primaryInk;
  const off = disabled || loading;
  return <Tap testID={testID} accessibilityRole="button" accessibilityState={{ disabled: off, busy: loading }} aria-busy={loading} onPress={onPress} disabled={off} haptic={hapticKind}
    style={[s.button, s[v], off && s.buttonOff]} pressedStyle={s[`${v}Pressed`]}>
    {loading ? <ActivityIndicator size="small" color={fg} /> : icon}
    <Text style={[s.buttonText, { color: fg }]}>{children}</Text>
  </Tap>;
}

export function Notice({ children, kind = 'warning' }: { children: React.ReactNode; kind?: Tone }) {
  const scheme = useScheme(); const { C, tone } = themes[scheme]; const s = STYLES[scheme];
  return <View style={[s.notice, { backgroundColor: tone[kind].bg }, kind === 'danger' ? gradientFill(C.dangerFrom, C.dangerTo) : kind === 'warning' ? gradientFill(C.warmFrom, C.warmTo) : gradientFill(C.panelFrom, C.blueSoft)]}><ToneIcon kind={kind} size={18} /><Text style={[s.noticeText, { color: tone[kind].fg }]}>{children}</Text></View>;
}

/** Fades and lifts children in when mounted, or whenever `trigger` changes. */
export function Reveal({ children, trigger, style, testID }: { children: React.ReactNode; trigger?: unknown; style?: StyleProp<ViewStyle>; testID?: string }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: nativeDriver }).start();
  }, [trigger]);
  return <Animated.View testID={testID} style={[style, { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>{children}</Animated.View>;
}

/** Soft pulsing placeholder bar for loading states. */
export function Skeleton({ width = '100%', height = 14 }: { width?: `${number}%`; height?: number }) {
  const scheme = useScheme(); const { C, tone } = themes[scheme]; const s = STYLES[scheme];
  const t = useRef(new Animated.Value(.45)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 650, useNativeDriver: nativeDriver }),
      Animated.timing(t, { toValue: .45, duration: 650, useNativeDriver: nativeDriver }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  return <Animated.View accessible={false} style={{ width, height, borderRadius: 7, backgroundColor: C.border, opacity: t }} />;
}

export function CheckMark({ checked, round = false }: { checked: boolean; round?: boolean }) {
  const scheme = useScheme(); const { C, tone } = themes[scheme]; const s = STYLES[scheme];
  const t = useRef(new Animated.Value(checked ? 1 : 0)).current;
  useEffect(() => { Animated.spring(t, { toValue: checked ? 1 : 0, useNativeDriver: nativeDriver, speed: 28, bounciness: 12 }).start(); }, [checked]);
  return <View accessible={false} style={[s.checkbox, round && { borderRadius: 20 }, checked && s.checked]}>
    <Animated.View style={{ opacity: t, transform: [{ scale: t }] }}><Check size={15} color={C.primaryInk} strokeWidth={3} /></Animated.View>
  </View>;
}

/** Row that commits an action when swiped far enough: right runs onRight, left runs onLeft.
 *  Swiping is a shortcut only; callers must also show buttons, and screen readers get the same two actions.
 *  Children get guard(): wrap row presses in it so the click that ends a swipe (web) does not also press. */
export function SwipeRow({ children, onRight, onLeft, rightLabel, leftLabel, rightIcon, leftIcon, disabled, testID }:
  { children: (guard: (fn: () => void) => () => void) => React.ReactNode; onRight: () => void; onLeft: () => void; rightLabel: string; leftLabel: string; rightIcon: React.ReactNode; leftIcon: React.ReactNode; disabled?: boolean; testID?: string }) {
  const scheme = useScheme(); const s = STYLES[scheme];
  const x = useRef(new Animated.Value(0)).current;
  const width = useRef(1);
  const armed = useRef(false);
  const swipedAt = useRef(0);
  const guard = (fn: () => void) => () => { if (Date.now() - swipedAt.current > 400) fn(); };
  const latest = useRef({ onRight, onLeft, disabled }); latest.current = { onRight, onLeft, disabled };
  // A third of the row's own width, so it scales with screen size and font scaling.
  const past = (dx: number) => Math.abs(dx) > width.current / 3;
  const settle = (dx: number) => {
    if (!past(dx)) { Animated.spring(x, { toValue: 0, useNativeDriver: nativeDriver, bounciness: 6 }).start(); return; }
    const right = dx > 0;
    Animated.timing(x, { toValue: right ? width.current : -width.current, duration: 180, useNativeDriver: nativeDriver }).start(() => {
      x.setValue(0); (right ? latest.current.onRight : latest.current.onLeft)();
    });
  };
  const pan = useRef(PanResponder.create({
    // Only clearly horizontal drags; vertical ones keep scrolling the page. Capture, so a drag that starts on a button becomes a swipe, not a press.
    onMoveShouldSetPanResponderCapture: (_e, g) => !latest.current.disabled && Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderGrant: () => { armed.current = false; swipedAt.current = Date.now(); },
    onPanResponderMove: (_e, g) => {
      x.setValue(g.dx);
      if (past(g.dx) !== armed.current) { armed.current = past(g.dx); haptic.select(); }
    },
    onPanResponderRelease: (_e, g) => { swipedAt.current = Date.now(); settle(g.dx); },
    onPanResponderTerminate: () => settle(0),
    onPanResponderTerminationRequest: () => false,
  })).current;
  const rightOpacity = x.interpolate({ inputRange: [0, 40], outputRange: [0, 1], extrapolate: 'clamp' });
  const leftOpacity = x.interpolate({ inputRange: [-40, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  return <View testID={testID} style={s.swipeWrap} onLayout={e => { width.current = Math.max(1, e.nativeEvent.layout.width); }}
    accessibilityActions={[{ name: 'right', label: rightLabel }, { name: 'left', label: leftLabel }]}
    onAccessibilityAction={e => e.nativeEvent.actionName === 'right' ? onRight() : onLeft()}>
    <Animated.View accessible={false} style={[s.swipeUnder, s.swipeRight, { opacity: rightOpacity }]}>{rightIcon}<Text style={s.swipeText}>{rightLabel}</Text></Animated.View>
    <Animated.View accessible={false} style={[s.swipeUnder, s.swipeLeft, { opacity: leftOpacity }]}><Text style={[s.swipeText, s.swipeDestructiveText]}>{leftLabel}</Text>{leftIcon}</Animated.View>
    <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }] }}>{children(guard)}</Animated.View>
  </View>;
}

type Toast = { id: number; message: string; kind: Tone };
const ToastContext = createContext<(message: string, kind?: Tone) => void>(() => undefined);
export const useToast = () => useContext(ToastContext);
/** Short transient confirmation. Never the only place important information appears. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const scheme = useScheme(); const { C, tone } = themes[scheme]; const s = STYLES[scheme];
  const [toast, setToast] = useState<Toast | null>(null);
  const t = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback((message: string, kind: Tone = 'success') => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, kind });
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(message);
    t.setValue(0);
    Animated.spring(t, { toValue: 1, useNativeDriver: nativeDriver, speed: 18, bounciness: 7 }).start();
    timer.current = setTimeout(() => Animated.timing(t, { toValue: 0, duration: 220, useNativeDriver: nativeDriver }).start(({ finished }) => { if (finished) setToast(null); }), 2600);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <ToastContext.Provider value={show}>
    <View style={{ flex: 1 }}>
      {children}
      {toast && <View pointerEvents="none" style={s.toastLayer}>
        <Animated.View testID="toast" key={toast.id} accessibilityLiveRegion="polite" style={[s.toast, { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }, { scale: t.interpolate({ inputRange: [0, 1], outputRange: [.96, 1] }) }] }]}>
          <View style={[s.toastIcon, { backgroundColor: tone[toast.kind].bg }]}><ToneIcon kind={toast.kind} size={18} /></View>
          <Text style={s.toastText}>{toast.message}</Text>
        </Animated.View>
      </View>}
    </View>
  </ToastContext.Provider>;
}

const STYLES = bothSchemes((C: Palette, shadow) => StyleSheet.create({
  // Translucent capsule gradients keep primary, secondary and destructive actions distinct.
  button: { minHeight: 50, paddingVertical: 13, paddingHorizontal: 22, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primary: { ...gradientFill(C.primaryFrom, C.primaryTo), boxShadow: `inset 0px 1px 0px ${C.glassRim}, 0px 4px 12px ${C.shadow}` }, primaryPressed: { ...gradientFill(C.primaryTo, C.primaryFrom) },
  secondary: { ...gradientFill(C.lilacFrom, C.lilacTo), boxShadow: `inset 0px 1px 0px ${C.glassHighlight}` }, secondaryPressed: { ...gradientFill(C.lilacTo, C.lilacFrom) },
  danger: { ...gradientFill(C.dangerFrom, C.dangerTo) }, dangerPressed: { ...gradientFill(C.dangerTo, C.dangerFrom) },
  buttonOff: { opacity: .5 }, buttonText: { flexShrink: 1, textAlign: 'center', ...type.headline },
  notice: { borderRadius: 16, padding: 14, gap: 10, flexDirection: 'row', alignItems: 'flex-start' }, noticeText: { flex: 1, ...type.subhead, fontWeight: '500' },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.borderStrong, backgroundColor: C.paper, justifyContent: 'center', alignItems: 'center' }, checked: { ...gradientFill(C.primaryFrom, C.primaryTo), borderColor: C.green },
  toastLayer: { position: 'absolute', top: '2%', left: '4%', right: '4%', alignItems: 'center' },
  toast: { maxWidth: 460, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 12, paddingRight: 18, borderRadius: 18, backgroundColor: C.toast, boxShadow: shadow.raised },
  swipeWrap: { borderRadius: 22, overflow: 'hidden' },
  swipeUnder: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: '6%' },
  swipeRight: { justifyContent: 'flex-start', ...gradientFill(C.primaryFrom, C.primaryTo) }, swipeLeft: { justifyContent: 'flex-end', ...gradientFill(C.dangerFrom, C.dangerTo) },
  swipeText: { color: C.primaryInk, ...type.headline }, swipeDestructiveText: { color: C.red },
  toastIcon: { padding: 6, borderRadius: 20 }, toastText: { flexShrink: 1, color: C.toastText, ...type.subhead, fontWeight: '600' },
}));
