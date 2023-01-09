import React from "react";
import { View, Text, Button, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import * as SQLite from "expo-sqlite";
import * as MediaLibrary from "expo-media-library";

export default function QrScanner({ navigation, route }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);
  const [text, setText] = React.useState("Not yet scanned");
  const [openCamera, setOpenCamera] = React.useState(false);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    React.useState(null);
  let currentTime = new Date();

  const db = SQLite.openDatabase("Attendance.db");

  const askCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  const askForStoragePermissionin = () => {
    (async () => {
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  };

  //Request for camera and storage permission
  React.useEffect(() => {
    askCameraPermission();
  }, []);

  React.useEffect(() => {
    askForStoragePermissionin();
  }, []);

  if (hasMediaLibraryPermission === undefined) {
    return <Text>Requesting for permission</Text>;
  } else if (!hasMediaLibraryPermission) {
    return <Text>Storage permission not granted</Text>;
  }

  //handles what happens when the qr code is scanned
  const handleQrCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(data.trim());

    // !!! Scanning is asynchronous so if I make these date variables a state it will be undefined because the getDate function is also asynchrounous
    let day = currentTime.getDate();
    let month = currentTime.getMonth() + 1;
    let year = currentTime.getFullYear();
    let timestamp = currentTime.toLocaleTimeString();
    let scannedNameID;

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT classID FROM classlist WHERE name = ?",
        [data.trim()],
        (txObj, resultSet) => {
          let x = resultSet.rows._array.length;
          if (x === 0) {
            return console.log("Unknown student");
          } else {
            scannedNameID = resultSet.rows._array[0].classID;
          }
        },
        (error) =>
          console.log("error wasnt able to retrieve id of scanned name")
      );
    });
    console.log(scannedNameID, "id");

    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO attendance (year, month, day, time, classReference) VALUES (?, ?, ?, ?, ?)",
        [year, month, day, timestamp, scannedNameID],
        (txObj, resultSet) =>
          console.log("scanned name and date addedd succesfully"),
        (error) => console.log("error wasnt able to insert date ")
      );
    });

    // Check the database if it was inserted properly
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM attendance", [], (txObj, resultSet) => {
        console.log(JSON.stringify(resultSet.rows._array));
      });
    });

    console.log("Type: " + type + "\nData: " + data);
  };

  //Check permissions
  if (hasPermission === null) {
    return (
      <View style={styles.qrContainer}>
        <Text>Requesting for Camera permission</Text>
      </View>
    );
  }

  //If user rejected camera permission
  if (hasPermission === false) {
    return (
      <View style={styles.qrContainer}>
        <Text style={{ margin: 10 }}>No Camera Access</Text>
        <Button title="Allow Camera" onPress={() => askCameraPermission()} />
      </View>
    );
  }

  return (
    <View style={styles.qrContainer}>
      <View style={styles.qrCodeBox}>
        {
          //Shows a button first to activate the camera
          openCamera ? (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleQrCodeScanned}
              style={{ height: 400, width: 400 }}
            />
          ) : (
            <Pressable
              onPress={() => setOpenCamera(true)}
              android_ripple={{ color: "#dddddd" }}
            >
              <Ionicons name="camera" size={86} color={"#24a0ed"} />
              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 18,
                  color: "#24a0ed",
                }}
              >
                Scan
              </Text>
            </Pressable>
          )
        }
      </View>
      {openCamera && <Text style={styles.mainText}>{text}</Text>}
      {scanned && (
        <Button
          title="Scan Again"
          onPress={() => setScanned(false)}
          //color="tomato"
        />
      )}
      {/*<Button
        title="delete table"
        onPress={() => {
          db.transaction((tx) => {
            tx.executeSql(
              "DROP TABLE classlist",
              [],
              (txObj, resultSet) => console.log("dropped classlist"),
              (error) => console.log("error wasnt able to drop classlist")
            );
          });
          db.transaction((tx) => {
            tx.executeSql(
              "DROP TABLE attendance",
              [],
              (txObj, resultSet) => console.log("dropped attendance"),
              (error) => console.log("error wasnt able to drop attendance")
            );
          });
        }}
      />*/}
      <StatusBar backgroundColor="#96dfaf" />
    </View>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeBox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 30,
  },
  mainText: {
    fontSize: 16,
    margin: 20,
  },
});
