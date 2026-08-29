import PerformerItem from '../PerformerItem'
import style from './PerformersList.module.scss'

interface ArtistsListInter{
    sortedData: any;
    onList: boolean;
    scrollArtistsRef?: any;
}  

export default function PerformerList({ sortedData, onList, scrollArtistsRef }: ArtistsListInter) {

    return (
        <div className={onList ? style.scrolledPerformersList : style.performersList} ref={scrollArtistsRef}>
            {sortedData.map((elem: any) => (
                <PerformerItem key={elem.id} id={elem.id} name={elem.name} image_url={elem.image_url} onList={onList}/>
            ))}
        </div>
    )
}