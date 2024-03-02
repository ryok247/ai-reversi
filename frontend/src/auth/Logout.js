import React, { useEffect } from 'react';
import { getCookie } from '../utilities';

function Logout() {
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
