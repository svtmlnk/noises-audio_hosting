// react
import { Route, Routes, useLocation } from 'react-router-dom'

// стили
import './App.scss'

// компоненты и страницы
import Footer from './components/Footer'
import Header from './components/Header'
import ContentPage from './pages/ContentPage'
import ErrorPage from './pages/ErrorPage'
import NavMenu from './components/NavMenu'
import ArtistsListPage from './pages/ArtistsListPage'
import MusicListPage from './pages/MusicListPage'

// redux 
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './app/store'
import ProfilePage from './pages/ProfilePage'
import { Context } from './context/Context'
import PlayerApp from './components/PlayerApp'
import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import supabase from './config/supabaseClient'
import { addingData } from './features/musicdata'
import Loading from './components/Loading'
import PrivateRoute from './components/PrivateRoute'
import MenuWindow from './components/MenuWindow'
import SettingsPage from './pages/SettingsPage'
import StatisticPage from './pages/StatisticPage'

interface Song {
  title: string;
  url: string;
  progress?: number;
  length?: number;
}

interface userType {
  id: number,
  name: string,
  email: string,
  password_hash: string,
  image_url: string
}

function App() {

  // получение данных с musicData с помощью useSelector и типизации RootState
  const data = useSelector((state: RootState) => state.musicdata.data)

  const dispatch = useDispatch();

  // текущая музыка (стоит первая музыка по index)
  const [currentSong, setCurrentSong] = useState<any>({});

  // список песни, которые будет воспроизводить плеер
  const [songs, setSongs] = useState<Song[]>([]);

  // отображение плеера
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState<boolean>(false);

  // играет ли музыка
  const [isplaying, setIsPlaying] = useState<boolean>(false);

  // Состояние для поиска
  const [searchResults, setSearchResults] = useState([]);

  // Получаем текущий путь
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registration';

  // получаем данные о пользователе с локального хранилища
  const localStorageData: userType | [] = JSON.parse(localStorage.getItem('userData') || '[]');

  // создаём и получаем список недавно прослушааных треков
  const [latestMusic, setLatestMusic] = useState([])
  sessionStorage.setItem('latestMusic', JSON.stringify(latestMusic))
  const sessionStorageData: any | [] = JSON.parse(sessionStorage.getItem('latestMusic') || '[]');

  // для отображения меню
  const [showMenuWindow, setShowMenuWindow] = useState(false)

  // отображение различного контекстного меню
  const [showLibraryWin, setShowLibraryWin] = useState(false)
  const [showUploadMusicWin, setShowUploadMusicWin] = useState(false)
  const [showCustomAccWin, setShowCustomAccWin] = useState(false)

  // Получение всех данных с таблиц базы данных Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, artistsRes, musicRes, tracksRes] = await Promise.all([
          supabase.from('users').select(),
          supabase.from('favorite_artists').select(),
          supabase.from('favorite_music').select(),
          supabase.from('music_tracks').select(),
        ]);

        if (usersRes.error || artistsRes.error || musicRes.error || tracksRes.error) {
          console.error(usersRes.error || artistsRes.error || musicRes.error || tracksRes.error);
          return;
        }

        const users = usersRes.data;
        const favoriteArtists = artistsRes.data;
        const favoriteMusic = musicRes.data;
        const musicTracks = tracksRes.data;

        // Подсчет количества отслеживаний для музыки
        const musicTrackCounts = favoriteMusic.reduce((acc: any, fav: any) => {
          acc[fav.music_id] = (acc[fav.music_id] || 0) + 1;
          return acc;
        }, {});

        // Подсчет количества отслеживаний для исполнителей
        const artistCounts = favoriteArtists.reduce((acc: any, fav: any) => {
          acc[fav.artist_id] = (acc[fav.artist_id] || 0) + 1;
          return acc;
        }, {});

        // Добавление количества отслеживаний в каждый трек
        const musicTracksWithArtistName = musicTracks.map(track => {
          const artist = users.find(user => user.id === track.user_id);
          return {
            ...track,
            artist_name: artist ? artist.name : "Unknown Artist",
            favorite_count: musicTrackCounts[track.id] || 0,
          };
        });

        // Добавление количества отслеживаний в каждого исполнителя
        const usersWithFavoriteCount = users.map(user => ({
          ...user,
          favorite_count: artistCounts[user.id] || 0,
        }));

        // Обработка структуры данных
        const supabaseData = usersWithFavoriteCount.map(user => {
          const userMusicTracks = musicTracksWithArtistName.filter(track => track.user_id === user.id);
          const userFavoriteMusic = favoriteMusic
            .filter(fav => fav.user_id === user.id)
            .map(fav => musicTracksWithArtistName.find(track => track.id === fav.music_id));
          const userFavoriteArtists = favoriteArtists
            .filter(fav => fav.user_id === user.id)
            .map(fav => usersWithFavoriteCount.find(artist => artist.id === fav.artist_id));

          return {
            ...user,
            music_tracks: userMusicTracks,
            favorite_music: userFavoriteMusic,
            favorite_artists: userFavoriteArtists,
          };
        });

        dispatch(addingData(supabaseData));
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // Эффект для управления overflow: hidden (нужен для того, чтобы пользователь не мог листать страницу с отображаемым окном)
  useEffect(() => {
    if (showMenuWindow) {
      document.body.style.overflow = 'hidden'; // Блокируем прокрутку
    } else {
      document.body.style.overflow = ''; // Возвращаем прокрутку
    }

    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMenuWindow]); // Зависимость от showMenuWindow

  return (
    <Context.Provider value={{ data, localStorageData, currentSong, setCurrentSong, showPlayer, setShowPlayer, showMiniPlayer, setShowMiniPlayer, songs, setSongs, isplaying, setIsPlaying, showMenuWindow, setShowMenuWindow, showLibraryWin, setShowLibraryWin, showUploadMusicWin, setShowUploadMusicWin, showCustomAccWin, setShowCustomAccWin, latestMusic, setLatestMusic, sessionStorageData, searchResults, setSearchResults }}>
      <div className="app">
        <MenuWindow />
        {!isAuthPage && <NavMenu />}
        <div className="container">
          {!isAuthPage && <Header />}
          {(!data || data.length <= 0) && !isAuthPage ? (<Loading />) : (
            <Routes>
              <Route path='/login' element={<AuthPage />} />
              <Route path='/registration' element={<AuthPage />} />

              <Route element={<PrivateRoute />}>
                <Route path='/' element={<ContentPage data={data} type={'home'} />} />
                <Route path='/explore' element={<ContentPage data={data} type={'explore'} />} />
                <Route path='/profile/:id' element={<ProfilePage />} />

                {/* список музыки */}
                <Route path='/musics/favorite' element={<MusicListPage showContent={'favorite'} />} />
                <Route path='/musics/popular' element={<MusicListPage showContent={'popular'} />} />
                <Route path='/musics/latest' element={<MusicListPage showContent={'latest'} />} />
                <Route path='/musics/listened' element={<MusicListPage showContent={'listened'} />} />

                {/* список исполнителей */}
                <Route path='/artists/favorite' element={<ArtistsListPage showContent={'favorite'} />} />
                <Route path='/artists/latest' element={<ArtistsListPage showContent={'latest'} />} />
                <Route path='/artists/popular' element={<ArtistsListPage showContent={'popular'} />} />


                <Route path='/search' element={<MusicListPage showContent={'search'} />} />
                <Route path='/settings' element={<SettingsPage />} />
                <Route path='/settings/statistic' element={<StatisticPage />} />
                <Route path='*' element={<ErrorPage />} />
              </Route>
            </Routes>
          )}
          <PlayerApp data={data} />
          {!isAuthPage && <Footer />}
        </div>
      </div>
    </Context.Provider>
  )
}

export default App
