import style from './Header.module.scss';
import { IoSearchOutline } from "react-icons/io5";
import logo from '../../assets/icons/noises_transparent.svg';
import MiniButton from '../UI/MiniButton';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Context } from '../../context/Context';
import supabase from '../../config/supabaseClient';

export default function Header() {

    // получение данных с app.tsx
    const { data, localStorageData, setSearchResults } = useContext(Context)

    const navigate = useNavigate();

    // отображение поиска только для мобильных устройств
    const [showSearch, setShowSearch] = useState(false)
    const [inputValue, setInputValue] = useState('');

    const { pathname } = useLocation();
    const showBackButton = (pathname.includes('profile') || pathname.includes('settings') || pathname.includes('search')) && !showSearch;

    // закрытие поиска с пустым значением
    const closeSearch = () => {
        setInputValue('')
        setShowSearch(false)
    }

    // подтверждение значения input для поиска
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            searchMusic();
        }
    };

    // функционал поиска музыки
    const searchMusic = async () => {
        if (!inputValue.trim()) return;
    
        const { data: tracks, error } = await supabase
            .from('music_tracks')
            .select()
            .ilike('title', `%${inputValue}%`);
    
        if (error) {
            console.error(error);
        } else {
            // Добавляем имя исполнителя
            const tracksWithArtistNames = tracks.map(track => {
                const artist = data.find((user: any) => user.id === track.user_id);
                return { ...track, artist_name: artist ? artist.name : "Unknown Artist" };
            });
    
            setSearchResults(tracksWithArtistNames);
            console.log(tracksWithArtistNames);

            if(!pathname.includes('search')){
                navigate('/search');
            }
        }
    };


    return (
        <header className={style.header}>
            {showBackButton && <MiniButton sign="back" func={() => navigate(-1)} />}
            {(!showBackButton && !showSearch) && <img className={style.logo} src={logo} alt="NOISES" />}
            <div className={style.search}>
                <IoSearchOutline />
                <input className={style.inputSearch} type="text" name="search" placeholder='Search' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => handleKeyDown(e)} />
            </div>
            {!showSearch ? (
                <button className={style.searchButton} onClick={() => setShowSearch(true)}><IoSearchOutline /></button>
            ) : (
                <div className={style.searchMobile}>
                    <MiniButton sign="back" func={closeSearch} />
                    <input className={style.inputSearch} type="text" name="search" placeholder='Search' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => handleKeyDown(e)} />
                </div>
            )}
            <Link to={`/profile/${localStorageData.id}`} className={style.user}>
                <div className={style.userImage} style={{ backgroundImage: `url(${localStorageData ? localStorageData.image_url : 'https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/user_profile_images/default.png'})` }}></div>
            </Link>
        </header >
    );
}
