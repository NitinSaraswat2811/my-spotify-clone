
// Declare the necessary variables
let songs = [];
let currentAudio = null;
let currentButton = null;
let currentFolder = null;
let currentIndex = -1;

// Call this function whenever the folder is updated
/*function resetCurrentSongState() {
    currentAudio = null;
    currentIndex = null;
    currentButton = null;
}*/

// Function to extract the song name with extension
function extractSongNameWithExtension(fullName) {
    const parts = fullName.split(".");
    const fileName = parts[0];
    return `${fileName}.mp3`;
}
// Function to fetch songs from a folder
async function fetchSongsFromFolder(folderName) {
    try {
        console.log("Fetching songs from folder:", folderName);
        let response = await fetch(`./ProjectSongs/${folderName}/`);
        if (response.ok) {
            let htmlContent = await response.text();
            let div = document.createElement("div");
            div.innerHTML = htmlContent;

            songs = []; // Clear previous songs
            let as = div.getElementsByTagName("a");
            Array.from(as).forEach((element) => {
                if (element.href.endsWith(".mp3")) {
                    let songName = extractSongNameWithExtension(element.innerText.trim());
                    songs.push({
                        name: songName,
                        file: element.href,
                    });
                }
            });

            // Update the current folder
            currentFolder = folderName;
            currentIndex = null; // Reset the current index
            updateSongList();

            // Automatically display the first song's info
            if (songs.length > 0) {
                displaySongInfo(0); // Display info for the first song
            }
        } else {
            console.error("Fetch failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error in fetchSongsFromFolder:", error);
    }
}

// Function to update the song list in the UI
function updateSongList() {
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = ""; // Clear existing list
    songs.forEach((song, index) => {
        songUL.innerHTML += `<li>
            <img class="invert" src="music.svg" alt="" />
            <div class="info">
                <div>${song.name}</div>
                <div>Nitin</div>
            </div>
            <div class="playnow">
              <div class="play-button" data-index="${index}">
                <img src="playsong.svg" alt="Play" />
              </div>
            </div>
        </li>`;
    });

    // Reassign event listeners to play buttons
    Array.from(document.querySelectorAll(".play-button")).forEach((button) => {
        button.addEventListener("click", () => {
            let songIndex = parseInt(button.dataset.index);
      if (currentIndex === songIndex && currentFolder === currentFolder) {
            togglePlayPause(button);
            } else {
                playMusic(songIndex, button);
            }
        });
    });
}

// Function to display song info
function displaySongInfo(index) {
    let songInfoDiv = document.querySelector(".songInfo"); // Adjust selector as needed
    songInfoDiv.innerHTML = `
        <div class="song">Song:${songs[index].name}</div>`
         //<div classs="Folder">Folder: ${currentFolder}</div>
    ;
}

// Function to play music
function playMusic(index, button) {
    currentIndex = index;
    console.log(`Playing song ${songs[index].name} from folder ${currentFolder}`);
    // Add your audio play logic here
    displaySongInfo(index);
}
document.addEventListener("DOMContentLoaded", () => {
    // Display the first folder's songs by default
    let firstCard = document.querySelector(".card");
    if (firstCard) {
        let defaultFolderName = firstCard.querySelector("h3").innerText.trim().replace(/\s+/g, "");
        fetchSongsFromFolder(defaultFolderName);
    }})

// Add event listeners to cards
document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
        let folderName = card.querySelector("h3").innerText.trim().replace(/\s+/g, "");
        fetchSongsFromFolder(folderName); // Fetch songs from the folder named after the <h3> text
        // Assuming newSongList contains songs from the new folder
    
    });
});


// Utility to get the central play button (inside the span)
function getCentralPlayButton() {
    return document.querySelector(".songbtn .playbtn img");
}

// Event listeners for central buttons
document.querySelector(".songbtn img[src='prevsong.svg']").addEventListener("click", () => {
    if (currentIndex > 0) {
        playMusic(currentIndex - 1, getButtonForIndex(currentIndex - 1));
    }
});

document.querySelector(".songbtn img[src='nextsong.svg']").addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
        playMusic(currentIndex + 1, getButtonForIndex(currentIndex + 1));
    }
});

document.querySelector(".songbtn .playbtn").addEventListener("click", () => {
    const centralPlayButton = getCentralPlayButton();
    if (currentAudio) {
        togglePlayPause(currentButton); // Use the current button's state
    } else if (songs.length > 0) {
        playMusic(0, getButtonForIndex(0)); // Play the first song if no audio is playing
    }
});
function playMusic(index, button) {
            if (currentAudio) {
                currentAudio.pause();
                changeButtonToPlay(currentButton);
            }
        
            currentIndex = index;
            currentAudio = new Audio(songs[index].file);
            currentAudio.play();
        
            currentButton = button;
            changeButtonToPause(button);
        
            // Update central play button
            changeButtonToPause(getCentralPlayButton().closest(".playbtn"));
        
            // Update song info and time
            const songInfoElement = document.querySelector(".songInfo");
            const songTimeElement = document.querySelector(".songTime");
        
            if (songInfoElement) {
                songInfoElement.innerHTML = songs[index].name;
        
                if (songTimeElement) {
                    currentAudio.addEventListener("timeupdate", () => {
                        const currentTime = currentAudio.currentTime;
                        const duration = currentAudio.duration;
        
                        if (duration) {
                            const percentage = (currentTime / duration) * 100;
        
                            // Update circle position
                            const circle = document.querySelector(".circle");
                            if (circle) {
                                circle.style.left = `${percentage}%`;
                            }
        
                            // Update seek bar background
                            const seekBar = document.querySelector(".seekbar");
                            if (seekBar) {
                                seekBar.style.background = `linear-gradient(to right, #333 ${percentage}%, #ddd ${percentage}%)`;
                            }
        
                            // Update song time
                            const formattedCurrentTime = formatTime(currentTime);
                            const formattedDuration = formatTime(duration);
                            songTimeElement.innerHTML = `${formattedCurrentTime} / ${formattedDuration}`;
                        }
                    });
                }
            }
        
            // Reset button state on song end
            currentAudio.addEventListener("ended", () => {
                changeButtonToPlay(button);
                changeButtonToPlay(getCentralPlayButton().closest(".playbtn"));
        
                // Reset the seek bar and circle
                const circle = document.querySelector(".circle");
                const seekBar = document.querySelector(".seekbar");
        
                if (circle) circle.style.left = `0%`;
                if (seekBar) seekBar.style.background = `linear-gradient(to right, #ddd 0%, #ddd 100%)`;
            });
        
            // Add seek bar click listener
            const seekBar = document.querySelector(".seekbar");
            if (seekBar) {
                seekBar.addEventListener("click", (e) => {
                    const rect = seekBar.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left; // Distance clicked from the left of the seek bar
                    const seekBarWidth = rect.width;
        
                    const newTime = (offsetX / seekBarWidth) * currentAudio.duration;
                    currentAudio.currentTime = newTime;
        
                    // Update the circle and seek bar instantly
                    const percentage = (newTime / currentAudio.duration) * 100;
                    const circle = document.querySelector(".circle");
                    if (circle) circle.style.left = `${percentage}%`;
        
                    if (seekBar) {
                        seekBar.style.background = `linear-gradient(to right, #333 ${percentage}%, #ddd ${percentage}%)`;
                    }
                });
            }
        }
        // Utility function to format time in minutes:seconds
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
            return `${mins}:${secs}`;
        }
// Function to toggle play/pause for the current song
function togglePlayPause(button) {
    const centralPlayButton = getCentralPlayButton();
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
            changeButtonToPause(button);
            changeButtonToPause(centralPlayButton.closest(".playbtn"));
        } else {
            currentAudio.pause();
            changeButtonToPlay(button);
            changeButtonToPlay(centralPlayButton.closest(".playbtn"));
        }
    }
}

// Function to change the button to play icon
function changeButtonToPlay(button) {
    const img = button.querySelector("img");
    img.src = "playsong.svg";
    button.classList.remove("invert");
}

// Function to change the button to pause icon
function changeButtonToPause(button) {
    const img = button.querySelector("img");
    img.src = "pause.svg";
    if(button.closest(".left")){
    button.classList.add("invert");
    }
}

// Utility to get the play button for a specific index
function getButtonForIndex(index) {
    return document.querySelector(`.play-button[data-index="${index}"]`);
}

// Call the function to fetch songs and initialize the player
fetchSongsFromFolder();
// Volume Bar Setup
const volumeBar = document.querySelector(".volumebar");
const volumeCircle = document.querySelector(".volume-circle");

if (volumeBar) {
    volumeBar.addEventListener("click", (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left; // Distance clicked from the left of the volume bar
        const volumeBarWidth = rect.width;

        const newVolume = Math.min(Math.max(offsetX / volumeBarWidth, 0), 1); // Clamp between 0 and 1
        if (currentAudio) {
            currentAudio.volume = newVolume; // Set the volume
        }

        // Update the circle position
        if (volumeCircle) {
            volumeCircle.style.left = `${newVolume * 100}%`;
        }

        // Optionally update the visual background
        volumeBar.style.background = `linear-gradient(to right, #333 ${newVolume * 100}%, #646462 ${newVolume * 100}%)`;
    });
}

// Default volume setup
if (currentAudio) {
    currentAudio.volume = 0.5; // Set the default volume to 50%
    if (volumeCircle) {
        volumeCircle.style.left = "50%"; // Sync the circle position
    }
}
// Select the hamburger icon and the left section
const hamburgerIcon = document.querySelector('.hamburger-icon');
const leftSection = document.querySelector('.left');

// Add an event listener to toggle the menu visibility
hamburgerIcon.addEventListener('click', () => {
    leftSection.classList.toggle('show');
});
const CrossIcon = document.querySelector('.cross');
CrossIcon.addEventListener('click',()=>{
    leftSection.classList.remove('show');
})

// Declare the necessary variables
/*let songs = [];
let currentAudio = null;
let currentButton = null;
let currentIndex = -1;

// Function to extract the song name with extension
function extractSongNameWithExtension(fullName) {
    const parts = fullName.split(".");
    const fileName = parts[0];
    return `${fileName}.mp3`;
}

// Fetch and load songs
async function fetchSongs() {
    try {
        let response = await fetch("./ProjectSongs/");
        if (response.ok) {
            let htmlContent = await response.text();
            let div = document.createElement("div");
            div.innerHTML = htmlContent;

            let as = div.getElementsByTagName("a");
            Array.from(as).forEach((element) => {
                if (element.href.endsWith(".mp3")) {
                    let songName = extractSongNameWithExtension(element.innerText.trim());
                    songs.push({
                        name: songName,
                        file: element.href,
                    });
                }
            });

            let songUL = document.querySelector(".songlist ul");
            songUL.innerHTML = "";
            songs.forEach((song, index) => {
                songUL.innerHTML += `<li>
                    <img class="invert" src="music.svg" alt="" />
                    <div class="info">
                        <div>${extractSongNameWithExtension(song.name)}</div>
                        <div>Nitin</div>
                    </div>
                    <div class="playnow">
                      <div class="play-button" data-index="${index}">
                        <img src="playsong.svg" alt="Play" />
                      </div>
                    </div>
                </li>`;
            });

            // Add event listeners to play buttons
            Array.from(document.querySelectorAll(".play-button")).forEach((button) => {
                button.addEventListener("click", () => {
                    let songIndex = parseInt(button.dataset.index);
                    if (currentIndex === songIndex) {
                        togglePlayPause(button);
                    } else {
                        playMusic(songIndex, button);
                    }
                });
            });
        } else {
            console.error("Fetch failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error in fetchSongs:", error);
    }
}

// Utility to get the central play button (inside the span)
function getCentralPlayButton() {
    return document.querySelector(".songbtn .playbtn img");
}

// Event listeners for central buttons
document.querySelector(".songbtn img[src='prevsong.svg']").addEventListener("click", () => {
    if (currentIndex > 0) {
        playMusic(currentIndex - 1, getButtonForIndex(currentIndex - 1));
    }
});

document.querySelector(".songbtn img[src='nextsong.svg']").addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
        playMusic(currentIndex + 1, getButtonForIndex(currentIndex + 1));
    }
});

document.querySelector(".songbtn .playbtn").addEventListener("click", () => {
    const centralPlayButton = getCentralPlayButton();
    if (currentAudio) {
        togglePlayPause(currentButton); // Use the current button's state
    } else if (songs.length > 0) {
        playMusic(0, getButtonForIndex(0)); // Play the first song if no audio is playing
    }
});

// Function to play music and update button state
function playMusic(index, button) {
    // Pause the current playing audio and reset its button state
    if (currentAudio) {
        currentAudio.pause();
        changeButtonToPlay(currentButton);
    }

    // Update the current song and button
    currentIndex = index;
    currentAudio = new Audio(songs[index].file);
    currentAudio.play();

    currentButton = button;
    changeButtonToPause(button);

    // Update the left and right buttons with 'invert' logic
    updateButtonStates(button);

    // Display song info (ensure elements exist before modifying)
    const songInfoElement = document.querySelector(".songinfo");
    if (songInfoElement) {
        songInfoElement.innerHTML = songs[index].name;
    }

    // Reset the button when the song ends
    currentAudio.addEventListener("ended", () => {
        changeButtonToPlay(button);
        resetButtonStates();
    });
}

// Utility to format time as mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}


// Function to toggle play/pause for the current song
function togglePlayPause(button) {
    const centralPlayButton = getCentralPlayButton();
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
            changeButtonToPause(button);
            changeButtonToPause(centralPlayButton.closest(".playbtn"));
        } else {
            currentAudio.pause();
            changeButtonToPlay(button);
            changeButtonToPlay(centralPlayButton.closest(".playbtn"));
        }
    }
}
// Function to change the button to pause icon and add 'invert' class
function changeButtonToPlay(button) {
    if (!button) return;
    const img = button.querySelector("img");
    if (img) img.src = "playsong.svg";
    button.classList.remove("invert");
}

function changeButtonToPause(button) {
    if (!button) return;
    const img = button.querySelector("img");
    if (img) img.src = "pause.svg";
    button.classList.add("invert");
}

function updateButtonStates(activeButton) {
    // Handle the left section: Ensure `invert` is added to pause button
    const leftSectionButton = document.querySelector(".left .playbtn");
    if (leftSectionButton && leftSectionButton !== activeButton) {
        leftSectionButton.classList.add("invert");
    }

    // Handle the right section: Remove `invert` from play buttons
    const rightSectionButtons = document.querySelectorAll(".right .playbtn");
    rightSectionButtons.forEach((btn) => {
        if (btn !== activeButton) {
            btn.classList.remove("invert");
        }
    });
}

function resetButtonStates() {
    const leftSectionButton = document.querySelector(".left .playbtn");
    const rightSectionButtons = document.querySelectorAll(".right .playbtn");

    if (leftSectionButton) leftSectionButton.classList.remove("invert");
    rightSectionButtons.forEach((btn) => btn.classList.remove("invert"));
}


// Utility to get the play button for a specific index
function getButtonForIndex(index) {
    return document.querySelector(`.play-button[data-index="${index}"]`);
}

// Call the function to fetch songs and initialize the player
fetchSongs();*/
// Declare the necessary variables
// Declare the necessary variables
