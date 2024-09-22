// Import Firebase modules
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

// Handle user authentication state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const { displayName: uname, uid, photoURL: uphoto } = user;
    await addUserIfNotExists(uid, uname, uphoto);
    addUserProfile(uphoto, uname);

    const rank = await fetchRank(uid);

    if (rank === "Admin") {
      setupAdminPanel();
    } else if (rank === "Senior") {
      displaySeniorBadge();
    }
  } else {
    // Redirect to login page if not authenticated
    window.location.href = "index.html";
  }
});

/**
 * Adds user to Firestore if they don't exist.
 */
async function addUserIfNotExists(userId, uname, uphoto) {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      UserName: uname,
      IsSenior: false,
      IsAdmin: false,
      PhotoURL: uphoto,
    });
  }
}

/**
 * Fetches the user's rank (Admin or Senior).
 */
async function fetchRank(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  const { IsAdmin, IsSenior } = userSnap.data();

  if (IsAdmin) return "Admin";
  if (IsSenior) return "Senior";

  return null;
}

/**
 * Adds the user's profile picture and name to the UI.
 */
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

/**
 * Displays the admin panel and dropdown for managing roles.
 */
async function setupAdminPanel() {
  const LinkTitle = document.querySelector("#LinkTitle");
  const AdminBadge = createAdminBadge();
  const RolesSection = createRolesSection();

  document.querySelector(".ProfileBox").appendChild(AdminBadge);
  LinkTitle.insertBefore(RolesSection, document.querySelector(".ProfileBox"));

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

/**
 * Creates and returns the Admin badge element.
 */
function createAdminBadge() {
  const AdminBadge = document.createElement("div");
  AdminBadge.className = "AdminBadge";
  AdminBadge.innerHTML = "Admin";
  return AdminBadge;
}

/**
 * Creates and returns the Roles section element.
 */
function createRolesSection() {
  const Roles = document.createElement("div");
  Roles.className = "Roles";
  Roles.innerHTML = "Roles";

  const RoleList = document.createElement("div");
  RoleList.className = "RoleList";
  Roles.appendChild(RoleList);

  return Roles;
}

/**
 * Creates and returns the user account div for displaying in the role dropdown.
 */
function createUserAccountDiv(UserName, PhotoURL, IsSenior, DocId) {
  const AccountDiv = document.createElement("div");
  const PfpImage = document.createElement("img");
  const Option = document.createElement("select");

  Option.setAttribute("data-user-id", DocId);
  Option.className = "OptionRanks";

  const Opt1 = document.createElement("option");
  Opt1.className = "OptionRanks";
  Opt1.innerHTML = "Senior";
  Opt1.value = "Senior";

  const Opt2 = document.createElement("option");
  Opt2.className = "OptionRanks";
  Opt2.innerHTML = "Freshmen";
  Opt2.value = "Freshmen";

  Option.appendChild(Opt1);
  Option.appendChild(Opt2);

  Option.value = IsSenior ? "Senior" : "Freshmen";

  Option.addEventListener('change', function () {
    const selectedValue = this.value;
    updateRoleForUser(selectedValue, this.getAttribute('data-user-id'));
  });

  PfpImage.src = PhotoURL;
  PfpImage.className = "UPhotoIMG";
  AccountDiv.className = "AccountDiv";
  AccountDiv.innerHTML = UserName;
  AccountDiv.appendChild(PfpImage);
  AccountDiv.appendChild(Option);

  return AccountDiv;
}

/**
 * Toggles the visibility of the role dropdown when hovered.
 */
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

/**
 * Updates the role for the user in Firestore when the role is changed.
 */
async function updateRoleForUser(updatedRole, userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    IsSenior: updatedRole === "Senior",
  });
}

/**
 * Displays the Senior badge on the user's profile.
 */
function displaySeniorBadge() {
  const SeniorBadge = document.createElement("div");
  SeniorBadge.className = "SeniorBadge";
  SeniorBadge.innerHTML = "Senior";
  document.querySelector(".ProfileBox").appendChild(SeniorBadge);
}
