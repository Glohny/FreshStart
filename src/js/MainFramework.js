import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
      const uname = user.displayName;
      const uid = user.uid;
      const uphoto = user.photoURL;
      addUserIfNotExists(uid, uname, uphoto);
      const NameSpan = document.createElement("span");
      const UPhotoIMG = document.createElement("img");
      UPhotoIMG.src = uphoto;
      UPhotoIMG.className = "UPhotoIMG";
      UPhotoIMG.alt = ":(";
      NameSpan.innerHTML = uname;
      document.querySelector(".ProfileBox").appendChild(UPhotoIMG);
      document.querySelector(".ProfileBox").appendChild(NameSpan);
      const temp = await fetchRank(uid);
      if (temp == "Admin") {
        const LinkTitle = document.querySelector("#LinkTitle");
        const AdminBadge = document.createElement("div");
        const Roles = document.createElement("div");
        const RoleList = document.createElement("div");
        RoleList.className = "RoleList";
        AdminBadge.className = "AdminBadge";
        AdminBadge.innerHTML = "Admin";
        Roles.className = "Roles";
        Roles.innerHTML = "Roles";
        document.querySelector(".ProfileBox").appendChild(AdminBadge);
        LinkTitle.insertBefore(Roles, document.querySelector(".ProfileBox"));
        document.querySelector(".Roles").appendChild(RoleList);
        const rolesBtn = document.querySelector('.Roles');
        const rolesDropdown = document.querySelector('.RoleList');

        const q = query(collection(db, "users"), where("IsAdmin", "!=", true));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const { UserName, PhotoURL, IsSenior } = doc.data();
          const DocId = doc.id;
          const AccountDiv = document.createElement("div");
          const PfpImage = document.createElement("img");
          const Option = document.createElement("select");
          Option.setAttribute("data-user-id", DocId);
          Option.className = "OptionRanks";
          const Opt1 = document.createElement("option");
          Opt1.className = "OptionRanks"
          Opt1.innerHTML = "Senior";
          Opt1.value = "Senior"; 
          const Opt2 = document.createElement("option");
          Opt2.className = "OptionRanks"
          Opt2.innerHTML = "Freshmen";
          Opt2.value = "Freshmen";
          Option.appendChild(Opt1);
          Option.appendChild(Opt2);
          if (IsSenior == true) {
              Option.value = "Senior"; 
          } else {
              Option.value = "Freshmen"; 
          }
          AccountDiv.className = "AccountDiv";
          PfpImage.className = "UPhotoIMG";
          PfpImage.src = PhotoURL;
          AccountDiv.innerHTML = UserName;
          AccountDiv.appendChild(PfpImage);
          AccountDiv.appendChild(Option);
          rolesDropdown.appendChild(AccountDiv);
          Option.addEventListener('change', function() {
            const selectedValue = this.value;
            updateRoleForUser(selectedValue, this.getAttribute('data-user-id'));
          });
        });

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
      else if (temp == "Senior") {
        const SeniorBadge = document.createElement("div");
        SeniorBadge.className = "SeniorBadge";
        SeniorBadge.innerHTML = "Senior";
        document.querySelector(".ProfileBox").appendChild(SeniorBadge);
      }
    } else {
      window.location.href = "index.html";
    }
  });

    async function addUserIfNotExists(userId, uname, uphoto) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
            UserName: uname,
            IsSenior: false,
            IsAdmin: false,
            PhotoURL: uphoto
        });
    }
    }

  async function fetchRank(userId) {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      const { IsAdmin, IsSenior } = userSnap.data();
  
      if (IsAdmin == true) {
        return "Admin";
      }
      else if (IsSenior == true) {
        return "Senior";
      }
      return
}

async function updateRoleForUser(UpdatedRoles, userId) {
  const currentRef = doc(db, "users", userId);
  if (UpdatedRoles == "Senior")
  {
    await updateDoc(currentRef, {
      IsSenior: true,
    })
  }
  else {
    await updateDoc(currentRef, {
      IsSenior: false,
    })
  }
}



