import { View, Text } from "react-native";
import QrCodeContainer from "./QrCodeContainer";
import { StyleSheet } from "react-native";
import React from "react";
import * as SQLite from "expo-sqlite";

export default function Table(props) {
  const [attendanceDate, setAttendanceDate] = React.useState([{ time: "" }]);
  const db = SQLite.openDatabase("Attendance.db");

  React.useEffect(() => {
    // the date state variable has become a date object
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT time, attendanceID FROM attendance WHERE year = ? AND month = ? AND day = ? AND classReference = ?",
        [
          props.date.getFullYear(),
          // getMonth starts at 0
          props.date.getMonth() + 1,
          props.date.getDate(),
          props.classID,
        ],
        (txObj, resultSet) => {
          let x = resultSet.rows._array.length;
          if (x === 0 && props.name !== "") {
            setAttendanceDate([{ time: "" }]);
          } else if (props.name !== "") {
            setAttendanceDate(resultSet.rows._array);
          }
        },
        (error) =>
          console.log("error wasnt able to retrieve student attendacne list")
      );
    });
    // !!! Props.Name is needed as a value as to render the component again after the react.useffect in the attendancelist component is done querying data from the database
    // !!! It creates double renders, but its the best solution I can think of
  }, [props.date, props.name]);

  return (
    <View style={styles.rowContainer}>
      <Text style={styles.text}>{props.name}</Text>
      {props.attendanceScreen && (
        <Text style={styles.text}>{attendanceDate[0].time}</Text>
      )}
      {!props.attendanceScreen && (
        <View style={styles.saveQrContainer}>
          <QrCodeContainer name={props.name} />
        </View>
      )}
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
  rowContainer: {
    backgroundColor: "white",
    padding: 6,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  text: {
    marginHorizontal: 30,
  },
});
