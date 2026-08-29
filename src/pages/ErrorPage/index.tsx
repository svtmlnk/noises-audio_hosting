import { useNavigate } from "react-router-dom";
import ButtonElem from "../../components/UI/ButtonElem";

export default function ErrorPage(){

    let navigate = useNavigate();

    return(
        <div className="ErrorContent">
            <h1>404</h1>
            <p>We couldn’t find this page <br/> you are looking for.</p>
            <ButtonElem title={'Return to Home Page'} func={() => navigate('/')}/>
        </div>
    )
}