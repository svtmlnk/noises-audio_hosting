import { useContext, useEffect, useRef, useState } from "react";
import Player from "./Player";
import MiniPlayer from "./MiniPlayer";
import { Context } from "../../context/Context";

interface Song {
    title: string;
    url: string;
    progress?: number;
    length?: number;
}

export default function PlayerApp({ data }: any) {

    // получение дпнных с app.tsx
    const { currentSong, setCurrentSong, showPlayer, setShowPlayer, showMiniPlayer, setShowMiniPlayer, songs, setSongs, isplaying, setIsPlaying } = useContext(Context)

    // фильтрация данных, чтобы оставались только треки для их отображения
    useEffect(() => {
        if (data && data.length > 0) {
            const newData = data.flatMap((item: any) => item.music_tracks);
            setSongs(newData);
        }
    }, [data]);

    // перемешивать список музыки (true - да; false - нет)
    const [mixMusic, setMixMusic] = useState<boolean>(false);

    // массив с перемешанными индексами музыки
    const [mixSongsdata, setMixSongsdata] = useState<Song[]>([]);

    // повторение музыки (1 - не повторяется ни список, ни музыка; 2 - повторяется только список; 3 - повторяется только трек)
    const [repeatValue, setRepeatValue] = useState<number>(1);

    // место события на разметке (audio тег)
    const audioElem = useRef<HTMLAudioElement | null>(null);

    const [isLoadingMusic, setIsLoadingMusic] = useState<boolean>(false);

    // Одна из опций плеера: перемешивание музыки (данные songsdata)
    const mixSongsFunc = () => {
        let arrayCopy = [...songs];
        for (let i = arrayCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
        }
        setMixSongsdata(arrayCopy);
        console.log(arrayCopy)
    }

    // воспроизведение и остановка музыки с проверкой на готовкность к запуску музыки
    useEffect(() => {
        if (!audioElem.current) return;

        const handleCanPlay = () => {
            setIsLoadingMusic(false);
            if (isplaying) {
                const playPromise = audioElem.current?.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error("Playback failed:", e);
                        setIsPlaying(false);
                    });
                }
            }
        };

        const handleWaiting = () => {
            setIsLoadingMusic(true);
        };

        const handleTouchStart = () => {
            // Разблокировка аудио на iOS
            audioElem.current?.play().then(() => {
                if (!isplaying) audioElem.current?.pause();
            });
        };

        audioElem.current.addEventListener('canplay', handleCanPlay);
        audioElem.current.addEventListener('loadedmetadata', handleCanPlay);
        audioElem.current.addEventListener('waiting', handleWaiting);
        document.addEventListener('touchstart', handleTouchStart, { once: true });

        if (isplaying) {
            if (audioElem.current.readyState > 2) {
                const playPromise = audioElem.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error("Playback failed:", e);
                        setIsPlaying(false);
                    });
                }
            } else {
                setIsLoadingMusic(true);
            }
        } else {
            audioElem.current.pause();
        }

        return () => {
            audioElem.current?.removeEventListener('canplay', handleCanPlay);
            audioElem.current?.removeEventListener('loadedmetadata', handleCanPlay);
            audioElem.current?.removeEventListener('waiting', handleWaiting);
            document.removeEventListener('touchstart', handleTouchStart);
        };
    }, [isplaying, currentSong]);

    // функция по обновлению времени музыки
    const onPlaying = () => {
        if (audioElem.current) {
            const duration = audioElem.current.duration || 0;
            const ct = audioElem.current.currentTime || 0;
            setCurrentSong((prev: any) => ({ ...prev, progress: ct, length: duration }));
        }
    };

    // пропуск музыки на предыдущую музыку
    const skipBack = () => {
        if (mixMusic) {
            const index = mixSongsdata.findIndex((x: Song) => x.title === currentSong.title);
            if (index === 0) {
                setCurrentSong(mixSongsdata[mixSongsdata.length - 1])
            }
            else {
                setCurrentSong(mixSongsdata[index - 1])
            }
        }
        else {
            const index = songs.findIndex((x: Song) => x.title === currentSong.title);
            if (index === 0) {
                setCurrentSong(songs[songs.length - 1])
            }
            else {
                setCurrentSong(songs[index - 1])
            }
        }

        if (audioElem.current) {
            audioElem.current.currentTime = 0;
        }
    }

    // пропуск музыки на следующую музыку
    const skiptoNext = () => {
        if (mixMusic) {
            const index = mixSongsdata.findIndex((x: Song) => x.title === currentSong.title);
            if (index === mixSongsdata.length - 1) {
                setCurrentSong(mixSongsdata[0]);
            } else {
                setCurrentSong(mixSongsdata[index + 1]);
            }
        }
        // Если перемешивание выключено, переходим к следующей песне
        else {
            const index = songs.findIndex((x: Song) => x.title === currentSong.title);
            if (index === songs.length - 1) {
                setCurrentSong(songs[0]);
            } else {
                setCurrentSong(songs[index + 1]);
            }
        }

        if (audioElem.current) {
            audioElem.current.currentTime = 0; // Сброс времени проигрывания
        }
    };

    // функционал повторения музыки
    const repeatMusicFunc = () => {
        const index = songs.findIndex((x: Song) => x.title === currentSong.title);
        switch (repeatValue) {
            // первая опция: если индекс последней музыки равен длине всего списка музыки, то музыка останавливается
            case 1:
                if (index === songs.length - 1) setIsPlaying(false);
                else skiptoNext();
                break;

            // вторая опция: будет заново воспроизводиться весь список музыки
            case 2:
                skiptoNext();
                break;

            // // третья опция: будет заново воспроизводиться только конкретная музыка
            // она не нужна, так как в качестве повторения музыки работает оператор loop в audio и если значение repeatValue равен 3, то музыка будет повторяться, иначе будут выполняться другие операции.
            // очень тупо, но оно работает ┐(￣～￣)┌
            // case 3:
            //     // setCurrentSong(songs[index]);
            //     break;
            default:
                skiptoNext();
                break;
        }
    };


    return (
        <div>
            <audio
                src={currentSong.music_url}
                ref={audioElem}
                preload="auto"
                webkit-playsinline="true"
                playsInline
                onTimeUpdate={onPlaying}
                onEnded={repeatMusicFunc}
                loop={repeatValue === 3}
            />

            <MiniPlayer
                isplaying={isplaying}
                setIsPlaying={setIsPlaying}
                currentSong={currentSong}
                setShowPlayer={setShowPlayer}
                showMiniPlayer={showMiniPlayer}
                setShowMiniPlayer={setShowMiniPlayer}
                isLoadingMusic={isLoadingMusic}
            />

            <Player
                isplaying={isplaying}
                setIsPlaying={setIsPlaying}
                audioElem={audioElem}
                currentSong={currentSong}
                setCurrentSong={setCurrentSong}
                mixMusic={mixMusic}
                setMixMusic={setMixMusic}
                skipBack={skipBack}
                skiptoNext={skiptoNext}
                repeatValue={repeatValue}
                setRepeatValue={setRepeatValue}
                showPlayer={showPlayer}
                setShowPlayer={setShowPlayer}
                showMiniPlayer={showMiniPlayer}
                mixSongsFunc={mixSongsFunc}
                isLoadingMusic={isLoadingMusic}
            />
        </div>
    )
}