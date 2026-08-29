import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProductsState {
    data: any[],
    latest_music: any[],
    latest_artists: any[],
    popular_music: any[],
    popular_artists: any[]
}

const initialState: ProductsState = {
    data: [],
    latest_music: [],
    latest_artists: [],
    popular_music: [],
    popular_artists: []
}

export const productsSlice = createSlice({
    name: 'music',
    initialState,
    reducers: {
        // Вывод текущих данных в консоль
        getData(state) {
            console.log(state.data);
        },

        // Обновление всех списков на основе текущего состояния
        updateAllLists(state) {
            const allMusic = state.data.flatMap(user => user.music_tracks);

            state.latest_music = [...allMusic]
                .sort((a, b) => b.id - a.id)

            state.popular_music = [...allMusic]
                .sort((a, b) => (b.listening || 0) - (a.listening || 0))

            state.latest_artists = [...state.data]
                .filter(user => user.music_tracks?.length)
                .sort((a, b) => b.id - a.id)

            state.popular_artists = [...state.data]
                .filter(user =>
                    user.music_tracks?.length &&
                    (user.favorite_count || 0) > 0
                )
                .sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
        },

        // Добавление всех пользователей и обновление музыки/исполнителей
        addingData(state, action: PayloadAction<any[]>) {
            state.data = action.payload;
            productsSlice.caseReducers.updateAllLists(state);
            console.log(state.data);
        },

        // Загрузка новой музыки для конкретного пользователя
        uploadMusic(state, action) {
            const userIndex = state.data.findIndex((user: any) => user.id === action.payload.user_id);
            if (userIndex !== -1) {
                state.data[userIndex].music_tracks.push(action.payload);
                productsSlice.caseReducers.updateAllLists(state);
            }
            console.log('Данные после добавления музыки:', state.data);
        },

        // Удаление музыки по ID пользователя и ID трека
        deleteMusic(state, action: PayloadAction<{ userId: number, musicId: number }>) {
            const { userId, musicId } = action.payload;

            state.data = state.data.map(user => {
                if (user.id === userId) {
                    return {
                        ...user,
                        music_tracks: user.music_tracks.filter((track: any) => track.id !== musicId)
                    };
                }
                return user;
            });

            productsSlice.caseReducers.updateAllLists(state);
            console.log("Музыка удалена. Обновлённые данные:", state.data);
        },

        // Добавление/удаление трека из избранного у пользователя
        musicToFavorControl(state, action: PayloadAction<{ musicData: any, userID: number }>) {
            const { musicData, userID } = action.payload;

            state.data = state.data.map(user => {
                if (user.id !== userID) return user;

                const isInFavorites = user.favorite_music?.some((track: any) => track.id === musicData.id);
                return {
                    ...user,
                    favorite_music: isInFavorites
                        ? user.favorite_music.filter((track: any) => track.id !== musicData.id)
                        : [...(user.favorite_music || []), musicData]
                };
            });
        },

        // Добавление/удаление артиста из избранного у пользователя
        artistToFavorControl(state, action: PayloadAction<{ artistData: any, userID: number }>) {
            const { artistData, userID } = action.payload;

            state.data = state.data.map(user => {
                if (user.id !== userID) return user;

                const isInFavorites = user.favorite_artists?.some((artist: any) => artist.id === artistData.id);
                return {
                    ...user,
                    favorite_artists: isInFavorites
                        ? user.favorite_artists.filter((artist: any) => artist.id !== artistData.id)
                        : [...(user.favorite_artists || []), artistData]
                };
            });
        },

        // Обновление профиля пользователя
        updateProfile(state, action: PayloadAction<{
            userId: number,
            updates: {
                name?: string,
                image_url?: string,
                showLink?: boolean,
                isPerformer?: boolean,
                favorite_count?: number
            }
        }>) {
            const { userId, updates } = action.payload;

            state.data = state.data.map(user => {
                if (user.id !== userId) return user;

                const updatedTracks = updates.name
                    ? user.music_tracks.map((track: any) => ({
                        ...track,
                        artist_name: updates.name
                    }))
                    : user.music_tracks;

                return {
                    ...user,
                    ...updates,
                    music_tracks: updatedTracks
                };
            });

            // Обновляем списки, если изменилось что-то важное
            if (updates.name || updates.image_url || updates.isPerformer !== undefined || updates.favorite_count !== undefined) {
                productsSlice.caseReducers.updateAllLists(state);
            }

            console.log("Профиль обновлён. Новые данные:", state.data);
        }
    },
});

// Экспорт экшенов
export const {
    getData,
    addingData,
    uploadMusic,
    deleteMusic,
    musicToFavorControl,
    artistToFavorControl,
    updateProfile,
    updateAllLists, // экспорт, если нужно вызывать извне
} = productsSlice.actions;

export default productsSlice.reducer;
