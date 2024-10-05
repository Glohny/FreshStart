import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy  } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
  
      if (rank === "Admin" && document.querySelector(".Grabbable") == null) {
        document.querySelector(".loader").style.visibility = "hidden";
        addUserProfile(uphoto, uname);
        setupAdminPanel();
        FetchPosts(uid);
      } else if (rank === "Senior" && document.querySelector(".Grabbable") == null) {
        document.querySelector(".loader").style.visibility = "hidden";
        addUserProfile(uphoto, uname);
        displaySeniorBadge();
        FetchPosts(uid);
      }
      else if (rank === null && document.querySelector(".Grabbable") == null) {
        document.querySelector(".loader").style.visibility = "hidden";
        addUserProfile(uphoto, uname);
        FetchPosts(uid);
      }
    } else {
      window.location.href = "index.html";
    }
});



  async function FetchPosts() {
    const UID = auth.currentUser.uid;

    const postQuery = query(collection(db, "posts"), where("AuthorID", "==", UID), orderBy("Timestamp", "desc"));
    const querySnapShot = await getDocs(postQuery);
    querySnapShot.forEach(async (docInfo) => {

      const { Content, Title, Timestamp } = docInfo.data();


      const PostBody = document.createElement("div");
      PostBody.className = "PostContainer";
      PostBody.setAttribute("post-id", docInfo.id);

      const JumpTo = document.createElement("a"); 
      JumpTo.innerHTML = "Jump To";
      JumpTo.href = "homepage.html?postId=" + docInfo.id;
      
      const WordBox2 = document.createElement("span");
      WordBox2.className = "DashboardSpanTitleContainer";
      const WordBox3 = document.createElement("span");
      WordBox3.className = "DashboardSpanContainers";
      const WordBox4 = document.createElement("span");
      WordBox4.className = "DashboardSpanTimeContainer";

      WordBox2.innerHTML = Title;
      WordBox3.innerHTML = Content;
      WordBox4.innerHTML = ConvertTime(Timestamp);

      PostBody.appendChild(JumpTo);
      PostBody.appendChild(WordBox2);
      PostBody.appendChild(WordBox3);
      PostBody.appendChild(WordBox4);
      
      document.querySelector(".DashboardPostContainer").appendChild(PostBody);
    });
  }





// earlier work

function ConvertTime(TimestampString) {

  const date = TimestampString.toDate();
  
  const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
  };
  
  return date.toLocaleString('en-US', options); 
  
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
  NameSpan.className = "Grabbable";

  UPhotoIMG.src = uphoto;
  UPhotoIMG.className = "UPhotoIMG";
  UPhotoIMG.referrerPolicy = "no-referrer";
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







































  /* Andrews Section */