import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import PerformerList from '../../components/PerformersList';
import { useContext } from 'react';
import { Context } from '../../context/Context';

interface IContent {
    showContent: string;
}

export default function ArtistsListPage({ showContent }: IContent) {
    const {
        latest_artists,
        popular_artists,
        data
    } = useSelector((state: RootState) => state.musicdata);

    const { localStorageData } = useContext(Context);

    // Получаем избранных артистов пользователя
    const userFavArtists = data.find(user => user.id === Number(localStorageData.id))?.favorite_artists || [];

    // какие данные мы должны отображать
    const getDataToShow = () => {
        switch (showContent) {
            case 'favorite': return userFavArtists;
            case 'popular': return popular_artists;
            case 'latest': return latest_artists;
            default: return [];
        }
    };

    const dataToShow = getDataToShow();
    const hasData = dataToShow.length > 0;

    return (
        <div className={hasData ? "content" : "noContent"}>
            {hasData && (
                <h3 className="headerText">
                    {showContent === "favorite" ? "Favorite artists" :
                        showContent === "popular" ? "Popular artists" :
                            showContent === "latest" ? "Latest artists" : ""}
                </h3>
            )}
            <div className="listContent">
                {hasData ? (
                    <PerformerList onList={false} sortedData={dataToShow} />
                ) : (
                    <span>There is nothing</span>
                )}
            </div>
        </div>
    );
}