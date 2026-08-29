import { Link, useNavigate } from "react-router-dom";
import MiniButton from "../../components/UI/MiniButton";
import { useContext } from "react";
import { Context } from "../../context/Context";
import supabase from "../../config/supabaseClient";

export default function SettingsPage() {

    const { localStorageData, setShowCustomAccWin, setShowMenuWindow, setShowMiniPlayer, setIsPlaying } = useContext(Context)

    const navigate = useNavigate();

    const logoutFunc = () => {
        localStorage.clear();
        setShowMiniPlayer(false);
        setIsPlaying(false);
        navigate('/login');
    }

    const deleteAccFunc = async () => {
        const { data, error } = await supabase.from('users').delete().eq('id', localStorageData.id).select()

        if (error) {
            console.error(error)
        }
        if (data) {
            localStorage.clear();
            setShowMiniPlayer(false);
            setIsPlaying(false);
            navigate('/login');
        }
    }

    const activatePremium = async () => {
        const { error } = await supabase
            .from('users')
            .update({ isPremium: true })
            .eq('id', localStorageData.id)

        if (error) { console.error(error) }
        else {
            // Обновляем localStorage
            const updatedUserData = {
                ...localStorageData,
                isPremium: true
            };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
        }

        console.log('premium is activated')
    }

    const showCustomAccWin = () => {
        setShowCustomAccWin(true)
        setShowMenuWindow(true)
    }

    return (
        <div className="content">
            <div className="settingsHeader">
                <MiniButton sign='back' inProfilePage={true} func={() => navigate(-1)} />
                <h3 className="headerText">
                    Settings
                </h3>
            </div>

            <ul className="settings">
                <li onClick={activatePremium}><a href="https://buy.stripe.com/test_4gw6otcYvbcyg12aEH" target="_blank">Buy premium</a></li>
                <li><button onClick={showCustomAccWin}>Customise account</button></li>
                <li><Link to='/settings/statistic'>Show statistic</Link></li>
                <li><a href="https://github.com/hTKzmak/noises_audio-hosting" target="_blank">Project info</a></li>
                <li><button className="danger" onClick={logoutFunc}>Log out</button></li>
                <li><button className="danger" onClick={deleteAccFunc}>Delete account</button></li>
            </ul>
        </div>
    )
}