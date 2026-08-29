import { useNavigate } from "react-router-dom";
import ProfileContent from "../../components/ProfileContent";
import MiniButton from "../../components/UI/MiniButton";

export default function ProfilePage() {

    const navigate = useNavigate();

    return (
        <div className="content">
            <MiniButton sign='back' inProfilePage={true} func={() => navigate(-1)} />
            <ProfileContent />
        </div>
    )
}