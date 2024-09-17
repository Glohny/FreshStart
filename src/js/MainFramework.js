import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
    if (user) {
      /* const uid = user.uid; */
      const uemail = user.email;
      const uname = user.displayName;
      const EmailSpan = document.createElement("span");
      const NameSpan = document.createElement("span");
      EmailSpan.innerHTML = uemail;
      NameSpan.innerHTML = uname;
      document.querySelector(".ProfileBox").appendChild(EmailSpan);
      document.querySelector(".ProfileBox").appendChild(NameSpan);
    } else {
      window.location.href = "index.html";
      alert("Please sign in before attempting to access the pages!")
    }
  });