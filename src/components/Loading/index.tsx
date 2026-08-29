import style from './Loading.module.scss';

type inPlayer = {
    inPlayer?: boolean;
    inMusicImage?: boolean;
}

function Loading({inPlayer, inMusicImage}: inPlayer){
    return(
        <div className={style.loading} style={{height: (inPlayer || inMusicImage) ? 'auto' : '100vh'}}>
            <span className={inPlayer ? style.loaderPlayer : inMusicImage ? style.loaderImage : style.loader}></span>
        </div>
    )
}

export default Loading