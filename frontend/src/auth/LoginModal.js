// LoginModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import { getCookie } from '../utilities';

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    const data = await response.json();
    if (data.status === 'success') {
      onRequestClose(); // モーダルを閉じる
      window.location.href = '/'; // ログイン成功後のリダイレクト
    } else {
      setError('ログインに失敗しました');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Login">
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">ユーザー名:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">パスワード:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">ログイン</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={onRequestClose}>閉じる</button>
    </Modal>
  );
};

export default LoginModal;
