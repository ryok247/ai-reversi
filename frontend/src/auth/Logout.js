import React, { useEffect } from 'react';
import { getCookie } from '../utilities';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../actions/authActions';

function Logout() {

    const dispatch = useDispatch();

    useEffect(() => {
        const logout = async () => {
            const response = await fetch('/logout/', {
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
            Logging out...
        </div>
    );
}

export default Logout;
