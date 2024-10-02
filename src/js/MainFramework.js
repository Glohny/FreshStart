document.querySelector(".AddButton").addEventListener("click", () => {
  document.querySelector("#MainDialog").showModal();
});

document.getElementById("PostForm").addEventListener("submit", onSubmitForm);

document.querySelector(".CollapseArea").addEventListener("click", () => {
  CollapseAll();
});


// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, addDoc, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

    if (rank === "Admin" && document.querySelector(".Grabbable") == null) {
      document.querySelector(".loader").style.visibility = "hidden";
      addUserProfile(uphoto, uname);
      setupAdminPanel();
      AddPosts()
    } else if (rank === "Senior" && document.querySelector(".Grabbable") == null) {
      document.querySelector(".loader").style.visibility = "hidden";
      addUserProfile(uphoto, uname);
      displaySeniorBadge();
      AddPosts()
    }
    else if (rank === null && document.querySelector(".Grabbable") == null) {
      document.querySelector(".loader").style.visibility = "hidden";
      addUserProfile(uphoto, uname);
      AddPosts()
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

function createAdminBadge() {
  const AdminBadge = document.createElement("div");
  AdminBadge.className = "AdminBadge";
  AdminBadge.innerHTML = "Admin";
  return AdminBadge;
}

function createAdminBadge2() {
  const AdminBadge = document.createElement("div");
  AdminBadge.className = "AdminBadge2";
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

async function CreatePostDiv(Content, Title, AuthorID, PostID, Timestamp) {

  const userRef = doc(db, "users", AuthorID);
  const userSnap = await getDoc(userRef);
  const { PhotoURL, UserName, IsSenior, IsAdmin:IsUserAdmin } = userSnap.data();

  const currentDiv = document.createElement("div");
  currentDiv.setAttribute("post-id", PostID);
  currentDiv.className = "PostDivs";

  const TimeStampDiv = document.createElement("div");
  const TimeStampSpan = document.createElement("span");
  TimeStampSpan.innerHTML = ConvertTime(Timestamp);
  TimeStampDiv.appendChild(TimeStampSpan);
  TimeStampDiv.className = "Timestamp";

  const UserInfoDiv = document.createElement("div");
  
  const ProfilePicture = document.createElement("img");
  ProfilePicture.src = PhotoURL;
  ProfilePicture.className = "UserInfo";
  ProfilePicture.id = "ProfileIMG";
  UserInfoDiv.appendChild(ProfilePicture);

  const UserNameSpan = document.createElement("span");
  UserNameSpan.className = "UserSpan";
  if (IsUserAdmin) {
    UserNameSpan.style.color = "red";
  }
  else if (IsSenior) {
    UserNameSpan.style.color = "blue";
  }
  else {
    UserNameSpan.style.color = "rgb(121, 121, 121)";
  }
  UserNameSpan.innerHTML = UserName;
  if (UserName.length >= 10) {
    UserNameSpan.style.fontSize = "15px";
  }

  if (UserName.length >= 15) {
    UserNameSpan.style.fontSize = "10px";
  }
  UserInfoDiv.appendChild(UserNameSpan);
  UserInfoDiv.className = "UserInfo";

  const TitleDiv = document.createElement("div");
  const TitleSpan = document.createElement("span");
  TitleSpan.innerHTML = Title;
  TitleDiv.appendChild(TitleSpan);
  TitleDiv.className = "Title";

  const ContentDiv = document.createElement("div");
  const ContentSpan = document.createElement("span");
  ContentSpan.innerHTML = Content;
  ContentDiv.appendChild(ContentSpan);
  ContentDiv.className = "Content";

  const CommentDiv = document.createElement("div");
  CommentDiv.className = "CommentBox";
  
  currentDiv.appendChild(UserInfoDiv);
  currentDiv.appendChild(TimeStampDiv);
  currentDiv.appendChild(TitleDiv);
  currentDiv.appendChild(ContentDiv);
  currentDiv.appendChild(CommentDiv);

  const user = auth.currentUser;
  const { uid } = user;

  const userRef2 = doc(db, "users", uid);
  const userSnap2 = await getDoc(userRef2);

  const { IsAdmin } = userSnap2.data();

  if (uid === AuthorID || IsAdmin == true) {
    const DeleteButton = document.createElement("button");
    DeleteButton.innerHTML = "X";
    DeleteButton.className = "DeleteButton";
    DeleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const DeleteDialog =  document.querySelector("#DeleteDialog");
      DeleteDialog.show();
      document.querySelector("#ConfirmDelete").addEventListener("click", async () => {
        document.querySelector(`[post-id="${PostID}"][class="PostDivs"]`).remove();
        await deleteDoc(doc(db, "posts", PostID));
        DeleteDialog.close();
      });
      document.querySelector("#NevermindDelete").addEventListener("click", () => {
        DeleteDialog.close();
      });
    });
    currentDiv.appendChild(DeleteButton);
  }

   // Create form element with class 'CommentForm'
  const commentForm = document.createElement('form');
  commentForm.className = 'CommentForm';

   // Create the text box input with class 'CommentTextBox'
  const commentTextBox = document.createElement('input');
  commentTextBox.type = 'text';
  commentTextBox.className = 'CommentTextBox';
   commentTextBox.name = 'comment'; // Optional: Assign name for form submission

   // Create the submit button with class 'CommentSubmitButton'
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'CommentSubmitButton';
  submitButton.textContent = 'Submit';
  commentForm.addEventListener("submit", onSubmitComment);

   // Append inputs to form
  commentForm.appendChild(commentTextBox);
  commentForm.appendChild(submitButton);
  const LR = document.createElement("hr");
  currentDiv.appendChild(LR);
  currentDiv.appendChild(commentForm);


  currentDiv.addEventListener("click", () => {
    currentDiv.classList.toggle('active');
  })

  commentTextBox.addEventListener('click', function(event) {
    event.stopPropagation();
  });

  submitButton.addEventListener('click', function(event) {
    event.stopPropagation();
  });

  return currentDiv;
}

async function AddComments(PostDiv, PostID) {
  const  commentsRef = await collection(db, "posts", PostID, "comments")
  const commentsQuery = query(commentsRef, orderBy("Timestamp", "desc"));
  const querySnapshot = await getDocs(commentsQuery);
  
  querySnapshot.forEach(async (info) => {
    const DocId = info.id;
    const { AuthorID, Content, Timestamp } = info.data();
    const CommentBox = document.createElement("div");
    CommentBox.className = "ContainerCommentBox";
    CommentBox.setAttribute("comment-id", DocId);
    const ProfileBox = document.createElement("div");
    ProfileBox.className = "ProfileBox2";
    const ContentBox = document.createElement("div");
    ContentBox.className = "ContentBox";
    ContentBox.innerHTML = Content;

  const userRef = doc(db, "users", AuthorID);
  const userSnap = await getDoc(userRef);
  const { PhotoURL, UserName, IsSenior, IsAdmin } = userSnap.data();
    
    const UserProfileArea = document.createElement("span");
    UserProfileArea.className = "UserProfileArea";

    const UserUserNameArea = document.createElement("div");
    UserUserNameArea.innerHTML = UserName;

    const UserProfilePicture = document.createElement("img");
    UserProfilePicture.src = PhotoURL;
    
    UserProfileArea.appendChild(UserProfilePicture)
    UserProfilePicture.className = "ProfileIMGS";

    UserProfileArea.appendChild(UserUserNameArea);

    
    if (IsAdmin) {
      UserProfileArea.appendChild(createAdminBadge2());
    }
    else if (IsSenior){
      const SeniorBadge = document.createElement("div");
      SeniorBadge.className = "SeniorBadge2";
      SeniorBadge.innerHTML = "Senior";
      UserProfileArea.appendChild(SeniorBadge);
    }

    const TimeArea = document.createElement("span");
    TimeArea.className = "TimeArea";
    TimeArea.innerHTML = ConvertTime(Timestamp);

    ProfileBox.appendChild(UserProfileArea);
    
    ProfileBox.appendChild(TimeArea);
    CommentBox.appendChild(ProfileBox);
    CommentBox.appendChild(ContentBox);

    PostDiv.querySelector(".CommentBox").appendChild(CommentBox);


  const user = auth.currentUser;
  const { uid } = user;

  const userRef2 = doc(db, "users", uid);
  const userSnap2 = await getDoc(userRef2);

  const { IsAdmin: IsAdmin2 } = userSnap2.data();

    if (uid === AuthorID || IsAdmin2 == true) {
      const DeleteButton = document.createElement("button");
      DeleteButton.innerHTML = "X";
      DeleteButton.className = "DeleteButton2";
      DeleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const DeleteDialog =  document.querySelector("#DeleteDialog2");
        DeleteDialog.show();
        document.querySelector("#ConfirmDelete2").addEventListener("click", async () => {
          deleteComment(PostID, DocId)
          DeleteDialog.close();
        });
        document.querySelector("#NevermindDelete2").addEventListener("click", () => {
          DeleteDialog.close();
        });
      });
      ProfileBox.appendChild(DeleteButton);
    }
  });
}

async function AddPosts() {
  const postsRef = collection(db, "posts");
  const postQuery = query(postsRef, orderBy("Timestamp", "desc"));
  const querySnapshot = await getDocs(postQuery);
  const HomePage = document.querySelector(".MainPage");
  querySnapshot.forEach(async (doc) => {
    const { AuthorID, Content, Title, Timestamp } = doc.data();
    const DocId = doc.id;
    const PostDivs = await CreatePostDiv(Content, Title, AuthorID, DocId, Timestamp);
    AddComments(PostDivs, DocId);
    HomePage.appendChild(PostDivs);
  });
}

async function onSubmitComment(e) {
  e.preventDefault();

  // Get the parent post div from the form
  const postDiv = e.target.closest('.PostDivs');
  const postId = postDiv.getAttribute('post-id');  // Get the post ID from the parent div

  const commentInput = e.target.querySelector('.CommentTextBox'); // Find the comment input
  const AuthorID = auth.currentUser.uid; 
  const Content = commentInput.value;  // Get the content of the comment input
  
  e.target.reset();  

  if (Content.trim() === "") {
    alert("Comment cannot be empty");
    return;
  }

  // Add the comment to the specific post
  const CurrentComment = await addDoc(collection(db, "posts", postId, "comments"), {
    AuthorID: AuthorID,
    Content: Content,
    Timestamp: serverTimestamp(),
    Rank: await fetchRank(AuthorID)
  });

  const ThisCommentID = CurrentComment.id;

  // Fetch user info
  const userRef = doc(db, "users", AuthorID);
  const userSnap = await getDoc(userRef);
  const { PhotoURL, UserName, IsSenior, IsAdmin } = userSnap.data();

  // Create CommentBox structure
  const CommentBox = document.createElement("div");
  CommentBox.className = "ContainerCommentBox";
  CommentBox.setAttribute("comment-id", ThisCommentID);

  const ProfileBox = document.createElement("div");
  ProfileBox.className = "ProfileBox2";

  const ContentBox = document.createElement("div");
  ContentBox.className = "ContentBox";
  ContentBox.innerHTML = Content;

  const UserProfileArea = document.createElement("span");
  UserProfileArea.className = "UserProfileArea";

  const UserUserNameArea = document.createElement("div");
  UserUserNameArea.innerHTML = UserName;

  const UserProfilePicture = document.createElement("img");
  UserProfilePicture.src = PhotoURL;
  UserProfilePicture.className = "ProfileIMGS";

  // Append user profile picture and name
  UserProfileArea.appendChild(UserProfilePicture);
  UserProfileArea.appendChild(UserUserNameArea);

  // Add Admin or Senior Badge
  if (IsAdmin) {
    UserProfileArea.appendChild(createAdminBadge2());
  } else if (IsSenior) {
    const SeniorBadge = document.createElement("div");
    SeniorBadge.className = "SeniorBadge2";
    SeniorBadge.innerHTML = "Senior";
    UserProfileArea.appendChild(SeniorBadge);
  }

  // Create and append the timestamp
  const TimeArea = document.createElement("span");
  TimeArea.className = "TimeArea";
  TimeArea.innerHTML = "now";  // Since the comment is just added

  ProfileBox.appendChild(UserProfileArea);
  ProfileBox.appendChild(TimeArea);

  // Append profile box and content box to the CommentBox
  CommentBox.appendChild(ProfileBox);
  CommentBox.appendChild(ContentBox);
    const DeleteButton = document.createElement("button");
    DeleteButton.innerHTML = "X";
    DeleteButton.className = "DeleteButton2";
    DeleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const DeleteDialog =  document.querySelector("#DeleteDialog2");
      DeleteDialog.show();
      document.querySelector("#ConfirmDelete2").addEventListener("click", async () => {
        deleteComment(postId, ThisCommentID);
        DeleteDialog.close();
      });
      document.querySelector("#NevermindDelete2").addEventListener("click", () => {
        DeleteDialog.close();
      });
    });
    ProfileBox.appendChild(DeleteButton);

  // Insert the comment at the top of the comment section
  const CommentArea = postDiv.querySelector(".CommentBox");
  const AllComments = CommentArea.querySelectorAll(".ContainerCommentBox");
  CommentArea.insertBefore(CommentBox, AllComments[0]);


}


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

async function deleteComment(PostId, CommentId) {
  const currentElement = document.querySelector(`[comment-id="${CommentId}"]`);
  currentElement.remove();
  await deleteDoc(doc(db, "posts", PostId, "comments", CommentId));
}

function CollapseAll() {
  console.log("hello");
  const PostList = document.querySelectorAll(".PostDivs.active");

  for (let i = 0; i < PostList.length; i++) {
    console.log(PostList[i]);
      PostList[i].classList.toggle("active");
  }
}

















































































































































  /* Andrews Section */