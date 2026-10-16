import { useSyncExternalStore } from 'react';
import { Platform, TextStyle, ViewStyle, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Keep the existing token names so every component inherits the blue brand without layout changes.
const brand = {
  sky: '#6CC7F6', periwinkle: '#8FA7FF', ice: '#DDEEFF', lavender: '#C7B9FF',
  yellow: '#EFE88A', pink: '#F4A6D7', coral: '#F28C8C',
  heroInk: '#233548', heroMuted: '#41566C', heroButton: '#8FA7FF', heroButtonPressed: '#7E96F0',
  logoBacking: '#FFFFFF', avatarInk: '#344653',
  heroStart: '#F4FAFF', heroMiddle: '#E3E2FB', heroEnd: '#FBE7EE',
  heroPinkGlow: 'rgba(246,187,218,0.68)', heroCoralGlow: 'rgba(255,213,181,0.72)', heroYellowGlow: 'rgba(250,241,174,0.72)',
  heroNativePink: '#F3DEF0', heroNativePeach: '#FBE8DB', heroNativeYellow: '#FAF4D9',
  heroSkyGlow: 'rgba(190,229,255,0.84)', heroLavenderGlow: 'rgba(186,182,248,0.68)',
  sampleIce: '#E7F2FF', sampleLavender: '#EEE9FF', sampleYellow: '#FAF6D9', samplePinkSoft: '#FBEAF5',
  sampleBlue: '#35678F', samplePurple: '#65558E', samplePink: '#895176', sampleCoral: '#925454',
};
const light = {
  ...brand,
  primaryInk: '#23455D', primaryFrom: 'rgba(241,252,255,0.86)', primaryTo: 'rgba(148,211,245,0.72)',
  lilacFrom: 'rgba(252,249,255,0.80)', lilacTo: 'rgba(212,199,242,0.52)',
  roseFrom: 'rgba(255,250,252,0.72)', roseTo: 'rgba(245,190,211,0.38)',
  warmFrom: 'rgba(255,253,244,0.82)', warmTo: 'rgba(245,229,163,0.44)',
  dangerFrom: 'rgba(255,250,250,0.82)', dangerTo: 'rgba(244,170,174,0.30)',
  subtleDangerFrom: 'rgba(255,255,255,0.26)', subtleDangerTo: 'rgba(245,188,192,0.18)',
  allergenInk: '#4B4F5D', allergenFrom: '#ECE4F8', allergenTo: '#D8C7ED', allergenSelectedFrom: 'rgba(221,243,254,0.96)', allergenSelectedTo: 'rgba(136,196,231,0.82)',
  discardFrom: 'rgba(255,244,246,0.85)', discardTo: 'rgba(240,163,178,0.52)',
  selectedEdge: '#7B97AA', pantryFrom: 'rgba(255,255,255,0.96)', pantryTo: 'rgba(239,245,253,0.80)', pantryEdge: '#C8D8E4', pantryShadow: 'rgba(67,90,111,0.11)',
  panelFrom: 'rgba(255,255,255,0.78)', panelTo: 'rgba(235,233,251,0.40)',
  ambientSky: 'rgba(189,229,255,0.32)', ambientRose: 'rgba(246,206,222,0.26)', ambientLilac: 'rgba(211,201,246,0.28)',

  bg: '#FAFAFC', paper: '#FFFFFF', chrome: '#F8F8FC', ink: '#293041', muted: '#626573', faint: '#626573',
  green: '#496174', greenDeep: '#354B5C', greenSoft: '#F0EDF8', greenSoftPressed: '#E5DFF2', lime: '#8FA7FF', onAccent: '#FFFFFF',
  border: '#E7E6EE', borderStrong: '#A4B7C5', pale: '#F3F2F7', separator: 'rgba(44,42,64,0.10)', fill: '#F5F5F9',
  secondaryInk: '#5D6170', secondarySoft: '#F0EDF8', chipInk: '#75516D', chipSoft: '#F7EDF5',
  peachInk: '#805347', peachSoft: '#FCF0E8', yellowSoft: '#F9F6DF', navSurface: 'rgba(255,255,255,0.86)',
  artworkGlass: 'rgba(255,255,255,0.48)', artworkRim: 'rgba(255,255,255,0.92)',
  red: '#A2322C', redPressed: '#7E2521', redSoft: '#FCEBE8', amber: '#86560F', amberSoft: '#FFF7DC', amberPressed: '#F3E3BD', blue: '#365F7C', blueSoft: '#EAF3FA',
  toast: '#293041', toastText: '#FFFFFF', shadow: 'rgba(46,42,70,0.045)', shadowRaised: 'rgba(46,42,70,0.12)',
  glass: 'rgba(255,255,255,0.68)', glassSolid: 'rgba(253,252,255,0.97)', glassRim: 'rgba(255,255,255,0.95)', glassHighlight: 'rgba(255,255,255,0.98)', glassEdge: 'rgba(85,72,123,0.12)',
};
export type Palette = typeof light;
const dark: Palette = {
  ...brand,
  primaryInk: '#23455D', primaryFrom: 'rgba(238,250,255,0.94)', primaryTo: 'rgba(155,215,247,0.88)',
  lilacFrom: 'rgba(95,82,127,0.42)', lilacTo: 'rgba(65,51,94,0.46)',
  roseFrom: 'rgba(89,62,86,0.42)', roseTo: 'rgba(94,51,76,0.40)',
  warmFrom: 'rgba(73,62,39,0.62)', warmTo: 'rgba(89,72,36,0.44)',
  dangerFrom: 'rgba(77,43,49,0.72)', dangerTo: 'rgba(103,46,53,0.42)',
  subtleDangerFrom: 'rgba(62,43,49,0.26)', subtleDangerTo: 'rgba(114,58,65,0.24)',
  allergenInk: '#DDD6E9', allergenFrom: '#514860', allergenTo: '#443A55', allergenSelectedFrom: 'rgba(221,243,254,0.98)', allergenSelectedTo: 'rgba(147,207,239,0.94)',
  discardFrom: 'rgba(110,40,55,0.42)', discardTo: 'rgba(152,46,68,0.44)',
  selectedEdge: '#87A8BF', pantryFrom: 'rgba(53,54,70,0.94)', pantryTo: 'rgba(38,44,59,0.88)', pantryEdge: '#596879', pantryShadow: 'rgba(0,0,0,0.22)',
  panelFrom: 'rgba(46,44,63,0.78)', panelTo: 'rgba(35,32,50,0.68)',
  ambientSky: 'rgba(83,132,166,0.12)', ambientRose: 'rgba(151,78,114,0.12)', ambientLilac: 'rgba(116,94,161,0.12)',

  bg: '#15151E', paper: '#21212D', chrome: '#191923', ink: '#F0EFF7', muted: '#BAB7CB', faint: '#ABA8BE',
  green: '#BACDDC', greenDeep: '#D4E2EC', greenSoft: '#302C44', greenSoftPressed: '#403957', lime: '#8FA7FF', onAccent: '#15151E',
  border: '#343240', borderStrong: '#738593', pale: '#2A2836', separator: 'rgba(240,239,247,0.12)', fill: '#2A2836',
  secondaryInk: '#CDC9D8', secondarySoft: '#332C45', chipInk: '#E2BDD7', chipSoft: '#392C3A',
  peachInk: '#E9C0AA', peachSoft: '#3D2F2A', yellowSoft: '#363226', navSurface: 'rgba(63,57,81,0.80)',
  artworkGlass: 'rgba(255,255,255,0.48)', artworkRim: 'rgba(255,255,255,0.92)',
  red: '#FF928A', redPressed: '#FFB3AD', redSoft: '#3A1E1C', amber: '#F0C46C', amberSoft: '#32280F', amberPressed: '#40341A', blue: '#AED4EE', blueSoft: '#233242',
  toast: '#F0EFF7', toastText: '#15151E', shadow: 'rgba(0,0,0,0.10)', shadowRaised: 'rgba(0,0,0,0.32)',
  glass: 'rgba(39,36,52,0.76)', glassSolid: 'rgba(39,36,52,0.97)', glassRim: 'rgba(255,255,255,0.20)', glassHighlight: 'rgba(255,255,255,0.16)', glassEdge: 'rgba(0,0,0,0.35)',
};
/** Shared translucent gradient treatment; only the fill is translucent, never its text or icons. */
export function gradientFill(from: string, to: string, angle = 135): ViewStyle {
  const image = `linear-gradient(${angle}deg, ${from}, ${to})`;
  return Platform.OS === 'web'
    ? { backgroundColor: 'transparent', backgroundImage: image } as ViewStyle
    : { backgroundColor: 'transparent', experimental_backgroundImage: image };
}
// A presentation-only cycle gives household initials distinct, gentle colors in both appearances.
const profileGradients = [
  ['#EFFAFF', '#C9E8F6'], ['#F7F1FF', '#E0D4F4'],
  ['#FFF3F9', '#F2D3E3'], ['#FFF7EF', '#F7DEC9'],
  ['#F1F7FC', '#D5E1ED'], ['#F4F3FF', '#DDDFF5'],
  ['#FDF8EA', '#F2E7C7'], ['#F9F4FF', '#E7D5EC'],
] as const;
export function profileAvatarFill(index: number): ViewStyle {
  const [from, to] = profileGradients[index % profileGradients.length];
  return { ...gradientFill(from, to), boxShadow: 'inset 0px 1px 0px rgba(255,255,255,0.9)' };
}
/** Light palette, for the few module-level defaults that render before a scheme is known. */
export const C = light;
export const shadowOf = (P: Palette) => ({ card: `0px 2px 8px ${P.shadow}, 0px 12px 32px ${P.shadow}`, raised: `0px 12px 32px ${P.shadowRaised}` });
export const shadow = shadowOf(light);
// Web cannot drive transforms on the native thread.
export const nativeDriver = Platform.OS !== 'web';

// iOS Dynamic Type "Large" sizes (typography.md › Specifications). Body stays at the 17 pt default.
export const type: Record<'largeTitle' | 'title2' | 'title3' | 'headline' | 'body' | 'subhead' | 'footnote' | 'caption', TextStyle> = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24 },
  subhead: { fontSize: 15, lineHeight: 21 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
};

export type Tone = 'success' | 'info' | 'warning' | 'danger';
const toneOf = (P: Palette): Record<Tone, { fg: string; bg: string }> => ({
  success: { fg: P.green, bg: P.greenSoft }, info: { fg: P.blue, bg: P.blueSoft },
  warning: { fg: P.amber, bg: P.amberSoft }, danger: { fg: P.red, bg: P.redSoft },
});
export const tone = toneOf(light);

export type Scheme = 'light' | 'dark';
export const palettes: Record<Scheme, Palette> = { light, dark };
export const themes: Record<Scheme, { C: Palette; tone: Record<Tone, { fg: string; bg: string }>; shadow: ReturnType<typeof shadowOf> }> = {
  light: { C: light, tone: toneOf(light), shadow: shadowOf(light) },
  dark: { C: dark, tone: toneOf(dark), shadow: shadowOf(dark) },
};
// Light / Dark / Auto choice from Settings. Auto (the default) follows the device. Kept on this device only:
// localStorage on the web (falls back to memory when blocked), SecureStore on native.
export type Appearance = 'auto' | Scheme;
export const APPEARANCES: readonly Appearance[] = ['auto', 'light', 'dark'];
const APPEARANCE_KEY = 'bitebeacon.appearance';
const isAppearance = (v: unknown): v is Appearance => APPEARANCES.includes(v as Appearance);
const web = Platform.OS === 'web';
let appearance: Appearance = 'auto';
const listeners = new Set<() => void>();
if (web) { try { const v = localStorage.getItem(APPEARANCE_KEY); if (isAppearance(v)) appearance = v; } catch { /* storage blocked */ } }
else SecureStore.getItemAsync(APPEARANCE_KEY).then(v => { if (isAppearance(v) && appearance === 'auto') { appearance = v; listeners.forEach(l => l()); } }, () => {});
export function setAppearance(next: Appearance) {
  appearance = next; listeners.forEach(l => l());
  if (web) { try { localStorage.setItem(APPEARANCE_KEY, next); } catch { /* applies until reload */ } }
  else SecureStore.setItemAsync(APPEARANCE_KEY, next).catch(() => {});
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export function useAppearance(): Appearance { return useSyncExternalStore(subscribe, () => appearance, () => appearance); }
/** The scheme to draw: the Settings choice, or the device's light or dark appearance when that is Auto. */
export function useScheme(): Scheme {
  const device = useColorScheme(); const chosen = useAppearance();
  return chosen === 'auto' ? (device === 'dark' ? 'dark' : 'light') : chosen;
}
/** Builds a StyleSheet for both appearances once, at module load. */
export function bothSchemes<T>(make: (P: Palette, sh: ReturnType<typeof shadowOf>) => T): Record<Scheme, T> {
  return { light: make(light, shadowOf(light)), dark: make(dark, shadowOf(dark)) };
}
