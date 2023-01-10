import { View, Pressable } from "react-native";
import ViewShot from "react-native-view-shot";
import { StyleSheet } from "react-native";
import QRCode from "react-qr-code";
import * as MediaLibrary from "expo-media-library";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function QrCodeContainer(props) {
  const viewShotRef = React.useRef();

  async function captureViewShot() {
    const imageURI = await viewShotRef.current.capture();
    MediaLibrary.saveToLibraryAsync(imageURI).then(() => {
      alert("Photo saved succesfully");
    });
  }

  return (
    <View style={styles.saveQrContainer}>
      <ViewShot
        ref={viewShotRef}
        options={{
          format: "png",
          quality: 1,
          fileName: `${props.name}_QrCode`,
        }}
      >
        <QRCode value={props.name} size={96} />
      </ViewShot>
      <Pressable onPress={captureViewShot}>
        <MaterialIcons name="save" size={24} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  saveQrContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    justifyContent: "space-between",
    flex: 2,
  },
});
