import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Pressable,
  BackHandler,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import * as SQLite from "expo-sqlite";

export default function CreateClassList(props) {
  const [classInfo, setClassInfo] = React.useState([]);
  const [enternedName, setEnteredName] = React.useState("");
  const [enteredClassName, setEnteredClassName] = React.useState("");

  const db = SQLite.openDatabase("Attendance.db");

  function handleNameInput(enteredText) {
    setEnteredName(enteredText);
  }

  function addClassInfo() {
    if (enternedName !== "") {
      setClassInfo((prevInfo) => [
        ...prevInfo,
        { name: enternedName, id: Math.random().toString() },
      ]);
      setEnteredName("");
    }
  }

  function handleClassNameInput(enteredText) {
    setEnteredClassName(enteredText);
  }

  function removeName(id) {
    setClassInfo((prevInfo) => {
      return prevInfo.filter((info) => info.id !== id);
    });
  }

  function saveClass() {
    if (
      enteredClassName === null ||
      enteredClassName === "" ||
      classInfo === null
    ) {
      return false;
    }

    //Saves the classlist to the database
    for (let x = 0; x < classInfo.length; x++) {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO classlist (name, class) VALUES (?, ?)",
          [classInfo[x].name, enteredClassName],
          (txObj, resultSet) => console.log("Inserted succesfully")
        ),
          (error) => console.log("error not inserted");
      });

      // Check the database if it was inserted properly
      /*db.transaction((tx) => {
        tx.executeSql("SELECT * FROM classlist", [], (txObj, resultSet) => {
          console.log(JSON.stringify(resultSet.rows), "rows");
        });
      });*/
    }
    props.setCreateClassListModal(false);
    console.log(classInfo);
  }

  return (
    <Modal
      animationType="slide"
      style={{ flex: 1 }}
      //close modal on back button press
      onRequestClose={() => props.setCreateClassListModal(false)}
    >
      <View style={styles.createContainer}>
        <View style={styles.exitContainer}>
          <Pressable onPress={() => props.setCreateClassListModal(false)}>
            <Text style={{ color: "black", marginLeft: 6 }}>Cancel</Text>
          </Pressable>
          <Pressable onPress={saveClass}>
            <Text style={{ color: "black", marginRight: 6 }}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.listContainer}>
          <TextInput
            style={styles.inputContainer}
            placeholder="Class Name"
            onChangeText={handleClassNameInput}
          />
          <FlatList
            data={classInfo}
            renderItem={(itemData) => {
              return (
                <View style={styles.listItemsContainer}>
                  <Text>{itemData.item.name}</Text>
                  <Pressable onPress={() => removeName(itemData.item.id)}>
                    <Ionicons name="trash" size={18} />
                  </Pressable>
                </View>
              );
            }}
          />
        </View>

        <View style={styles.addNameContainer}>
          <TextInput
            placeholder="Student Name"
            onChangeText={handleNameInput}
            style={styles.studentNameInputContainer}
            value={enternedName}
          />
          <Pressable style={{ marginLeft: 10, flex: 1 }} onPress={addClassInfo}>
            <Ionicons name="add-circle" size={32} color="white" />
          </Pressable>
        </View>
      </View>
      <StatusBar backgroundColor="#96dfaf" />
    </Modal>
  );
}

const styles = StyleSheet.create({
  createContainer: {
    flex: 1,
    justifyContent: "space-around",
  },
  inputContainer: {
    borderWidth: 1,
    padding: 9,
    margin: 9,
    borderRadius: 16,
    backgroundColor: "white",
  },
  addNameContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 1,
    padding: 9,
    backgroundColor: "#96dfaf",
  },
  listContainer: {
    flex: 19,
    backgroundColor: "#ECECEC",
  },
  exitContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#96dfaf",
  },
  studentNameInputContainer: {
    borderRadius: 8,
    padding: 4,
    flex: 9,
    backgroundColor: "white",
  },
  listItemsContainer: {
    borderRadius: 16,
    backgroundColor: "white",
    margin: 5,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
