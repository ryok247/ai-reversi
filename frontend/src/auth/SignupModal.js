import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../actions/authActions';
import { getCookie } from '../utilities';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '400px', // モーダルの幅を指定
    height: 'auto', // モーダルの高さを自動調整
    padding: '20px', // パディングを追加
  },
};

// CSSを追加
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const labelStyle = {
  marginBottom: '5px',
};

const inputStyle = {
  marginBottom: '20px', // フィールド間のスペース
  width: '100%', // 入力フィールドの幅を調整
};

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
      dispatch(loginSuccess(data.user));
      onRequestClose();
    } else {
      console.log("Sign up failed");
      setErrors(data.errors || { form: 'Failed to sign up' });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      contentLabel="Sign Up" 
      style={customStyles}
    >
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={labelStyle}>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password:</label>
          <input type="password" name="password1" value={formData.password1} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm Password:</label>
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} required style={inputStyle} />
        </div>
        <button type="submit">Register</button>
      </form>
      {errors.form && <p>{errors.form}</p>}
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default SignupModal;
