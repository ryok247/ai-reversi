import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../actions/authActions';
import { getCookie } from '../utilities';
import { isUserLoggedIn } from '../manage-game';

const SignupModal = ({ isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

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
    if (response.ok) {
        // リクエスト成功
        console.log(isUserLoggedIn());
        dispatch(loginSuccess(data.user)); // 注意: ここで data.user がサーバーからのレスポンスに含まれている必要がある
        console.log(isUserLoggedIn());
        onRequestClose();
    } else {
        // リクエスト失敗
        console.log("sign up failed");
        setErrors(data.errors || { form: 'Failed to signup' });
    }
    };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Signup">
      <h2>サインアップ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザー名:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>パスワード:</label>
          <input type="password" name="password1" value={formData.password1} onChange={handleChange} required />
        </div>
        <div>
          <label>パスワード（確認）:</label>
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} required />
        </div>
        <button type="submit">登録</button>
      </form>
      {errors.form && <p>{errors.form}</p>}
      <button onClick={onRequestClose}>閉じる</button>
    </Modal>
  );
};

export default SignupModal;
