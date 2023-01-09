import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Pressable,
} from "react-native";
import React from "react";
import Class from "./Class";
import * as SQLite from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import CreateClassList from "./CreateClassList";

export default function ClassList({ route, navigation }) {
  const [createClassListModal, setCreateClassListModal] = React.useState(false);
  const [classInfo, setClassInfo] = React.useState({ class: "", name: "" });
  const [distinctClasses, setDistinctClasess] = React.useState([]);

  const db = SQLite.openDatabase("Attendance.db");

  //to forecfully update the screen when a class list isa deleted
  const [value, setValue] = React.useState(0); // integer state
  function useForceUpdate() {
    setValue((value) => value + 1); // update state to force render
    // An function that increment 👆🏻 the previous state like here
    // is better than directly setting `value + 1`
  }

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT DISTINCT class FROM classlist",
        [],
        (txObj, resultSet) =>
          setDistinctClasess(
            resultSet.rows._array.map((x) => ({
              class: x.class,
              //adds id object to the distinct class name state so that it can be rendered by flatlist
              id: Math.random().toString(),
            }))
          ),
        (error) => console.log("error wasnt able to retrieve class names")
      );
    });
  }, [createClassListModal, value]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.classListContainer}>
        <FlatList
          style={{ width: "100%", marginTop: 40 }}
          data={distinctClasses}
          renderItem={(itemData) => {
            return (
              <Class
                class={itemData.item.class}
                useForceUpdate={useForceUpdate}
              />
            );
          }}
        />
      </View>
      <Button
        title="Add new Class list"
        onPress={() => setCreateClassListModal(true)}
      />
      {createClassListModal && (
        <CreateClassList setCreateClassListModal={setCreateClassListModal} />
      )}
      <StatusBar backgroundColor="#96dfaf" />
    </View>
  );
}

const styles = StyleSheet.create({
  classListContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#ECECEC",
  },
});
