import classNames from 'classnames';
import style from './MiniPlayer.module.scss';
import { BsFillPlayCircleFill, BsFillPauseCircleFill } from 'react-icons/bs';
import { IoClose } from "react-icons/io5";
import Loading from '../../Loading';


export default function MiniPlayer({ isplaying, setIsPlaying, currentSong, setShowPlayer, showMiniPlayer, setShowMiniPlayer, isLoadingMusic }: any) {

    // функция паузы и воспроизведения
    const PlayPause = () => {
        setIsPlaying(!isplaying);
    }

    // исчезновение плеера
    const removePlayer = () => {
        setIsPlaying(false)
        setShowPlayer(false)
        setShowMiniPlayer(false)
    }

    return (
        <div className={style.playerMobile_container} style={{ display: showMiniPlayer ? 'flex' : 'none' }} onClick={() => setShowPlayer(true)}>
            {isplaying ?
                <button onClick={(e) => { e.stopPropagation(); PlayPause(); }}>
                    <BsFillPauseCircleFill className={classNames(style.btn_action, style.pp)} />
                </button>
                :
                <button onClick={(e) => { e.stopPropagation(); PlayPause(); }}>
                    <BsFillPlayCircleFill className={classNames(style.btn_action, style.pp)} />
                </button>
            }

            <div className={style.music_info_text}>
                {isLoadingMusic ? (
                    <Loading inPlayer={true} />
                ) : (
                    <>
                        <p className={style.title}>{currentSong.title}</p>
                        <p className={style.artist}>{currentSong.artist_name}</p>
                    </>
                )}

            </div>

            <button onClick={(e) => { e.stopPropagation(); removePlayer(); }}>
                <IoClose className={style.btn_action} />
            </button>
        </div>
    )
}