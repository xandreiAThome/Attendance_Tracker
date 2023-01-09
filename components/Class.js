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
    <Pressable
      style={styles.buttonContainer}
      android_ripple={{ color: "#dddddd" }}
      onPress={() => setAttendanceListVisibilty(true)}
    >
      <View style={styles.classContainer}>
        <Text style={styles.textContainer}>{props.class}</Text>

        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />

        {attendaceListVisibility && (
          <AttendanceList
            setAttendanceListVisibilty={setAttendanceListVisibilty}
            class={props.class}
            useForceUpdate={props.useForceUpdate}
          />
        )}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  classContainer: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
    margin: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    fontSize: 24,
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
});
