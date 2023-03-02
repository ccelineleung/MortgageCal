import React, { useContext, useEffect, useState } from 'react';
import HomeSavedList from './HomeSavedList';
import { redirect } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../context/AuthContext';

const History = () => {
  const navigate = useNavigate();

  const { userInfo } = useContext(UserInfoContext);
  // if(!user.accesstoken) return navigate('/login')
  const [content, setContent] = useState('You need to login');

  useEffect(() => {
    const fetchProtected = async () => {
      const res = await fetch('api/users/protected', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'Application/JSON',
          authorization: `Bearer ${userInfo.accesstoken}`,
        },
      });
      const datas = await res.json();

      if (datas.data) {
        setContent(datas.data);
      } else {
        navigate('/account');
        return content;
      }
    };
    fetchProtected();
  }, [userInfo]);

  return (
    <>
      <h1>Target Home Lists</h1>
      <HomeSavedList />
    </>
  );
};

export default History;
