import { createContext } from "react";

// UPD 29/08.2026: It's my worst decistion of writing context like this. I could rewrite context in normal view, but i've decided do not change anything in this project for correctly working (if i want to run database again)
type contextData = {
    data: any;
    localStorageData: any;

    currentSong: any;
    setCurrentSong: any;

    showPlayer: boolean; 
    setShowPlayer: any; 
    showMiniPlayer: boolean; 
    setShowMiniPlayer: any;

    songs: any;
    setSongs: any;

    isplaying: boolean;
    setIsPlaying: any;

    showMenuWindow: boolean;
    setShowMenuWindow: any;
    showLibraryWin: boolean;
    setShowLibraryWin: any;
    showUploadMusicWin: boolean;
    setShowUploadMusicWin: any;
    showCustomAccWin: boolean; 
    setShowCustomAccWin: any;

    latestMusic: any;
    setLatestMusic: any;

    sessionStorageData: any;

    searchResults: any;
    setSearchResults: any;
}

export const Context = createContext<contextData>({ 
    data: [], localStorageData: {}, 
    
    currentSong: {}, setCurrentSong: {}, 
    
    showPlayer: false, setShowPlayer: {}, showMiniPlayer: false, setShowMiniPlayer: {}, 
    
    songs: [], setSongs: {}, 

    isplaying: false, setIsPlaying: {},
    
    showMenuWindow: false, setShowMenuWindow: {}, showLibraryWin: false, setShowLibraryWin: {}, showUploadMusicWin: false, setShowUploadMusicWin: {}, showCustomAccWin: false, setShowCustomAccWin: {}, 
    
    latestMusic: [], setLatestMusic: {}, 
    
    sessionStorageData: [], 
    
    searchResults: '', setSearchResults: {}
});