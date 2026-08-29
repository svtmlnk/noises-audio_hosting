import MusicItem from '../MusicItem'
import style from './MusicList.module.scss'

interface MusicListInter{
    scrollMusicsRef?: any;
    onList: boolean;
    sortedData: any;
}  

export default function MusicList({ scrollMusicsRef, onList, sortedData }: MusicListInter) {

    return (
        <div className={onList ? style.scrolledMusicList : style.musicList} ref={scrollMusicsRef}>
            {sortedData.map((elem: any) => (
                <MusicItem key={elem.id} {...elem} onList={onList} sortedData={sortedData}/>
            ))}
        </div>
    )
}