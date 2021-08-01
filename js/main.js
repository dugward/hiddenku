// import { toUpload } from "./uploadHaiku.js";

var firebaseConfig = {
  apiKey: "AIzaSyBu0ABBPOoEh1uLjlp65f8EQXIaTwJJJPA",
  authDomain: "haikusort.firebaseapp.com",
  projectId: "haikusort",
  storageBucket: "haikusort.appspot.com",
  messagingSenderId: "1029726923409",
  appId: "1:1029726923409:web:a94cd9f56e43699df7ad30",
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

//For uploading intitial haiku set

// toUpload.forEach(function (obj) {
//   db.collection("haiku").add({
//     id: obj.id,
//     title: obj.title,
//     author: obj.author,
//     url: obj.url,
//     line1: obj.line1,
//     line2: obj.line2,
//     line3: obj.line3,
//     status: obj.status,
//   });
// });

var haikuStage = document.getElementsByClassName("haikuStage")[0];

var toDelete = [];
var toKeep = [];
var behind, finished, found;

function load12() {
  haikuStage.innerHTML = ``;
  toDelete = [];
  var the12 = [];
  db.collection("haiku")
    .where("status", "==", "unchoosed")
    .limit(12)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        the12.push(doc.data());
        toDelete.push(doc.id);
        haikuStage.insertAdjacentHTML(
          "beforeend",
          `<div class="haiku ${doc.id}">
          <div class="line1">${doc.data().line1}</div>
          <div class="line2">${doc.data().line2}</div>
          <div class="line3">${doc.data().line3}</div>
        </div>`
        );
        const thisHaik = document.getElementsByClassName(`${doc.id}`)[0];
        thisHaik.addEventListener("click", () => {
          if (thisHaik.classList.contains("clicked")) {
            thisHaik.classList.remove("clicked");
            toDelete.push(doc.id);
            toKeep = toKeep.filter((item) => item !== doc.id);
            console.log(`to delete: ${toDelete}`);
            console.log(`to keep: ${toKeep}`);
          } else {
            thisHaik.classList.add("clicked");
            toDelete = toDelete.filter((item) => item !== doc.id);
            toKeep.push(doc.id);
            console.log(`to delete: ${toDelete}`);
            console.log(`to keep: ${toKeep}`);
          }
        });
      });
    });

  //

  db.collection("haiku")
    .doc("counts")
    .get()
    .then((doc) => {
      if (doc.exists) {
        behind = doc.data().behind;
        finished = doc.data().finished;
        found = doc.data().found;
        document.getElementsByClassName("behindno")[0].innerHTML = `${behind}`;
        document.getElementsByClassName("totalno")[0].innerHTML = `${finished}`;
        document.getElementsByClassName("foundno")[0].innerHTML = `${found}`;
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  console.log(the12);
}

load12();

document.getElementsByClassName("enter")[0].addEventListener("click", () => {
  var allClicked = document.querySelectorAll(".clicked");

  if (allClicked.length > 0) {
    for (const item of allClicked) {
      item.classList.remove("clicked");
    }
    db.collection("haiku")
      .doc("counts")
      .update({ finished: finished + 12, found: found + allClicked.length });
    if (allClicked.length > 1) {
      db.collection("haiku")
        .doc("counts")
        .update({ behind: behind - (allClicked.length - 1) });
    }
    for (const doc of toDelete) {
      db.collection("haiku")
        .doc(`${doc}`)
        .delete()
        .then(() => {
          console.log(`deleted ${doc}`);
        });
    }

    for (const doc of toKeep) {
      db.collection("haiku").doc(`${doc}`).update({ status: "keep" });
    }
    load12();
  } else {
    db.collection("haiku")
      .doc("counts")
      .update({ finished: finished + 12, behind: behind + 1 });
    for (const doc of toDelete) {
      db.collection("haiku")
        .doc(`${doc}`)
        .delete()
        .then(() => {
          console.log(`deleted ${doc}`);
        });
    }
    load12();
  }
});

document.getElementsByClassName("list")[0].addEventListener("click", () => {
  haikuStage.innerHTML = ``;
  db.collection("haiku")
    .where("status", "==", "keep")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        haikuStage.insertAdjacentHTML(
          "beforeend",
          `<div class="haiku ${doc.id}">
        <div class="line1">${doc.data().line1}</div>
        <div class="line2">${doc.data().line2}</div>
        <div class="line3">${doc.data().line3}</div>
      </div>`
        );
      });
    });
});
