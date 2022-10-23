import { StatusBar } from 'expo-status-bar';
import React, { useState, useRe, useEffect } from "react";
import { ScrollView, StyleSheet, View, SafeAreaView, Platform, ImageBackground, Image, Pressable, TextInput, TouchableOpacity} from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import { initializeApp, firebase } from 'firebase/app';
import { getDatabase, ref, set, get, push, child, update, remove } from "firebase/database";
import { delay } from 'q';
import { Text, Card, Button, Icon } from '@rneui/themed';

const firebaseApp = initializeApp({
    apiKey: "AIzaSyCtSa-qK2xb-Wky_vszWWACyTqru9c9l94",
    authDomain: "voluntrack-ba589.firebaseapp.com",
    projectId: "voluntrack-ba589",
    storageBucket: "voluntrack-ba589.appspot.com",
    messagingSenderId: "237292785966",
    appId: "1:237292785966:web:8813a69013f743a1afaabf",
    measurementId: "G-KN9SKC5DYZ",
    databaseURL: "https://voluntrack-ba589-default-rtdb.firebaseio.com/"
  });
  
const db = getDatabase(firebaseApp);

const joinedEvents = ({ navigation }) => {
    // let content;
    let [flag, setFlag] = useState("");
    let [events, setEvents] = useState("None")
    let [eventsArr, setEventsArr] = useState([])
    let [eventStr, setEventStr] = useState(JSON.stringify(events))
    let [joined, setJoined] = useState([])
    let [attendees, setAttendees] = useState({})
    let [attendeesStr, setAttendeesStr] = useState(JSON.stringify(attendees))

    const dbref = ref(db);

    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user.uid;
    
    useEffect(() => {
      get(child(dbref, "Users/" + uid))
        .then((snapshot)=> {
          if (snapshot.exists()) {
            if (Array.isArray(snapshot.val().attendedEvents)) {
                //setFlag("You have attended no events");
                //console.log(flag);
            }
            // values of attended event keys stored in state variable
            else {
                setJoined(Object.values(snapshot.val().attendedEvents))
                if (joined.length >= 2) {
                    //setFlag("You have attended one or more events");
                    //console.log(flag);
                }

                let joinedArr = []
                // console log for attended event keys
                //console.log(Object.values(snapshot.val().joinedEvents))
                // loop traversing through all attended event keys
                for(let i = 1; i < Object.values(snapshot.val().attendedEvents).length; i++) {
                    //const dbref = ref(db);
                    let eid = Object.values(snapshot.val().attendedEvents)[i]
                    get(child(dbref, `Events/${eid}`))
                    .then((snapshot) => {
                        if(snapshot.exists()) {
                          if (snapshot.val().eventEnded == 1) {
                              let info = snapshot.val()
                              joinedArr.push(info)
                              setEventsArr(joinedArr)
                              setEventStr(JSON.stringify(joinedArr))
                              setFlag("You have attended one or more events");
                              console.log(joinedArr)
                          }
                        } else {
                            console.log("snapshot doesnt exist")
                        }
                    })
                    .catch((error) => console.log(error.message))
                }

            }
            let joinedArr = []
            let attendeesDict = {}
            // console log for created event keys
            //console.log(Object.values(snapshot.val().createdEvents))
            // loop traversing through all created event keys
            for(let i = 1; i < Object.values(snapshot.val().attendedEvents).length; i++) {
                //const dbref = ref(db);
                let eid = Object.values(snapshot.val().attendedEvents)[i]
                
                get(child(dbref, `Events/${eid}`))
                .then((snapshot) => {
                    if(snapshot.exists()) {
                      if (snapshot.val().eventEnded == 1) {
                        let info = snapshot.val()
                        joinedArr.push(info)
                        setEventsArr(joinedArr)
                        setEventStr(JSON.stringify(joinedArr))
                        console.log(snapshot.val().attendedUsers)

                        let attendeesArr = Object.values(snapshot.val().attendedUsers)
                        let attendeesData = []
                        for(let i = 1; i < attendeesArr.length; i++) {
                          let cur = attendeesArr[i]
                        
                          get(child(dbref, `Users/${cur}`))
                            .then((snapshot) => {
                              if(snapshot.exists()) {
                                let curData = {
                                  uid: cur,
                                  firstName: snapshot.val().firstName,
                                  lastName: snapshot.val().lastName,
                                  email: snapshot.val().emailAddress,
                                  phone: snapshot.val().phoneNumber
                                }
                                attendeesData.push(curData)
                                //console.log(`attendee data obj list ${attendeesData}`)

                                attendeesDict[eid] = attendeesData
                                setAttendees(attendeesDict)
                                setAttendeesStr(JSON.stringify(attendeesDict))
                                //setAttendees(attendeesDict)
                                //setAttendeesStr(JSON.stringify(attendeesDict))
                                //console.log(attendeesDict)
                              } else {
                                alert(`attendee id ${cur} does not exist`)
                              }
                            })
                            .catch((error) => alert(error.message))
                        }
                      
                        //console.log(attendeesArr)
                        // attendeesDict[eid] = attendeesData
                        // console.log(attendeesDict)
                        // setAttendees(attendeesDict)
                        // setAttendeesStr(JSON.stringify(attendeesDict))
                        // console.log(attendeesDict)
                        // console.log(attendeesStr)
                      }
                    } else {
                        console.log("snapshot doesnt exist")
                    }
                })
                .catch((error) => console.log(error.message))
            }
        }
        else {
            alert("No data found");            
        }
      })
  .catch((error)=> {
      alert("unsuccessful, error"+error);
   });
  }, [])

  console.log('eventsArr:' + eventsArr)

  return (       
    <><Text style={{ fontSize: 15, color: 'black', textAlign: 'center', fontWeight: 'bold' }}>{flag}</Text><ScrollView>{eventsArr.map((element, index) => {
      return (
        <View>
          <Card containerStyle={{ marginTop: 15 }}>
            <Card.Title style={{ fontSize: 20, textAlign: 'center' }}>{eventsArr[index]?.name}</Card.Title>
            <Card.Divider />

            <Text style={styles.fonts}>
              Description: {eventsArr[index]?.description}
            </Text>
            <Text style={styles.fonts}>
              Start Date & Time: {eventsArr[index]?.startDate.split(' ')[0]} at {eventsArr[index]?.startDate.split(' ')[1]}
            </Text>
            <Text style={styles.fonts}>
              End Date & Time: {eventsArr[index]?.endDate.split(' ')[0]} at {eventsArr[index]?.endDate.split(' ')[1]}
            </Text>
            <Text style={styles.fonts}>
              Location: ({eventsArr[index]?.latitude}, {eventsArr[index]?.longitude})
            </Text>
            <Text style={styles.fonts}>
              Number of Attendees: {Object.keys(eventsArr[index]?.attendedUsers).length - 1}
            </Text>
            <Text style={styles.fonts}>
              Contact Email: {eventsArr[index]?.contactEmail}
            </Text>
            <Text style={styles.fonts}>
              Contact Number: {eventsArr[index]?.contactNumber.substring(0, 3)}-{eventsArr[index]?.contactNumber.substring(3, 6)}-{eventsArr[index]?.contactNumber.substring(6, 10)}
            </Text>
          </Card>
        </View>
      );
    })}
    </ScrollView></>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fonts: {
    marginBottom: 8,
    fontSize: 12
  },
  user: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default joinedEvents; 