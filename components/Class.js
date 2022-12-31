import {
  StyleSheet,
  Text,
  View,
  Button,
  Pressable,
  FlatList,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import AttendanceList from "./AttendanceList";

export default function Class(props) {
  const db = SQLite.openDatabase("Attendance.db");
  const [attendaceListVisibility, setAttendanceListVisibilty] =
    React.useState(false);

  return (
    <View style={styles.classContainer}>
      <Text style={styles.textContainer}>{props.class}</Text>
      <Pressable
        style={styles.buttonContainer}
        android_ripple={{ color: "#dddddd" }}
        onPress={() => setAttendanceListVisibilty(true)}
      >
        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
      </Pressable>
      {attendaceListVisibility && (
        <AttendanceList
          setAttendanceListVisibilty={setAttendanceListVisibilty}
          class={props.class}
          useForceUpdate={props.useForceUpdate}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  classContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "white",
    flex: 1,
    margin: 10,
  },
  textContainer: {
    fontSize: 24,
  },
  buttonContainer: {
    alignItems: "center",
  },
});
