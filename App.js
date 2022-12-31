import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import ClassList from "./components/ClassList";
import QrScanner from "./components/QrScanner";
import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabView,
} from "@react-navigation/material-bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from "expo-sqlite";
import React from "react";

const Tab = createMaterialBottomTabNavigator();

export default function App() {
  const db = SQLite.openDatabase("Attendance.db"); // returns Database object

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "PRAGMA foreign_keys = ON",
        [],
        (txObj, resultSet) => console.log("pragma foreign key turned on"),
        (error) => console.log("pragma foregin key error")
      );
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS classList (classID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL UNIQUE, class TEXT NOT NULL)",
        [],
        (txObj, rs) => console.log("classlist tabble succesfully created"),
        (error) => console.log("classlist table creation error")
      );
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS attendance (attendanceID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, year INTEGER, month INTEGER, day INTEGER, time TEXT, classReference INTEGER NOT NULL, FOREIGN KEY (classReference) REFERENCES classlist (classID) ON DELETE CASCADE) ",
        [],
        (txObj, rs) => console.log("attendance tabble succesfully created"),
        (error) => console.log("attendance table creation error")
      );
    });
  }, []);
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="QrScanner"
        /*  activeColor="#FFFFFF"
        inactiveColor="#424242"*/
        barStyle={{ backgroundColor: "#96dfaf" }}
      >
        <Tab.Screen
          name="QrScanner"
          component={QrScanner}
          options={{
            tabBarLabel: "QR Scanner",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="qrcode" color={color} size={23} />
            ),
          }}
        />
        <Tab.Screen
          name="Class List"
          component={ClassList}
          options={{
            tabBarLabel: "Class List",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="card-bulleted"
                color={color}
                size={23}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    //alignitem for the minor axisj
    justifyContent: "center",
    //justfiycontent for the main axis
  },
});
