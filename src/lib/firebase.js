import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

firebase.apps.length
? firebase.app()
: firebase.initializeApp({
    // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    apiKey: "AIzaSyCiIN5yybGML58fbA0Ia41Be6Ua8cMT09s",
    authDomain: "fujitsu-hack-53803g.firebaseapp.com",
    projectId: "fujitsu-hack-53803g",
    storageBucket: "fujitsu-hack-53803g.appspot.com",
    messagingSenderId: "583761359383",
    appId: "1:583761359383:web:b478f964c0beba29d16252",
    measurementId: "G-PGG490CGCK"
    });
    const firestore=firebase.firestore();
    const storage = firebase.storage();
    
export {firestore, storage};