
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

// window.speechSynthesis.onvoiceschanged = () => {
//     const voices = speechSynthesis.getVoices();
//     console.log("Available voices:", voices.map(v => v.name));
// };

document.getElementById("direction-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const endPoint = document.getElementById("end-point").value.trim().toLowerCase();

    if (!campusData) {
        displayDiv.style.display = "block";
        directionText.innerText = "Directions still loading. Please try again.";
        return;
    }

    const locationsArray = Object.values(campusData.locations.locations);
    const locations.locations = locationsArray.find(loc => loc && loc.name && loc.name.toLowerCase() === endPoint);

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
        speakwithElevenLabs("Location not found. Please enter a valid destination.");
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
        displaytext !== "Directions still loading. Please try again."
    ) {
        speakwithElevenLabs(displaytext);
    }
});

document.getElementById("close-directions").addEventListener("click", () => {
    window.speechSynthesis.cancel();
    displayDiv.style.display = "none";

    directionText.innerText = "";
    currentSentenceIndex = 0;
    directionSentences = [];
});

// function speakText(text) {
//     const synth = window.speechSynthesis;
//     synth.cancel();

//     const voices = synth.getVoices();
//     const preferredVoiceName = "Google UK English Female"; 
//     const selectedVoice = voices.find(voice => voice.name === preferredVoiceName) || voices[0];

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.voice = selectedVoice;
//     utterance.lang = selectedVoice.lang;
//     synth.speak(utterance);
// }

async function speakwithElevenLabs(text) {

    try{
    const response = await
    fetch("https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0",{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            "xi-api-key": "sk_4bccf9c2c249525b0cee994e8c54877a556cbd01785dba95"
        },
        body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings:{
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) throw new Error("Failed to generate audio");
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    } catch(err){
        console.error("Error using ElevenLabs:", err.message);
    }
    }
