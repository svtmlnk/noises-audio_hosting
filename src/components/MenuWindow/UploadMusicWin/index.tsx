import { useContext, useRef, useState } from "react";
import ButtonElem from "../../UI/ButtonElem";
import { Context } from "../../../context/Context";
import style from './UploadMusicWin.module.scss';
import { IoCloseOutline } from "react-icons/io5";
import uploadMusicIcon from '../../../assets/icons/contextMenu/upload_music.svg';
import successIcon from '../../../assets/icons/contextMenu/success.svg';
import failIcon from '../../../assets/icons/contextMenu/fail.svg';
import Loading from "../../Loading";
import supabase from "../../../config/supabaseClient";
import classNames from "classnames";
import { useDispatch } from "react-redux";
import { uploadMusic } from "../../../features/musicdata";

interface musicData {
    id: number,
    title: string,
    genre: string,
    user_id: number,
    artwork_url: string,
    music_url: string,
    isPaid: boolean,
    artist_name?: string,
    listening: number
}

export default function UploadMusicWin() {
    const { data, setShowUploadMusicWin, setShowMenuWindow, localStorageData } = useContext(Context);

    // useRef input'ов (для выбора файлов)
    const fileElem = useRef<HTMLInputElement | null>(null);
    const artworkElem = useRef<HTMLInputElement | null>(null);

    const dispatch = useDispatch();

    // выбранные файлы
    const [choosenFile, setChoosenFile] = useState<File | null>(null);
    const [choosenArtwork, setChoosenArtwork] = useState<File | null>(null);
    const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

    // состояния по загрузки файлов
    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [error, setError] = useState(false);

    // отображение сообщения об ошибке
    const [showError, setShowError] = useState(false);
    const [formError, setFormError] = useState('');

    // paid состояние
    const [isPaid, setIsPaid] = useState(false)

    const [values, setValues] = useState({ title: "", genre: "soundtrack" });

    //  функции выбора файлов
    const chooseFile = () => fileElem.current?.click();
    const chooseArtwork = () => artworkElem.current?.click();

    // загрытие окна и удаление данных
    const closeContextMenu = () => {
        setShowUploadMusicWin(false);
        setShowMenuWindow(false);
        setChoosenFile(null);
        setChoosenArtwork(null);
        setArtworkPreview(null);
        setIsUploaded(false);
        setError(false);

        if (artworkPreview) {
            URL.revokeObjectURL(artworkPreview);
        }
    };

    // сохдранение данных о файлах в состояния
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]?.type === "audio/mpeg") setChoosenFile(files[0]);
    };

    const handleArtworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && (files[0]?.type === "image/png" || files[0]?.type === "image/jpeg")) {
            setChoosenArtwork(files[0]);

            // Удаляем старый объект URL, если он был
            if (artworkPreview) {
                URL.revokeObjectURL(artworkPreview);
            }

            // Создаём новый
            setArtworkPreview(URL.createObjectURL(files[0]));
        }
    };


    // изменение значения input и select
    const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = evt.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    // фунция по загрузки файлов (музыка и обложка) и добавление музыки в БД
    const uploadData = async () => {
        // Проверяем, заполнено ли поле title
        if (!values.title) {
            setShowError(true);
            setFormError('Please fill all the fields');
            return; // Прекращаем выполнение функции, если поле пустое
        }
        else {
            setIsUploading(true);
            setShowError(false);
            setFormError('');

            try {

                const musicData: musicData = {
                    id: Date.now(),
                    title: values.title,
                    genre: values.genre,
                    user_id: localStorageData.id,
                    artwork_url: 'https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/artworks/default.png',
                    music_url: '',
                    isPaid: isPaid,
                    listening: 0
                };

                if (choosenArtwork) {
                    const fileExtension = choosenArtwork?.name.split('.').pop(); // Получаем расширение файла
                    const fileName = `artwork_${musicData.id}.${fileExtension}`; // Добавляем префикс "music_"

                    const { error } = await supabase.storage.from('noises_bucket').upload(`artworks/${fileName}`, choosenArtwork);
                    if (error) throw error;
                    musicData.artwork_url = `https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/artworks/${fileName}`;
                    console.log(musicData.artwork_url)
                }

                if (choosenFile) {
                    const fileExtension = choosenFile?.name.split('.').pop(); // Получаем расширение файла
                    const fileName = `music_${musicData.id}.${fileExtension}`; // Добавляем префикс "music_"

                    const { error } = await supabase.storage.from('noises_bucket').upload(`musics/${fileName}`, choosenFile);
                    if (error) throw error;
                    musicData.music_url = `https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/musics/${fileName}`;
                    console.log(musicData.music_url)
                }

                const { error } = await supabase.from('music_tracks').insert(musicData);
                if (error) throw error;

                setIsUploaded(true);

                // добавление музыки на странице (но с добавлением нового ключа и значения с именем пользователя)
                let musicDataWithArtistName = musicData
                musicDataWithArtistName.artist_name = `${localStorageData.name}`

                console.log('загруженные данные:')
                console.log(musicData)
                dispatch(uploadMusic(musicDataWithArtistName))
            } catch (err) {
                setError(true)
            } finally {
                setIsUploading(false);
            }
        }

    };

    const retryToUpload = () => {
        setError(false)
        setIsUploading(false)
    }

    return (
        <div className={style.uploadMenu}>
            <div className={style.uploadHeader}>
                <h3>Upload music</h3>
                <button onClick={closeContextMenu}>
                    <IoCloseOutline />
                </button>
            </div>
            <div className={style.uploadContent}>
                {isUploading ? (
                    <Loading />
                ) : isUploaded ? (
                    <div className={style.uploadResult}>
                        <img src={successIcon} alt="Success" />
                        <p>Music has been uploaded</p>
                        <ButtonElem title={'Close window'} func={closeContextMenu} />
                    </div>
                ) : error ? (
                    <div className={style.uploadResult}>
                        <img src={failIcon} alt="Failure" />
                        <p>Music hasn’t been uploaded</p>
                        <ButtonElem title={'Retry'} func={retryToUpload} />
                    </div>
                ) : !choosenFile ? (
                    <div>
                        <img src={uploadMusicIcon} alt="Upload" />
                        <p>Click the button below to select a file</p>
                        <input ref={fileElem} type="file" accept=".mp3" hidden onChange={handleFileChange} />
                        <ButtonElem title='Choose file' func={chooseFile} />
                    </div>
                ) : (
                    <div className={style.uploadFormContent}>
                        <div
                            className={style.musicImage}
                            style={{ backgroundImage: `url(${artworkPreview || "https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/artworks/default.png"})` }}
                        ></div>
                        <input ref={artworkElem} type="file" accept="image/png, image/jpeg" hidden onChange={handleArtworkChange} />
                        <p><span onClick={chooseArtwork}>Click here</span> to change image</p>
                        <form onSubmit={(e) => { e.preventDefault() }}>
                            <label>Options</label>
                            <input type="text" name="title" placeholder='Music name' value={values.title} onChange={handleInputChange} />
                            <select name="genre" value={values.genre} onChange={handleInputChange}>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="hip-hop">Hip-Hop</option>
                                <option value="electronic">Electronic</option>
                                <option value="electro">Electro</option>
                                <option value="jazz">Jazz</option>
                                <option value="classical">Classical</option>
                                <option value="metal">Metal</option>
                                <option value="indie">Indie</option>
                                <option value="folk">Folk</option>
                                <option value="cinematic">Cinematic</option>
                                <option value="soundtrack">Soundtrack</option>
                            </select>

                            {data.find((user: any) => user.id === localStorageData.id).isPerformer && (
                                <div className={style.paidCheckbox}>
                                    <label>Make it paid</label>
                                    <input type="checkbox" checked={isPaid} onChange={() => setIsPaid(!isPaid)}/>
                                </div>
                            )}

                            <ButtonElem title={'Upload music'} func={uploadData} />
                            <p className={classNames(showError ? style.errorMessage : style.noneError)}>{formError}</p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
