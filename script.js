// let campusData = null;
// const displayDiv = document.getElementById("display-directions");
// let currentSentenceIndex = 0;
// let directionSentences = [];

// fetch('https://campus-directions-8cffa-default-rtdb.firebaseio.com/.json')
// .then(response => response.json())
// .then(data =>{
//     console.log("Fetched Data:", JSON.stringify(data, null, 2));
//     console.log("Keys in data:", Object.keys(data));
//     campusData = data;
    
// })
// .catch(error =>{
//     console.error('Error fetching data:', error);
// });


// document.addEventListener("DOMContentLoaded", function(){
//     // const directionForm = document.getElementById("direction-form");
//     // const displayDiv = document.getElementById("display-directions");
//     displayDiv.style.display = "none";
// });

// document.getElementById("direction-form").addEventListener("submit", function(event)
// {
//     event.preventDefault();

//     const endPoint = document.getElementById("end-point").value.trim().toLowerCase();
    

//     if(!campusData){
//         displayDiv.style.display = "block";
//         displayDiv.innerText = "Directions still loading. Please try again.";
//         return;
//     }

//     const location = campusData.locations.locations.find(loc => loc.name.toLowerCase()=== endPoint);

//     if (location){
//         // console.log(location);
//         displayDiv.style.display = "block";
//         displayDiv.innerText = `Directions from Reception Area to ${location.name}: ${location.directions}`;
//         // speakText(`Directions from Reception Area to ${location.name}: ${location.directions}`);
//     }
//     else{
//         displayDiv.style.display = "block";
//         displayDiv.innerText = "Location not found. Please enter a valid destination.";
//         speakText("Location not found. Please enter a valid destination.");
//     }
// });


// let sentenceArray = [];

// document.getElementById("direction-form").addEventListener("submit", function(event){
//   event.preventDefault();
//   const endPoint = document.getElementById("end-point").ariaValueMax.trim().toLowerCase();

//   if(!campusData){
//     displayDiv.style.display = "block";
//     displayDiv.innerText = "Directions still loading. Please try again later.";
//     return;
//   }

//   const location = campusData.locations.locations.find(loc => loc.name.toLowerCase() === endPoint);

//   if (location){
//     const fullDirections = `Directions from Reception Area to ${location.name}: ${location.directions}`;
//     sentenceArray = fullDirections.split('.').filter(s => s.trim() !== '').map(s => s.trim() + '.');
//     currentSentenceIndex = 0;

//     displayDiv.innerHTML = `
//          <p id="direction-sentence"> ${sentenceArray[0]}</p>
//          <button id="next-sentence">Next</button>
//     `;
//     displayDiv.style.display = "block";
//   } else{
//     displayDiv.style.display = "block";
//     displayDiv.innerText = "Location not found. Please enter a valid destination.";
//     speakText("Location not found. Please enter a valid destination.");
//   }
// });

// document.getElementById("speak-button").addEventListener("click", () => {
//     const displaytext = displayDiv.innerText;
//     console.log(displaytext);
//     if (displaytext &&
//          !displaytext.includes( "Location not found. Please enter a valid destination.") &&
//          !displaytext.includes(" Directions still loading. Please try again,")){
//         speakText(displaytext);
//     }
    
// });

// function showCurrentSentence(locationName){
//   displayDiv.style.display = "block";

//   const currentSentence = directionSentences[currentSentenceIndex];
//   const remaining = currentSentenceIndex < directionSentences.length - 1;

//   displayDiv.innerHTML = `
//   <p><s"trong>${locationName}</strong>: ${currentSentence}</p>
//   ${remaining ? '<button id="next-sentence"> Next</button>' : '<p><em>You made it to your destination.</em></p>'}
//   `;

// speakText (currentSentence);

// if (remaining){
//   document.getElementById("next-sentence").addEventListener("click", () =>{
//     currentSentenceIndex++;
//     showCurrentSentence(locationName);
//   });
// }
// }

// function speakText(text){
//   const synth = window.speechSynthesis;

//   if(!synth) {
//     console.error("Speech Synthesis is not supported in this browser.");
//     return;
//   }

//   const utterance = new SpeechSynthesisUtterance(text);
//   synth.speak(utterance);
// }

let campusData = null;
const displayDiv = document.getElementById("display-directions");
const directionText = document.getElementById("direction-text");
const nextButton = document.getElementById("next-sentence");

let currentSentenceIndex = 0;
let directionSentences = [];

fetch('https://campus-directions-8cffa-default-rtdb.firebaseio.com/.json')
.then(response =>{
    if(!response.ok){
        throw new Error(`Firebase fetch failed: ${response.status}`);
    }
    return response.json();
})
.then(data => {
   if(!data || typeof data !== 'object'){
    throw new Error('Location data is missing in Firebase');
   }

   campusData = data;
    console.log("Fetched Data:", campusData);
})
.catch(error => {
    console.error('Error fetching data:', error.message);
    // displayDiv.style.display = "block";
    // directionText.innerText = "Failed to load directions. Please check your internet connection or Firebase permissions.";
});

document.addEventListener("DOMContentLoaded", function() {
    displayDiv.style.display = "none";
});

window.speechSynthesis.onvoiceschanged = () => {
    const voices = speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => v.name));
};

document.getElementById("direction-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const endPoint = document.getElementById("end-point").value.trim().toLowerCase();

    if (!campusData) {
        displayDiv.style.display = "block";
        directionText.innerText = "Directions still loading. Please try again.";
        return;
    }

    const locationsArray = Object.values(campusData.locations);
    const location = locationsArray.find(loc => loc && loc.name && loc.name.toLowerCase() === endPoint);

    if (location) {
        directionSentences = location.directions.split(/(?<=[.!?])\s+/);
        currentSentenceIndex = 0;

        if (directionSentences.length > 0) {
            directionText.innerText = directionSentences[0];
            displayDiv.style.display = "block";
            nextButton.style.display = directionSentences.length > 1 ? "inline-block" : "none";
        } else {
            directionText.innerText = "No directions found.";
            nextButton.style.display = "none";
        }
    } else {
        displayDiv.style.display = "block";
        directionText.innerText = "Location not found. Please enter a valid destination.";
        speakText("Location not found. Please enter a valid destination.");
    }
});

document.getElementById("next-sentence").addEventListener("click", () => {
    currentSentenceIndex++;
    if (currentSentenceIndex < directionSentences.length) {
        directionText.innerText = directionSentences[currentSentenceIndex];
        if (currentSentenceIndex === directionSentences.length - 1) {
            nextButton.style.display = "none";
        }
    }
});

document.getElementById("speak-button").addEventListener("click", () => {
    const displaytext = directionText.innerText;
    if (displaytext &&
        displaytext !== "Location not found. Please enter a valid destination." &&
        displaytext !== "Directions still loading. Please try again.") {
        speakText(displaytext);
    }
});

document.getElementById("close-directions").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    displayDiv.style.display = "none";

    directionText.innerText = "";
    currentSentenceIndex = 0;
    directionSentences = [];
});

function speakText(text) {
    const synth = window.speechSynthesis;
    synth.cancel();

    const voices = synth.getVoices();
    const preferredVoiceName = "Google UK English Female"; 
    const selectedVoice = voices.find(voice => voice.name === preferredVoiceName) || voices[0];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    synth.speak(utterance);
}
