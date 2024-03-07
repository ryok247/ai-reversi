import React, { useEffect } from 'react';
import { getCookie } from '../utilities';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../actions/authActions';

function Logout() {

    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.language);

    useEffect(() => {
        const logout = async () => {
            const response = await fetch('/api/logout/', {
                method: 'GET',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (data.status === 'success') {
                dispatch(logoutAction());
                window.location.href = '/'; // ログアウト成功後のリダイレクト
            }
        };
        logout();
    }, []);

    return (
        <div>
            {language==="en" ? "Logging out..." : "ログアウト中..."}
        </div>
    );
}

export default Logout;
