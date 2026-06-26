import React from "react";
import { View, Image, Text } from "react-native";

export default function StoryViewerScreen({ route }: any) {
  const { story } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
      <Image
        source={{ uri: story.mediaUrl }}
        style={{ width: "100%", height: "80%" }}
      />

      <Text style={{ color: "#fff", textAlign: "center", marginTop: 10 }}>
        {story.username}
      </Text>
    </View>
  );
}