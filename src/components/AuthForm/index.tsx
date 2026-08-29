import { Link, useLocation, useNavigate } from "react-router-dom";
import style from './AuthForm.module.scss';
import ButtonElem from "../UI/ButtonElem";

import miniLogo from '/noises.svg';
import { useState } from "react";
import classNames from "classnames";
import supabase from "../../config/supabaseClient";

export default function AuthForm() {

    const { pathname } = useLocation();
    const isLogin = pathname.includes('login');

    const navigate = useNavigate();

    // отображение сообщения ошибки
    const [error, setError] = useState(false)
    const [formError, setFormError] = useState('')

    const [values, setValues] = useState({
        name: "",
        email: "",
        password: ""
    });

    // подтверждение формы заполнения
    const handleSubmit = async (evt: React.SyntheticEvent<HTMLFormElement>) => {
        evt.preventDefault();

        // Если у пользователя нет аккаунта
        if (!isLogin) {
            if (values.name && values.email && values.password) {
                const newUser = {
                    id: Date.now(),
                    name: values.name,
                    email: values.email,
                    password_hash: values.password,
                    image_url: 'https://evapkmvcgowyfwuogwbq.supabase.co/storage/v1/object/public/noises_bucket/user_profile_images/default.png',
                    isPremium: false
                };

                const { data, error } = await supabase.from('users')
                    .insert(newUser)
                    .select()
                    .single();

                if (error || !data) {
                    console.error(error || 'User creation failed');
                    setFormError("Sorry, but we can't create this account");
                    setError(true);
                    return;
                }
                else {
                    localStorage.setItem('userData', JSON.stringify(data));
                    setFormError('');
                    setError(false);
                    location.href = '/noises_audio-hosting'
                }

            } else {
                setFormError('Please fill all the fields');
                setError(true);
            }

        }
        // Если у пользователя есть аккаунт
        else {
            if (values.email && values.password) {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, email, password_hash, image_url, isPremium')
                    .eq('email', values.email)
                    .eq('password_hash', values.password)
                    .single();

                if (error || !data) {
                    console.error(error || 'User not found (╥﹏╥)');
                    setFormError('Invalid email or password.');
                    setError(true);
                    return;
                }
                else {
                    console.log('User is found ＼(≧▽≦)／');
                    localStorage.setItem('userData', JSON.stringify(data));
                    setFormError('');
                    setError(false);
                    navigate('/')
                }
            } else {
                setFormError('Please fill all the fields');
                setError(true);
            }
        }

    }

    // отслеживание и изменение input'ов
    const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        evt.preventDefault();

        const { name, value } = evt.target;
        setValues((values) => ({
            ...values,
            [name]: value
        }));
    };

    // очистка формы и сообщения об ошибке
    const clearForm = () => {
        setValues({
            name: "",
            email: "",
            password: ""
        })

        setError(false)
    }

    return (
        <div className={style.authForm}>


            <img src={miniLogo} alt="Logo" />

            {isLogin ? (
                <div>
                    <h3>Welcome back!</h3>
                    <p>Fist time here? <Link to={'/registration'} onClick={clearForm}>Sign up for free</Link></p>
                </div>
            ) : (
                <div>
                    <h3>Welcome!</h3>
                    <p>You have an account? <Link to={'/login'} onClick={clearForm}>Sign in</Link></p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!isLogin && (<input type="text" name="name" placeholder="Name" value={values.name} onChange={handleInputChange} />)}
                <input type="email" name="email" placeholder="Email" value={values.email} onChange={handleInputChange} />
                <input type="password" name="password" placeholder="Password" value={values.password} onChange={handleInputChange} />

                <ButtonElem title={isLogin ? 'Sign in' : 'Sign up'} />

                <p className={classNames(error ? style.errorMessage : style.noneError)}>{formError}</p>
            </form>

        </div>
    )
}