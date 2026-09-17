console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currentFolder = folder;
        let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                let filename = element.href.split('/').pop();
                if (filename.includes('\\')) {
                    filename = filename.split('\\').pop();
                }
                filename = decodeURIComponent(filename);
                if (filename.includes('/')) {
                    filename = filename.split('/').pop();
                }
                if (filename.includes('\\')) {
                    filename = filename.split('\\').pop();
                }
                if (filename && filename.endsWith('.mp3')) {
                    songs.push(filename);
                }
            }
        }
        if (songs.length === 0) {
            console.error("No MP3 files found in the folder");
            return [];
        }
    } catch (error) {
        console.error("Error loading songs:", error);
        return [];
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let displayName = song;
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div data-song="${song}">${displayName}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> 
                        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", element => {
            playMusic(songs[index]);
        })
    });

    return songs;
}

const playMusic = async (track, pause = false) => {
    try {
        if (!track) return;
        
        const encodedTrack = encodeURIComponent(track);
        const audioUrl = `/${currentFolder}/${encodedTrack}`;
        
        currentSong.src = audioUrl;
        
        if (!pause) {
            try {
                await currentSong.play();
                play.src = "img/pause.svg";
            } catch (playError) {
                console.error("Error playing song:", playError);
                alert("Could not play the song. Please check if the file exists.");
            }
        }
        
        document.querySelector(".songinfo").innerHTML = track;
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    } catch (error) {
        console.error("Error in playMusic:", error);
    }
}

async function displayAlbums() {
    try {
        let folders = ["cs", "ncs"]; 
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; 

        for (let folder of folders) {
            try {
                let res = await fetch(`/songs/${folder}/info.json`);
                let data = await res.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                    </div>`;
            } catch (err) {
                console.error("Error loading folder:", folder, err);
            }
        }

        // Add click listener on each card (Ye sirf yahi hona chahiye)
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                songs = await getSongs(`songs/${folder}`);
                if (songs && songs.length > 0) {
                    playMusic(songs[0]);
                }
                
                // (Optional) Mobile me card pe click karne ke baad sidebar kholne ke liye:
                // document.querySelector(".left").style.left = "0"; 
            });
        });
    } catch (error) {
        console.error("Error in displayAlbums:", error);
    }
}

async function main() {
    try {
        const songsList = await getSongs("songs/ncs");
        if (songsList && songsList.length > 0) {
            await playMusic(songsList[0], true);
        }
        await displayAlbums();
    } catch (error) {
        console.error("Error in main:", error);
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // ✨ Sidebar Fix here ✨ 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        // Resetting to empty allows the CSS to take back control on resize
        document.querySelector(".left").style.left = "-120%"; 
    });

    previous.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        currentSong.pause();
        let currentFile = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFile);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        currentSong.pause();
        let currentFile = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFile);
        if (index >= 0 && (index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => { 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();