import { StyleSheet, Text, View } from "react-native";
import { BRAND } from "@/lib/constants";

export const TRICOLOR = {
  blue: "#002395",
  white: "#FFFFFF",
  red: "#ED2939",
} as const;

interface BrandWordmarkProps {
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: 26, md: 32, lg: 42 } as const;

export function BrandWordmark({ size = "md" }: BrandWordmarkProps) {
  const fontSize = sizes[size];

  return (
    <View
      accessibilityLabel={BRAND}
      accessibilityRole="text"
      style={styles.row}
    >
      <Text style={[styles.base, { fontSize, color: "#10324A" }]}>my</Text>
      <View style={[styles.frWrap, { height: fontSize * 1.1 }]}>
        <Text
          style={[
            styles.base,
            styles.fr,
            { fontSize, color: TRICOLOR.white },
          ]}
        >
          fr
        </Text>
      </View>
      <Text style={[styles.base, { fontSize, color: TRICOLOR.red }]}>
        .ai
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  base: {
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  frWrap: {
    backgroundColor: TRICOLOR.blue,
    borderRadius: 4,
    paddingHorizontal: 4,
    marginHorizontal: 1,
    justifyContent: "center",
  },
  fr: {
    fontWeight: "700",
  },
});
