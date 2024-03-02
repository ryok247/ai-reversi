// SignupModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import { getCookie } from '../utilities';

const SignupModal = ({ isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password1: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });
    const data = await response.json();
    if (data.status === 'success') {
      onRequestClose(); // モーダルを閉じる
      window.location.href = '/'; // サインアップ成功後のリダイレクト
    } else {
      setErrors(data.errors || { form: 'Failed to signup' });
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Signup">
      <h2>サインアップ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザー名:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} />
        </div>
        <div>
          <label>パスワード:</label>
          <input type="password" name="password1" value={formData.password1} onChange={handleChange} />
        </div>
        <div>
          <label>パスワード（確認）:</label>
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} />
        </div>
        <button type="submit">登録</button>
      </form>
      {errors.form && <p>{errors.form}</p>}
      <button onClick={onRequestClose}>閉じる</button>
    </Modal>
  );
};

export default SignupModal;
