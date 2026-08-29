import classNames from 'classnames';
import style from './MiniButton.module.scss';

import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from "react-icons/io";

interface ButtonElemProps {
    sign?: string,
    inProfilePage?: boolean;
    func?: any;
}

export default function MiniButton({ sign, inProfilePage, func }: ButtonElemProps) {
    const icon = sign === 'back' ? <IoIosArrowBack /> : sign === 'forward' ? <IoIosArrowForward /> : <IoIosArrowDown />;

    return (
        <button className={classNames(style.miniButton, inProfilePage ? "inProfilePage" : '')} onClick={func}>
            {icon}
        </button>
    );
}