import style from './ButtonElem.module.scss';

interface ButtonElemProps {
    title: string;
    func?: any;
    disabled? :boolean;
}

export default function ButtonElem({title, func, disabled}: ButtonElemProps){
    return(
        <button className={disabled ? style.buttonElem_disabled : style.buttonElem} onClick={func} disabled={disabled}>{title}</button>
    )
}