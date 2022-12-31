import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  Share,
  Alert,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import * as SQLite from "expo-sqlite";
import React from "react";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import QrCodeContainer from "./QrCodeContainer";
import Table from "./Table";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ModalDropdown from "react-native-modal-dropdown";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AttendanceList(props) {
  const db = SQLite.openDatabase("Attendance.db");
  const [nameSet, setNameSet] = React.useState([{ name: "", classID: "" }]);
  const [attendanceScreen, setAttendanceScreen] = React.useState(true);
  const [date, setDate] = React.useState(new Date());

  // Retrieves the list of students
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT classID, name, class FROM classlist WHERE class = ?",
        [props.class],
        (txObj, resultSet) => {
          setNameSet(resultSet.rows._array);
        },
        (error) => console.log("error wasnt able to retrieve student names")
      );
    });
  }, [date]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
    setTimeStamps([]);
  };

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    showMode("date");
  };

  function getDateFromDatabase() {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT time, classReference FROM attendance WHERE year = ? AND month = ? AND day = ?",
          [
            date.getFullYear(),
            // getMonth starts at 0
            date.getMonth() + 1,
            date.getDate(),
          ],
          (txObj, resultSet) => {
            const data = resultSet.rows._array;
            let userTimestamps = [];

            for (let x = 0; x < data.length; x++) {
              for (let y = 0; y < nameSet.length; y++) {
                if (data[x].classReference === nameSet[y].classID) {
                  userTimestamps.push(data[x]);
                }
              }
            }
            resolve(userTimestamps);
          },
          (error) => reject("error")
        );
      });
    });
  }

  async function exportFinal() {
    let dateArray = await getDateFromDatabase();
    console.log(dateArray.length, "dateArray");

    let finalArray = [
      [
        `${
          monthNames[date.getMonth()]
        }, ${date.getDate()}, ${date.getFullYear()}`,
      ],
      ["Name", "Time of Arrival"],
    ];
    //IF studentsa have scanned that day
    if (dateArray.length !== 0) {
      for (let x = 0; x < nameSet.length; x++) {
        let pushed = false;
        for (let y = 0; y < dateArray.length; y++) {
          if (nameSet[x].classID === dateArray[y].classReference) {
            finalArray.push([nameSet[x].name, dateArray[y].time]);
            pushed = true;
          }
        }
        if (pushed === true) {
          pushed = false;
        } else {
          finalArray.push([nameSet[x].name, ""]);
        }
      }
    } // else put empty timestamps
    else {
      for (let x = 0; x < nameSet.length; x++) {
        finalArray.push([nameSet[x].name, ""]);
      }
    }

    console.log(finalArray);

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(finalArray);
    XLSX.utils.book_append_sheet(wb, ws, `${props.class}`, true);
    const base64 = XLSX.write(wb, { type: "base64" });
    const filename =
      FileSystem.documentDirectory + `${props.class.replace(/ +/g, "")}.xlsx`;
    FileSystem.writeAsStringAsync(filename, base64, {
      encoding: FileSystem.EncodingType.Base64,
    }).then(() => {
      Sharing.shareAsync(filename);
      alert("Saved Successfully");
    });
    finalArray = [];
  }

  // index of 0 is Export, index of 1 is Delete
  function dropDownSetting(index) {
    //Export
    if (index === 0) {
      exportFinal();
    }

    //Delete
    if (index === 1) {
      Alert.alert("Delete", "Delete Classlist?", [
        {
          text: "Yes",
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql(
                "DELETE FROM classlist WHERE class = ?",
                [props.class],
                (txObj, resultSet) => {
                  console.log("deleted succesfully");
                  props.useForceUpdate();
                },
                (error) => console.log("unable to delete")
              );
            });

            props.setAttendanceListVisibilty(false);
          },
        },
        { text: "No", onPress: () => console.log("Cancel"), style: "cancel" },
      ]);
    }
  }

  return (
    <Modal
      animationType="slide"
      //close modal on back button press
      onRequestClose={() => props.setAttendanceListVisibilty(false)}
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: "#ECECEC",
          flex: 1,
        }}
      >
        <View style={styles.topViewContainer}>
          <View style={styles.titleContainer}>
            <Pressable onPress={() => props.setAttendanceListVisibilty(false)}>
              <MaterialIcons name="arrow-back-ios" size={24} color="black" />
            </Pressable>
            <Text style={{ fontSize: 20 }}>{props.class}</Text>
            <ModalDropdown
              options={["Export", "Delete Classlist"]}
              onSelect={(index) => dropDownSetting(index)}
              dropdownStyle={{ height: "auto" }}
              dropdownTextStyle={{
                color: "black",
                fontSize: 14,
                alignSelf: "center",
              }}
            >
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={24}
                color="black"
              />
            </ModalDropdown>
          </View>

          <View style={styles.optionsContainer}>
            <Pressable
              style={attendanceScreen && styles.clicked}
              onPress={() => setAttendanceScreen(true)}
            >
              <Text style={styles.optionsText}>Attendance</Text>
            </Pressable>
            <Pressable
              style={!attendanceScreen && styles.clicked}
              onPress={() => setAttendanceScreen(false)}
            >
              <Text style={styles.optionsText}>Qr Code</Text>
            </Pressable>
          </View>
        </View>
        {attendanceScreen && (
          <View style={styles.headingContainer}>
            <Text style={styles.headingText}>Name</Text>

            <Text style={styles.headingText}>Arrival Time</Text>
          </View>
        )}
        <View style={styles.tableContainer}>
          <FlatList
            data={nameSet}
            keyExtractor={nameSet.classID}
            renderItem={(itemData) => {
              return (
                <Table
                  name={itemData.item.name}
                  attendanceScreen={attendanceScreen}
                  date={date}
                  classID={itemData.item.classID}
                />
              );
            }}
          />
        </View>

        <View style={styles.bottomContainer}>
          <Text style={{ fontSize: 20 }}>
            {monthNames[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
          </Text>
          <Pressable
            onPress={showDatepicker}
            onChange={onChange}
            style={{
              backgroundColor: "#24a0ed",
              borderRadius: 6,
              paddingHorizontal: 3,
              marginLeft: 6,
            }}
          >
            <AntDesign name="calendar" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
  },
  rowContainer: {
    borderWidth: 1,
    padding: 6,
  },
  textContainer: {
    borderWidth: 1,
    padding: 6,
  },
  topViewContainer: {
    backgroundColor: "#96dfaf",
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 6,
    margin: 12,
    borderRadius: 6,
  },
  headingText: {
    fontSize: 16,
    marginHorizontal: 30,
  },
  rowContainer: {
    backgroundColor: "white",
    padding: 6,
    marginHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  bottomContainer: {
    backgroundColor: "#96dfaf",
    flexDirection: "row",
    justifyContent: "center",
    padding: 6,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 6,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 9,
  },
  optionsText: {
    fontSize: 16,
    paddingVertical: 4,
  },
  clicked: {
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 6,
  },
});
