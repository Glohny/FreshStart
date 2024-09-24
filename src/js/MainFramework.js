document.querySelector(".AddButton").addEventListener("click", function() {
  document.querySelector("#MainDialog").showModal();
})

document.getElementById("PostForm").addEventListener("submit", onSubmitForm);


// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
    await addUserIfNotExists(uid, uname, uphoto);

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
    else if (rank === null) {
      document.querySelector(".loader").style.visibility = "hidden";
      addUserProfile(uphoto, uname);
    }
  } else {
    window.location.href = "index.html";
  }

  AddPosts()

});

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

  Option.addEventListener("change", function () {
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

async function updateRoleForUser(updatedRole, userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    IsSenior: updatedRole === "Senior",
  });
}

function displaySeniorBadge() {
  const SeniorBadge = document.createElement("div");
  SeniorBadge.className = "SeniorBadge";
  SeniorBadge.innerHTML = "Senior";
  document.querySelector(".ProfileBox").appendChild(SeniorBadge);
}

async function onSubmitForm(e) {
  e.preventDefault();
  document.querySelector("#MainDialog").close(); 

  const AuthorID = auth.currentUser.uid; 
  const Content = document.getElementById("Content").value;
  const Timestamp = serverTimestamp();
  const Title = document.getElementById("Title").value;

  await addDoc(collection(db, "posts"), {
    AuthorID: AuthorID,
    Content: Content,
    Timestamp: Timestamp,
    Title: Title,
    Rank: await fetchRank(AuthorID)
  });

  document.getElementById("PostForm").reset();
  location.reload();
}

async function AddPosts() {
  const postsQuery = collection(db, "posts");
  const querySnapshot = await getDocs(postsQuery);

  const HomePage = document.querySelector('.MainPage');
  querySnapshot.forEach((doc) => {
    const { AuthorID, Content, Title } = doc.data();
    const DocId = doc.id;
    const PostDivs = CreatePostDiv(Content, Title, AuthorID, DocId);
    console.log(Content);
    console.log(Title);
    HomePage.appendChild(PostDivs);
  });
}

function CreatePostDiv(Content, Title, AuthorID, Author, PostID) {
  const currentDiv = document.createElement("div");
  currentDiv.className = "PostDivs";
  currentDiv.innerHTML = Title + " | " + Content;
  return currentDiv;
}
