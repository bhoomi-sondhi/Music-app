import React, { useState, useEffect, useRef } from "react";

export default function SpotifyClone() {
  const [songs, setSongs] = useState([]);
  const [library, setLibrary] = useState([]);
  const [viewLibrary, setViewLibrary] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch("/songs.json")
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error("Error loading songs:", err));
  }, []);

  useEffect(() => {
    const savedLibrary = localStorage.getItem("library");
    if (savedLibrary) setLibrary(JSON.parse(savedLibrary));
  }, []);

  useEffect(() => {
    localStorage.setItem("library", JSON.stringify(library));
  }, [library]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const playSong = (song) => {
    const src = `/songs/${song.file}`;
    setCurrentSong({ ...song, src });
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 200);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const percent =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(percent || 0);
  };

  const handleSeek = (e) => {
    const value = e.target.value;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (duration * value) / 100;
    setProgress(value);
  };

  const toggleLibrary = (song) => {
    const exists = library.find((s) => s.file === song.file);
    if (exists) {
      setLibrary(library.filter((s) => s.file !== song.file));
    } else {
      setLibrary([...library, song]);
    }
  };

  const displayedSongs = viewLibrary ? library : songs;

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      {/* 🟢 Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-black flex flex-col justify-between p-4 transform transition-transform duration-300 z-30 ${
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-6">
            <img
              className="w-10 h-10"
              src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify Logo"
            />
            <h1 className="text-2xl font-bold">Spotify</h1>
          </div>

          {/* Menu */}
          <ul className="space-y-4">
            <li
              onClick={() => {
                setViewLibrary(false);
                setShowSidebar(false);
              }}
              className={`flex items-center space-x-3 cursor-pointer ${
                !viewLibrary ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              <span>🏠</span>
              <span>Home</span>
            </li>

            <li
              onClick={() => {
                setViewLibrary(true);
                setShowSidebar(false);
              }}
              className={`flex items-center space-x-3 cursor-pointer ${
                viewLibrary ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              <span>❤️</span>
              <span>Your Library</span>
            </li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 space-y-1 mt-6">
          <p>Legal</p>
          <p>Privacy Center</p>
          <p>Cookies</p>
          <p>About Us</p>
          <p>Accessibility</p>
        </div>
      </div>

      {/* 🟡 Overlay (Mobile) */}
      {showSidebar && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden"
        ></div>
      )}

      {/* 🟣 Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-[#181818] sticky top-0 z-10">
          {/* 🍔 Hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden flex flex-col justify-between w-8 h-6 focus:outline-none group"
          >
            <span
              className={`block h-1 bg-white rounded transition-all duration-300 ${
                showSidebar ? "rotate-45 translate-y-2.5" : ""
              }`}
            ></span>
            <span
              className={`block h-1 bg-white rounded transition-all duration-300 ${
                showSidebar ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block h-1 bg-white rounded transition-all duration-300 ${
                showSidebar ? "-rotate-45 -translate-y-2.5" : ""
              }`}
            ></span>
          </button>

          <div className="space-x-3">
            <button className="text-gray-300 font-semibold hover:text-white">
              Sign up
            </button>
            <button className="bg-white text-black px-4 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Log in
            </button>
          </div>
        </div>

        {/* Songs Section */}
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold mb-6">
            {viewLibrary ? "Your Library" : "All Songs"}
          </h2>

          {displayedSongs.length === 0 ? (
            <p className="text-gray-400 text-center mt-20">
              {viewLibrary
                ? "No songs in your library yet 💿"
                : "No songs found."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedSongs.map((song, index) => {
                const isLiked = library.find((s) => s.file === song.file);
                return (
                  <div
                    key={index}
                    className="relative bg-[#181818] p-3 rounded-xl hover:bg-[#282828] transition-all duration-300 flex flex-col items-center group"
                  >
                    {/* Song Thumbnail */}
                    <div className="relative w-full overflow-hidden rounded-xl mb-3">
                      <img
                        onClick={() => playSong(song)}
                        className="rounded-xl w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        src={song.img}
                        alt={song.title}
                      />

                      {/* Smaller, clean play button */}
                      <button
                        onClick={() => playSong(song)}
                        className="absolute bottom-2 right-2 bg-green-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="black"
                          className="w-5 h-5"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>

                    {/* Title & Artist */}
                    <h3 className="font-semibold truncate text-center">
                      {song.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate text-center">
                      {song.artist}
                    </p>

                    {/* Add to Library */}
                    <button
                      onClick={() => toggleLibrary(song)}
                      className={`mt-3 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        isLiked
                          ? "bg-[#1DB954] text-black hover:bg-[#1ed760]"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {isLiked ? "Added" : "Add to Library"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🎧 Player Modal */}
      {currentSong && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-b from-[#1e1e1e] to-[#121212] w-[85%] sm:w-[70%] md:w-[50%] rounded-3xl shadow-2xl p-8 flex flex-col items-center relative text-center">
            <button
              onClick={() => {
                audioRef.current.pause();
                setIsPlaying(false);
                setCurrentSong(null);
              }}
              className="absolute top-5 right-6 text-gray-400 hover:text-white text-2xl"
            >
              ✖
            </button>

            <img
              src={currentSong.img}
              alt={currentSong.title}
              className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl object-cover mb-8 mt-10 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
            />

            <h2 className="text-3xl sm:text-4xl font-bold mb-1">
              {currentSong.title}
            </h2>
            <p className="text-gray-400 text-lg mb-8">{currentSong.artist}</p>

            <input
              type="range"
              value={progress}
              onChange={handleSeek}
              className="w-3/4 accent-green-500 mb-6 cursor-pointer"
            />

            <div className="flex items-center justify-center space-x-10 sm:space-x-14">
              <span className="text-gray-300 text-2xl sm:text-3xl cursor-pointer hover:scale-110 transition-transform">
                ⏮
              </span>

              <button
                onClick={togglePlay}
                className="bg-green-500 text-black p-5 sm:p-6 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <span className="text-gray-300 text-2xl sm:text-3xl cursor-pointer hover:scale-110 transition-transform">
                ⏭
              </span>
            </div>

            <audio
              ref={audioRef}
              src={currentSong.src}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}





