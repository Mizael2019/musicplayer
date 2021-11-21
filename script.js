const musicContainer = document.getElementById("music-container");  
 const playBtn = document.getElementById("play"); 
 const prevBtn = document.getElementById("prev");  
 const nextBtn = document.getElementById("next");  
 const audio = document.getElementById("audio");  
 const progress = document.getElementById("progress");  
 const progressContainer = document.getElementById("progress-container");  
 const title = document.getElementById("title");  
 const cover = document.getElementById("cover");

 // Songs Titles  
 const songs = [
"The Last of Us", 
"MGS 3 - Snake Eater",
"Ed Sheeran-Photograph",
"BenOttewell-The Crossing",
"DaysGoneTrilha",
"Florence-StandByMe",
"LowRoar - I'll KeepComing",
"MGS V-Sins of the Father",
"SilentHill4-Waiting For You",
"SilentHill-Theme",
"Ed Sheeran-I See Fire",
"James Blunt-I'll Take Everything",
"James Blunt-Same Mistake",
"James Blunt-You",
"The Witcher-GeraltofRivia",
"Alegria",
"Amor",
"Benignidade",
"Bondade",
"CartaFiladelfia",
"OPoderdeUmNome",
"Paz",
"PazInstrumental"



]; 

 // KeepTrack of song  
 let songIndex = 0;  

 // Initially load song details into DOM  
 loadSong(songs[songIndex]); 

 // Update song details  
 function loadSong(songs) {  
  title.innerText = songs;  
  audio.src = `../music/${songs}.mp3`;  
  cover.src = `../images/${songs}.jpg`;  
 }  

 // Play Song  
 function playSong() {  
  musicContainer.classList.add("play");  
  playBtn.querySelector("i.fa").classList.remove("fa-play");  
  playBtn.querySelector("i.fa").classList.add("fa-pause");  
  audio.play();  
 }  

 // Pause Song  
 function pauseSong() {  
  musicContainer.classList.remove("play");  
  playBtn.querySelector("i.fa").classList.add("fa-play");  
  playBtn.querySelector("i.fa").classList.remove("fa-pause");  
  audio.pause();  
 }  

 // Previous Song  
 function prevSong() {  
  songIndex--;  
  if (songIndex < 0) {  
   songIndex = songs.length - 1;  
  }  
  loadSong(songs[songIndex]);  
  playSong();  
 }  

 // Next Song  
 function nextSong() {  
  songIndex++;  
  if (songIndex > songs.length - 1) {  
   songIndex = 0;  
  }  
  loadSong(songs[songIndex]);  
  playSong();  
 }  

 // Update Progress bar  
 function updateProgress(e) {  
  const { duration, currentTime } = e.srcElement;  
  const progressPerCent = (currentTime / duration) * 100;  
  progress.style.width = `${progressPerCent}%`;  
 }  

 // Set Progress  
 function setProgress(e) {  
  const width = this.clientWidth;  
  const clickX = e.offsetX;  
  const duration = audio.duration;  
  audio.currentTime = (clickX / width) * duration;  
 }  

 // Event Listeners  
 playBtn.addEventListener("click", () => {  
  const isPlaying = musicContainer.classList.contains("play");  
  if (isPlaying) {  
   pauseSong();  
  } else {  
   playSong();  
  } 
 }); 

 // Change Song  
 prevBtn.addEventListener("click", prevSong);  
 nextBtn.addEventListener("click", nextSong);  

 // Time/Song Update  
 audio.addEventListener("timeupdate", updateProgress);

 // Click On progress Bar  
 progressContainer.addEventListener("click", setProgress);  

 // Song End  
 audio.addEventListener("ended", nextSong);  