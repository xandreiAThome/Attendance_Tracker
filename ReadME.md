# Attendance Tracker App Final Project

### Video Demo : https://youtu.be/mlTFMKaAMwM

### An android app for the final project in the CS50X Harvard course

## Purpose

### To keep record of the attendance and arrival time of classmates in my class

## Description

### The app has two Main Screens

### 1. The QrCode Scanner screen is where you scan the QRcode of students to register their arrival time in the local database

### 2. The Class List Screen is where the attendance of the class lists is stored. There can be multiple class lists.

- You can make a class list through the add new class list button, where you input the name of the class and the names of each of the students in the class.

- After you make a class list, it will show up on the Class List screen and you can press the expand button to see the Names and Arrival times of the student on the current date, you can also view the arrival time on other dates by changing the selected date through the calendar button.

- Students that have not been scanned on a specific day will just have an empty arrival time.

- You can access and download the QR codes of each student by going to the Qr Code Screen and, you can then distribute these QR codes to their respective students those students will just have to save the QR code to their phone and let it be scanned whenever they enter the classroom.

- You can export the attendance of a class on a specific day to an excel file by choosing the date through the calendar button mentioned earlier and accessing the drop menu on the top right of the screen, where an export button will show up. A delete button will also show up, where you can delete the selected class list

## Made with

- React Native in the Expo SDK

- SQLite

## Installation

### There is an included apk in the project folder

## File Components

- The QrScanner.js and AttendanceList.js are the two main components of the app, they are the tab components.
- CreateClassList.js is the modal that pops up when you press the create new class list button
- Class.js is the component that renders every instance of a class in the ClassList tab
- Attendance.js is the modal that pops up when you click the expand button on the Class componen. It displays the list of all students and their arrival time on the chosen date and also stores the corrosponding qr codes for each of the students
- QrCodeContainer.js just contains the Qrcode Image and the download button for the qrcodes
- Table.js displays the individual names of the students and their corrosponding arrival time
