import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import MusicList from '../../components/MusicList';
import { useContext } from 'react';
import { Context } from '../../context/Context';

interface IContent {
    showContent: string;
}

export default function MusicListPage({ showContent }: IContent) {

    // получение данных с app.tsx
    const { localStorageData, sessionStorageData, searchResults } = useContext(Context);

    // получение данных со store (musicdata.ts)
    const { 
        latest_music, 
        popular_music, 
        data 
    } = useSelector((state: RootState) => state.musicdata);

    // Получаем избранные треки пользователя
    const userFavList = data.find(user => user.id === Number(localStorageData.id))?.favorite_music || [];

    // какие данные мы должны отображать
    const getDataToShow = () => {
        switch(showContent) {
            case 'favorite': return userFavList;
            case 'listened': return sessionStorageData;
            case 'search': return searchResults;
            case 'popular': return popular_music;
            case 'latest': return latest_music;
            default: return [];
        }
    };

    const dataToShow = getDataToShow();
    const hasData = dataToShow.length > 0;

    return (
        <div className={hasData ? "content" : "noContent"}>
            {hasData && (
                <h3 className="headerText">
                    {showContent === "favorite" ? "Favorite music" :
                     showContent === "listened" ? "Listened music" :
                     showContent === "search" ? "Search results" :
                     showContent === "popular" ? "Popular music" :
                     showContent === "latest" ? "Latest music" : ""}
                </h3>
            )}
            <div className="listContent">
                {hasData ? (
                    <MusicList onList={false} sortedData={dataToShow} />
                ) : (
                    <span>There is nothing</span>
                )}
            </div>
        </div>
    );
}