//$( document ).ready(function() {
// Initialize Firebase
// Make sure that your configuration matches your firebase script version
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDhFEd12SX7VrvC6USDmVRcfEI8qY4crKE",
    authDomain: "trainscheduler-bd5b7.firebaseapp.com",
    databaseURL: "https://trainscheduler-bd5b7.firebaseio.com",
    projectId: "trainscheduler-bd5b7",
    storageBucket: "trainscheduler-bd5b7.appspot.com",
    messagingSenderId: "1075285241432"
  };
  firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

//removes the database
//database.ref().remove();

//$("#train-schedule>tbody").empty();
//initial read from database
// database.ref().once('value',function(snapshot){
//   snapshot.forEach(function(childSnapshot) {
//        var item = childSnapshot.val();
//        console.log("childsnapshot key: ", childSnapshot.key);
//       // item.key = childSnapshot.key;
//       // console.log(item);
//       // console.log(item.key);
//       //childSnapshot.ref().update({ storageTime: updatedDate })
//       //database.ref(item.key).update({ item.trainTimeLeft: moment(item.trainFrequency).subtract(moment(moment(Date.now())).diff(item.trainTimeStamp,"minutes"),"minutes") });
       //updateTable(item.trainName, item.destination, item.firstTrainTime, item.frequency, childSnapshot.key);
//   });
// });

// var interval = setInterval(function(){
//   $("#train-schedule>tbody").empty();
//   // want to put on values outside set interval functions because creates new one every time set interval fires
//   // put timestamp somewhere, then update all rows that have time in them
//   // store original value somewhere and update that field

//   database.ref().once('value',function(snapshot){
//     snapshot.forEach(function(childSnapshot) {
//          var item = childSnapshot.val();
//   //       // item.key = childSnapshot.key;
//   //       // console.log(item);
//   //       // console.log(item.key);
//   //       //childSnapshot.ref().update({ storageTime: updatedDate })
//   //       //database.ref(item.key).update({ item.trainTimeLeft: moment(item.trainFrequency).subtract(moment(moment(Date.now())).diff(item.trainTimeStamp,"minutes"),"minutes") });
//          updateTable(item.trainName, item.destination, item.firstTrainTime, item.frequency, childSnapshot.key);
//     });
//   });

// },60000);

// Use the below initialValue
var trainName = "";
var destination = "";
var firstTrainTime = "00:00";
var frequency = 0;
// var nextArrivalTime = "00:00";
// var minutesAway = 0;

// --------------------------------------------------------------

// At the initial load and on subsequent data value changes, get a snapshot of the current data. (I.E FIREBASE HERE)
// This callback keeps the page updated when a value changes in firebase.
 // Capture Button Click
 $("#add-train").on("click", function(event) {
  event.preventDefault();

  // Grabbed values from text boxes
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrainTime = $("#train-time").val().trim();
  frequency = $("#frequency").val().trim();
  //alert(firstTrainTime);

  // Code for handling the push
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency, 
    //svKey: null
    // nextArrivalTime: nextArrivalTime,
    // minutesAway: minutesAway
  });

   // Clears all of the text-boxes
   $("#train-name").val("");
   $("#destination").val("");
   $("#train-time").val("");
   $("#frequency").val("");
});

//fires on initial load as well
// Firebase watcher .on("child_added"
database.ref().on("child_added", function(snapshot,childKey) {
  // storing the snapshot.val() in a variable for convenience
  var sv = snapshot.val();
  console.log("sv: ", snapshot.key);
  //console.log("sv key: " + sv.key);
  console.log("fired first");
  // database.ref().update({
  //   svKey: snapshot.key
  // });
  //console.log(childKey);

  // Console.loging the last user's data
  console.log(sv.trainName);
  console.log(sv.destination);
  console.log(sv.firstTrainTime);
  console.log(sv.frequency);

  updateTable(sv.trainName, sv.destination, sv.firstTrainTime, sv.frequency, "12345");

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});

function updateTable(trainName, destination, firstTrainTime, frequency, databasekey) {
  $("#train-schedule>tbody").empty();

  //logic: date doesn't matter.  get HH:MM  just divide by 24 hours.  get now.  get diff from now (HH:MM) and first time train arrives(HH:MM) in minutes. divide by frequency.
  //we have now
  //we have time first train arrives
  //we have diff from now in minutes 
  //we have frequency
  //we want: time of next train in HH:MM AM format  

  //eg train arrives at 22:45.  
  //to get next train arrives
  //diff between now and 22:45, if current time < 15:45, then next train = 22:45, otherwise, if current time greater than 15:45 every 30 mintues (diff in minutes -), then want next train arrives at 5 hours and 45 minutes.  17:00 now. diff in minutes between now and 15:45 % frequency. while (diff in minutes between now and nextTrainTime=firstTrainTime > frequency, subtract frequency).  format nextTrainTime to AM,PN, and diff = minutes to next train.
  
  //does the calculations
  var nextArrivalTime = firstTrainTime;
  var minutesAway = 0; 
  var diffinminutes = 0;
  //var currentTime = moment().format("HH:MM");
  var timeFormat = "hh:mm";
  var arrivalTimeFormat = "hh:mm A";
  var convertedDate = moment(firstTrainTime, timeFormat);
  var now = moment(moment(), "MM/DD/YYYY").format("MM/DD/YYYY")+ " " + firstTrainTime;
  //alert(now);

  //alert(convertedDate.diff(moment(), "minutes"));
  if (moment().diff(convertedDate, "minutes") < 0) {
    console.log("now less than first train time");
    //next arrival time is firstTrainTime
    nextArrivalTime = moment(firstTrainTime, arrivalTimeFormat).format(arrivalTimeFormat);
    diffinminutes = -1*moment().diff(moment(firstTrainTime, timeFormat), "minutes");
    console.log("diff in mintues: " + diffinminutes);
  }
  else {
    console.log("now is greater than first train time");
    diffinminutes = moment().diff(convertedDate, "minutes");
    while (diffinminutes > frequency) {
      nextArrivalTime = convertedDate.add(frequency, "minutes");
      diffinminutes = moment().diff(moment(nextArrivalTime, timeFormat), "minutes");
      console.log("subtracted " + frequency + " minutes from time");
      console.log("next arrival time: " + nextArrivalTime);
    }
    //add one last number of minutes to time to get ahead of current time.  
    diffinminutes = -1*(diffinminutes - frequency);
    nextArrivalTime = convertedDate.add(frequency, "minutes");
    //alert("minutes to next train: " + diffinminutes)
    nextArrivalTime = moment(nextArrivalTime, arrivalTimeFormat).format(arrivalTimeFormat);
    //alert("next arrival time: " + nextArrivalTime);
  }
  minutesAway = diffinminutes;

  //updates the DOM
  var id = databasekey;//trainName.replace(/\s/g,'')+destination.replace(/\s/g,'')+frequency;
  var newrow = $("<tr class="+id+">");
  var newth = $("<th>");
  newth.attr("scope", "row");
  newth.text(trainName);
  newrow.append(newth);
  var newtd = $("<td>");
  newtd.text(destination);
  newrow.append(newtd);
  var newtd = $("<td>");
  newtd.text(frequency);
  newrow.append(newtd);
  var newtd = $("<td>");
  newtd.text(nextArrivalTime);
  newrow.append(newtd);
  var newtd = $("<td>");
  newtd.text(minutesAway);
  newrow.append(newtd);
  //var newtd = $("<td>");
  //var editid = trainName.replace(/\s/g,'')+destination.replace(/\s/g,'')+frequency+"edit";
  //var removeid = trainName.replace(/\s/g,'')+destination.replace(/\s/g,'')+frequency+"remove";
  //newtd.html('<button class="btn btn-primary float-right remove" value='+id+'>Remove</button><button class="btn btn-primary float-right edit" value='+editid+'>Edit</button>');
  //newrow.append(newtd);
  
  $("#train-schedule>tbody").append(newrow);

  // $(editid).on("click",function(){

  // });

  $(".remove").on("click",function(){
    //var idtoremove = $(this).closest("tr").attr("class");
    // remove from database
    //add attribute of snapshot key to database
    let id = $(this).closest("tr").attr("class");
    console.log(id);

    //database.ref().doc(id).delete();
    
    //database.ref().on('value',function(snapshot){
    //   snapshot.forEach(function(childSnapshot) {
    //       var item = childSnapshot.val().trainName.replace(/\s/g,'') + childSnapshot.val().destination.replace(/\s/g,'') + childSnapshot.val().frequency;
    //       console.log("item: "+item + "; closest tr id: "+ idtoremove);
    //       if (item === idtoremove) {
    //         alert("same item to remove in database");
    //         childSnapshot.getRef().removeValue();
    //       }
    //   });
    //});
    $(this).closest('tr').remove();
  });
}


//});