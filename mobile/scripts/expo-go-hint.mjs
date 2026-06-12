#!/usr/bin/env node
/** Prints once when starting Metro — SDK 56 vs App Store Expo Go on physical iPhone. */
const hint = `
\x1b[33m⚠  Expo SDK 56 — App Store Expo Go on a real iPhone only supports SDK 54.\x1b[0m
   \x1b[1mPress \x1b[36mi\x1b[0m\x1b[1m in this terminal\x1b[0m to open the iPhone Simulator (works today).
   Updating Expo Go from the App Store will not fix “incompatible with this version”.
   See docs/EXPO_SIMPLE.md
`;
console.log(hint);
