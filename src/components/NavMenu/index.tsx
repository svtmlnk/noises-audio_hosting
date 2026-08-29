import { Link } from "react-router-dom";
import style from './NavMenu.module.scss';

// icons
import { AiFillHome } from "react-icons/ai";
import { FaCompass } from "react-icons/fa6";
import { FaUser } from "react-icons/fa6";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { MdLibraryMusic } from "react-icons/md";
import { RiHeartFill } from "react-icons/ri";

import noisesLogo from '../../assets/logo.svg';
import miniLogo from '/noises.svg';
import { useContext } from "react";
import { Context } from "../../context/Context";

export default function NavMenu() {

    // получение данных с app.tsx
    const { localStorageData, setShowMenuWindow, setShowLibraryWin } = useContext(Context)

    const showLibrary = () => {
        setShowLibraryWin(true)
        setShowMenuWindow(true)
    }

    return (
        <div className={style.menu}>

            <div className={style.menuDesktop}>

                <img className={style.logo} src={noisesLogo} alt="Noises" />
                <img className={style.miniLogo} src={miniLogo} alt="Noises" />

                <div className={style.browseMusic}>
                    <ul>
                        <li>
                            <Link to={'/'}><AiFillHome/> <span>Home</span></Link>
                        </li>
                        <li>
                            <Link to={'/explore'}><FaCompass/> <span>Explore</span></Link>
                        </li>
                    </ul>
                    <ul>
                        <h3>Library</h3>
                        <li>
                            <Link to={'/musics/favorite'}><RiHeartFill/> <span>Fav. music</span></Link>
                        </li>
                        <li>
                            <Link to={'/artists/favorite'}><FaUser/> <span>Fav. artists</span></Link>
                        </li>
                        <li>
                            <Link to={'/musics/listened'}><FaArrowRotateLeft/> <span>Listened</span></Link>
                        </li>
                    </ul>
                </div>
            </div>

            <ul className={style.browseMusicMobile}>
                <li>
                    <Link to={'/'}><AiFillHome/></Link>
                </li>
                <li>
                    <Link to={'/explore'}><FaCompass/></Link>
                </li>
                <li>
                    <button onClick={showLibrary}><MdLibraryMusic/></button>
                </li>
                <li>
                    <Link to={`/profile/${localStorageData?.id}`} className={style.user}>
                        <div className={style.userImage} style={{ backgroundImage: `url(${localStorageData ? localStorageData.image_url : 'https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/user_profile_images/default.png'})` }}></div>
                    </Link>
                </li>
            </ul>
        </div>
    )
}