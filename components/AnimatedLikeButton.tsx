// components/AnimatedLikeButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { theme } from "../theme";

type Props = {
  liked: boolean;
  count: number;
  onPress: () => void;
};

export default function AnimatedLikeButton({ liked, count, onPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.18, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );

    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.btn,
          liked ? styles.activeBtn : styles.defaultBtn,
          animatedStyle,
        ]}
      >
        <Text style={[styles.text, liked && styles.activeText]}>
          {liked ? "Liked" : "Like"} {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  defaultBtn: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceHigh,
  },
  activeBtn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  text: {
    color: theme.colors.textSub,
    fontSize: 12,
    fontWeight: "700",
  },
  activeText: {
    color: theme.colors.primary,
  },
});