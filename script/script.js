console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currentFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


// ===============================
// GET SONGS FROM GITHUB
// ===============================
async function getSongs(folder) {
    try {
        currentFolder = folder;

        // GitHub API se folder ki files lena
        const apiUrl =
            `https://api.github.com/repos/jasminvansh11/spotify-clone/contents/${folder}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const files = await response.json();

        // Sirf MP3 files
        songs = files
            .filter(file =>
                file.type === "file" &&
                file.name.toLowerCase().endsWith(".mp3")
            )
            .map(file => file.name);

        console.log("Songs found:", songs);

        if (songs.length === 0) {
            console.error("No MP3 files found in:", folder);
            return [];
        }

        // ===============================
        // SHOW SONGS IN PLAYLIST
        // ===============================

        const songUL = document
            .querySelector(".songList")
            .getElementsByTagName("ul")[0];

        songUL.innerHTML = "";

        for (const song of songs) {

            songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="img/music.svg" alt="">

                    <div class="info">
                        <div data-song="${song}">${song}</div>
                        <div>Harry</div>
                    </div>

                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>
            `;
        }

        // ===============================
        // SONG CLICK
        // ===============================

        Array.from(
            document.querySelector(".songList").getElementsByTagName("li")
        ).forEach((element, index) => {

            element.addEventListener("click", () => {
                playMusic(songs[index]);
            });

        });

        return songs;

    } catch (error) {

        console.error("Error loading songs:", error);

        return [];
    }
}


// ===============================
// PLAY MUSIC
// ===============================

const playMusic = async (track, pause = false) => {

    try {

        if (!track) return;

        const encodedTrack = encodeURIComponent(track);

        // GitHub Pages URL
        const audioUrl =
            `https://jasminvansh11.github.io/spotify-clone/${currentFolder}/${encodedTrack}`;

        console.log("Playing:", audioUrl);

        currentSong.src = audioUrl;

        if (!pause) {

            try {

                await currentSong.play();

                play.src = "img/pause.svg";

            } catch (playError) {

                console.error("Error playing song:", playError);

            }
        }

        document.querySelector(".songinfo").innerHTML = track;
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    } catch (error) {

        console.error("Error in playMusic:", error);

    }
};


// ===============================
// DISPLAY ALBUMS
// ===============================

async function displayAlbums() {

    try {

        const folders = ["cs", "ncs"];

        const cardContainer =
            document.querySelector(".cardContainer");

        cardContainer.innerHTML = "";

        for (let folder of folders) {

            try {

                // GitHub Pages par info.json
                const infoUrl =
                    `https://jasminvansh11.github.io/spotify-clone/songs/${folder}/info.json`;

                const res = await fetch(infoUrl);

                if (!res.ok) {
                    throw new Error(`info.json not found: ${res.status}`);
                }

                const data = await res.json();

                cardContainer.innerHTML += `
                    <div data-folder="songs/${folder}" class="card">

                        <div class="play">

                            <svg width="16" height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">

                                <path
                                    d="M5 20V4L19 12L5 20Z"
                                    stroke="#141B34"
                                    fill="#000"
                                    stroke-width="1.5"
                                    stroke-linejoin="round"
                                />

                            </svg>

                        </div>

                        <img
                            src="songs/${folder}/cover.jpeg"
                            alt="${data.title}"
                        >

                        <h2>${data.title}</h2>

                        <p>${data.description}</p>

                    </div>
                `;

            } catch (err) {

                console.error(
                    "Error loading folder:",
                    folder,
                    err
                );

            }
        }


        // ===============================
        // ALBUM CLICK
        // ===============================

        Array.from(
            document.getElementsByClassName("card")
        ).forEach(card => {

            card.addEventListener("click", async () => {

                const folder =
                    card.dataset.folder;

                songs = await getSongs(folder);

                if (songs.length > 0) {
                    playMusic(songs[0]);
                }

            });

        });

    } catch (error) {

        console.error("Error in displayAlbums:", error);

    }
}


// ===============================
// MAIN
// ===============================

async function main() {

    try {

        // Default NCS playlist
        const songsList =
            await getSongs("songs/ncs");

        if (songsList.length > 0) {

            await playMusic(
                songsList[0],
                true
            );

        }

        await displayAlbums();

    } catch (error) {

        console.error("Error in main:", error);

    }


    // ===============================
    // PLAY / PAUSE
    // ===============================

    play.addEventListener("click", () => {

        if (currentSong.paused) {

            currentSong.play();
            play.src = "img/pause.svg";

        } else {

            currentSong.pause();
            play.src = "img/play.svg";

        }

    });


    // ===============================
    // TIME UPDATE
    // ===============================

    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}
             /
             ${secondsToMinutesSeconds(currentSong.duration)}`;

        if (currentSong.duration) {

            document.querySelector(".circle").style.left =
                (currentSong.currentTime /
                currentSong.duration) * 100 + "%";

        }

    });


    // ===============================
    // SEEKBAR
    // ===============================

    document.querySelector(".seekbar")
        .addEventListener("click", e => {

            const percent =
                (e.offsetX /
                e.target.getBoundingClientRect().width) * 100;

            document.querySelector(".circle").style.left =
                percent + "%";

            if (currentSong.duration) {

                currentSong.currentTime =
                    (currentSong.duration * percent) / 100;

            }

        });


    // ===============================
    // HAMBURGER
    // ===============================

    document.querySelector(".hamburger")
        .addEventListener("click", () => {

            document.querySelector(".left").style.left = "0";

        });


    // ===============================
    // CLOSE
    // ===============================

    document.querySelector(".close")
        .addEventListener("click", () => {

            document.querySelector(".left").style.left = "-120%";

        });


    // ===============================
    // PREVIOUS
    // ===============================

    previous.addEventListener("click", () => {

        if (!songs || songs.length === 0) return;

        currentSong.pause();

        const currentFile =
            decodeURIComponent(
                currentSong.src.split("/").pop()
            );

        const index =
            songs.indexOf(currentFile);

        if (index > 0) {

            playMusic(
                songs[index - 1]
            );

        }

    });


    // ===============================
    // NEXT
    // ===============================

    next.addEventListener("click", () => {

        if (!songs || songs.length === 0) return;

        currentSong.pause();

        const currentFile =
            decodeURIComponent(
                currentSong.src.split("/").pop()
            );

        const index =
            songs.indexOf(currentFile);

        if (
            index >= 0 &&
            index + 1 < songs.length
        ) {

            playMusic(
                songs[index + 1]
            );

        }

    });


    // ===============================
    // VOLUME
    // ===============================

    document.querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", e => {

            currentSong.volume =
                parseInt(e.target.value) / 100;

            if (currentSong.volume > 0) {

                document.querySelector(".volume>img").src =
                    document.querySelector(".volume>img").src
                    .replace("mute.svg", "volume.svg");

            }

        });


    // ===============================
    // MUTE
    // ===============================

    document.querySelector(".volume>img")
        .addEventListener("click", e => {

            if (e.target.src.includes("volume.svg")) {

                e.target.src =
                    e.target.src.replace(
                        "volume.svg",
                        "mute.svg"
                    );

                currentSong.volume = 0;

                document.querySelector(".range")
                    .getElementsByTagName("input")[0]
                    .value = 0;

            } else {

                e.target.src =
                    e.target.src.replace(
                        "mute.svg",
                        "volume.svg"
                    );

                currentSong.volume = 0.10;

                document.querySelector(".range")
                    .getElementsByTagName("input")[0]
                    .value = 10;

            }

        });

}


// START
main();
