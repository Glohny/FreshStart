import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiv4yV6r-hDz9euz7VeQKO-RHM81__Wdk",
  authDomain: "freshstart-f201a.firebaseapp.com",
  projectId: "freshstart-f201a",
  storageBucket: "freshstart-f201a.appspot.com",
  messagingSenderId: "819127136909",
  appId: "1:819127136909:web:fa344b323f6e68bbe6a8c4",
  measurementId: "G-14GJFJM1E2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
      /* const uid = user.uid; */
      const uname = user.displayName;
      const uid = user.uid;
      addUserIfNotExists(uid, uname);
      const uphoto = user.photoURL;
      const NameSpan = document.createElement("span");
      const UPhotoIMG = document.createElement("img");
      UPhotoIMG.src = uphoto;
      UPhotoIMG.className = "UPhotoIMG";
      UPhotoIMG.alt = ":(";
      NameSpan.innerHTML = uname;
      document.querySelector(".ProfileBox").appendChild(UPhotoIMG);
      document.querySelector(".ProfileBox").appendChild(NameSpan);
      const temp = await fetchSeniorStatus(uid);
      if (temp == null) {
        console.log("Not Senior!");
      }
      else {
        const SeniorBadge = document.createElement("div");
        SeniorBadge.className = "SeniorBadge";
        SeniorBadge.innerHTML = "Senior";
        document.querySelector(".ProfileBox").appendChild(SeniorBadge);
      }
    } else {
      window.location.href = "index.html";
      alert("Please sign in before attempting to access the pages!")
    }
  });

  async function addUserIfNotExists(userId, uname) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
            UserName: uname,
            IsSenior: false

        });
    }
  }

  async function fetchSeniorStatus(userId) {
    console.log(userId);
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    const { IsSenior } = userSnap.data();
  
    if (IsSenior == true) {
      const { IsSenior } = userSnap.data();
      return `${IsSenior}`;
    } else {
      console.log("No such document!");
      return null;
    }
  }