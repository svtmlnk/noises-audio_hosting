import { useNavigate } from "react-router-dom";
import MiniButton from "../../components/UI/MiniButton";
import { useContext, useEffect, useState, useMemo } from "react";
import { Context } from "../../context/Context";
import supabase from "../../config/supabaseClient";
import Loading from "../../components/Loading";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

export default function StatisticPage() {
    const { localStorageData } = useContext(Context);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // паолучаем все данные с redux store 
    const data = useSelector((state: RootState) => state.musicdata.data);

    useEffect(() => {
        setIsLoading(true);

        const getUserInfo = async () => {
            const { data, error } = await supabase
                .from('users')
                .select()
                .eq('id', localStorageData.id)
                .single();

            if (error) {
                console.error(error);
                setIsLoading(false);
                return;
            }

            if (data) {
                setUserInfo(data);
                setIsLoading(false);
            }
        };

        getUserInfo();
    }, [localStorageData.id]);

    // Поиск текущего пользователя в store
    const storeUser = useMemo(() => {
        return data.find((user: any) => user.id === localStorageData.id);
    }, [data, localStorageData.id]);

    // Определяем любимый жанр
    const favoriteGenre = useMemo(() => {
        if (!storeUser?.music_tracks?.length) return "No data";

        const genreCount: Record<string, number> = {};
        storeUser.music_tracks.forEach((track: any) => {
            if (track.genre) {
                genreCount[track.genre] = (genreCount[track.genre] || 0) + 1;
            }
        });

        const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
        return sortedGenres[0]?.[0] || "No data";
    }, [storeUser]);

    // Кол-во пользователей, которые нас отслеживают
    const followersCount = useMemo(() => {
        return data.filter((user: any) =>
            user.favorite_artists?.some((artist: any) => artist.id === localStorageData.id)
        ).length;
    }, [data, localStorageData.id]);

    return (
        <div className="content">
            <div className="settingsHeader">
                <MiniButton sign="back" inProfilePage={true} func={() => navigate(-1)} />
                <h3 className="headerText">User statistic</h3>
            </div>

            {isLoading ? (
                <Loading />
            ) : userInfo ? (
                <>
                    <ul className="settings">
                        <li>Premium account: {userInfo.isPremium ? "Yes" : "No"}</li>
                        <li>Your favorite genre: {favoriteGenre}</li>

                        {userInfo.isPerformer && (
                            <>
                                <li>Donate and buying your musics: {userInfo.cash} rub.</li>
                                <li>Count of users who track you: {followersCount}</li>
                            </>
                        )}
                    </ul>

                    {userInfo.isPerformer && storeUser?.music_tracks?.length > 0 && (
                        <ul className="musicCount">
                            <h3>The number of listening on certain tracks:</h3>
                            {storeUser.music_tracks.map((track: any) => (
                                <li key={track.id}>
                                    {track.title}: {track.listening}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                <div>No user data available</div>
            )}
        </div>
    );
}
