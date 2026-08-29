import { useContext, useRef, useState } from "react";
import { Context } from "../../../context/Context";
import { IoCloseOutline } from "react-icons/io5";
import successIcon from '../../../assets/icons/contextMenu/success.svg';
import failIcon from '../../../assets/icons/contextMenu/fail.svg';

import style from './CustomAcc.module.scss'
import ButtonElem from "../../UI/ButtonElem";
import classNames from "classnames";
import Loading from "../../Loading";
import supabase from "../../../config/supabaseClient";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../../features/musicdata";

export default function CustomAccWin() {
    const { data, setShowCustomAccWin, setShowMenuWindow, localStorageData } = useContext(Context);

    const dispatch = useDispatch();

    // useRef input'ов (для выбора файлов)
    const imageElem = useRef<HTMLInputElement | null>(null);

    // состояния по обновлению данных
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [error, setError] = useState(false);

    // отображение сообщения об ошибке
    const [showError, setShowError] = useState(false);
    const [formError, setFormError] = useState('');

    // выбранные файлы
    const [choosenImage, setChoosenImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // значение input (имя пользователя)
    const [newName, setNewName] = useState(localStorageData.name)

    // Отображать ссылку на донат
    const [showLink, setShowLink] = useState(localStorageData.showLink)

    // выбор изображения
    const chooseImage = () => imageElem.current?.click();

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && (files[0]?.type === "image/png" || files[0]?.type === "image/jpeg")) {
            setChoosenImage(files[0]);

            // Удаляем старый объект URL, если он был
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            // Создаём новый
            setImagePreview(URL.createObjectURL(files[0]));
        }
    };

    // функция по загрузке обновлённых данных
    const uploadData = async () => {
        if (!newName.trim()) {
            setShowError(true);
            setFormError('Please fill all the fields');
            return;
        }

        setIsUpdating(true);
        setShowError(false);
        setFormError('');
        setError(false);

        try {
            let imageUrl = localStorageData.image_url; // Используем текущий URL по умолчанию

            // Загрузка изображения, если оно выбрано
            if (choosenImage) {
                // Генерируем уникальное имя файла
                const fileExt = choosenImage.name.split('.').pop();
                const fileName = `user_${localStorageData.id}-${Date.now()}.${fileExt}`;
                const filePath = `user_profile_images/${fileName}`;

                // Загружаем файл в хранилище
                const { error: uploadError } = await supabase.storage
                    .from('noises_bucket')
                    .upload(filePath, choosenImage, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // Получаем публичный URL загруженного изображения
                const { data: { publicUrl } } = supabase.storage
                    .from('noises_bucket')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // Обновляем пользователя в базе данных
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: newName,
                    image_url: imageUrl,
                    showLink: showLink
                })
                .eq('id', localStorageData.id);

            if (updateError) throw updateError;

            // Обновляем localStorage
            const updatedUserData = {
                ...localStorageData,
                name: newName,
                image_url: imageUrl,
                showLink: showLink
            };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));

            // Обновляем данные в musicdata
            dispatch(updateProfile({
                userId: localStorageData.id,
                updates: {
                    name: newName,
                    image_url: imageUrl,
                    showLink: showLink
                }
            }));

            // Флаг успешного обновления
            setIsUpdated(true);
        } catch (err) {
            console.error('Upload error:', err);
            setError(true);
        } finally {
            setIsUpdating(false);
        }
    };

    const retryToUpload = () => {
        setError(false)
    }

    // загрытие окна и удаление данных
    const closeContextMenu = () => {
        setShowCustomAccWin(false);
        setShowMenuWindow(false);
    };

    return (
        <div className={style.customMenu}>
            <div className={style.winHeader}>
                <h3>Customise profile</h3>
                <button onClick={closeContextMenu}>
                    <IoCloseOutline />
                </button>
            </div>
            <div className={style.winContent}>

                {isUpdating ? (
                    <Loading />
                ) : isUpdated ? (
                    <div className={style.uploadResult}>
                        <img src={successIcon} alt="Success" />
                        <p>Account has been uploaded</p>
                        <ButtonElem title={'Close window'} func={closeContextMenu} />
                    </div>
                ) : error ? (
                    <div className={style.uploadResult}>
                        <img src={failIcon} alt="Failure" />
                        <p>Account hasn’t been uploaded</p>
                        <ButtonElem title={'Retry'} func={retryToUpload} />
                    </div>
                ) : (
                    <div className={style.formContent}>
                        <div
                            className={style.userImage}
                            style={{ backgroundImage: `url(${imagePreview || localStorageData.image_url})` }}
                        ></div>
                        <input ref={imageElem} type="file" accept="image/png, image/jpeg" hidden onChange={handleImageChange} />
                        <p><span onClick={chooseImage}>Click here</span> to change image</p>

                        <form onSubmit={(e) => { e.preventDefault() }}>
                            <label>Options</label>
                            <input type="text" name="name" placeholder='User name' value={newName} onChange={(e) => setNewName(e.target.value)} />

                            {data.find((user: any) => user.id === localStorageData.id).isPerformer && (
                                <div className={style.paidCheckbox}>
                                    <label>Show payment link</label>
                                    <input type="checkbox" checked={showLink} onChange={() => setShowLink(!showLink)} />
                                </div>
                            )}

                            <ButtonElem title={'Submit'} func={uploadData} />
                            <p className={classNames(showError ? style.errorMessage : style.noneError)}>{formError}</p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
