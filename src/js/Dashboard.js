import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration and initialization
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
      const { displayName: uname, uid, photoURL: uphoto } = user;
  
      const rank = await fetchRank(uid);
  
      if (rank === "Admin") {
        document.querySelector(".loader").style.visibility = "hidden";
        addUserProfile(uphoto, uname);
        setupAdminPanel();
      } else if (rank === "Senior") {
        document.querySelector(".loader").style.visibility = "hidden";
        addUserProfile(uphoto, uname);
        displaySeniorBadge();
      }
    } else {
      window.location.href = "index.html";
    }
});

async function fetchRank(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    const { IsAdmin, IsSenior } = userSnap.data();
  
    if (IsAdmin) return "Admin";
    if (IsSenior) return "Senior";
  
    return null;
}

function addUserProfile(uphoto, uname) {
    const NameSpan = document.createElement("span");
    const UPhotoIMG = document.createElement("img");
  
    UPhotoIMG.src = uphoto;
    UPhotoIMG.className = "UPhotoIMG";
    UPhotoIMG.alt = ":(";
    NameSpan.innerHTML = uname;
  
    const profileBox = document.querySelector(".ProfileBox");
    profileBox.appendChild(UPhotoIMG);
    profileBox.appendChild(NameSpan);
}

async function setupAdminPanel() {
    const LinkTitle = document.querySelector("#LinkTitle");
    const AdminBadge = createAdminBadge();
    const RolesSection = createRolesSection();
  
    document.querySelector(".ProfileBox").appendChild(AdminBadge);
    LinkTitle.insertBefore(RolesSection, document.querySelectorAll(".HoverDarken")[0]);
  
    const usersQuery = query(collection(db, "users"), where("IsAdmin", "!=", true));
    const querySnapshot = await getDocs(usersQuery);
  
    const rolesDropdown = document.querySelector('.RoleList');
    querySnapshot.forEach((doc) => {
      const { UserName, PhotoURL, IsSenior } = doc.data();
      const DocId = doc.id;
      const userAccountDiv = createUserAccountDiv(UserName, PhotoURL, IsSenior, DocId);
      rolesDropdown.appendChild(userAccountDiv);
    });
  
    setupRoleDropdownToggle();
}

function displaySeniorBadge() {
    const SeniorBadge = document.createElement("div");
    SeniorBadge.className = "SeniorBadge";
    SeniorBadge.innerHTML = "Senior";
    document.querySelector(".ProfileBox").appendChild(SeniorBadge);
}

function setupRoleDropdownToggle() {
    const rolesBtn = document.querySelector('.Roles');
    const rolesDropdown = document.querySelector('.RoleList');
  
    rolesBtn.addEventListener('mouseenter', () => {
      rolesDropdown.style.visibility = 'visible';
    });
  
    rolesDropdown.addEventListener('mouseenter', () => {
      rolesDropdown.style.visibility = 'visible';
    });
  
    rolesBtn.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (!rolesDropdown.matches(':hover')) {
          rolesDropdown.style.visibility = 'hidden';
        }
      }, 100);
    });
  
    rolesDropdown.addEventListener('mouseleave', () => {
      rolesDropdown.style.visibility = 'hidden';
    });
}

function createAdminBadge() {
    const AdminBadge = document.createElement("div");
    AdminBadge.className = "AdminBadge";
    AdminBadge.innerHTML = "Admin";
    return AdminBadge;
}

function createRolesSection() {
    const Roles = document.createElement("div");
    Roles.className = "Roles";
    Roles.innerHTML = "Roles";
  
    const RoleList = document.createElement("div");
    RoleList.className = "RoleList";
    Roles.appendChild(RoleList);
  
    return Roles;
}