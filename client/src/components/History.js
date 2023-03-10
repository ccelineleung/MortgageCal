import React, { useContext, useEffect, useState } from 'react';
import HomeSavedList from './HomeSavedList';
import { redirect } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../context/AuthContext';
import jwt_decode from 'jwt-decode';
import Popup from 'reactjs-popup';
import InputForm from './InputForm';

const History = () => {
  const navigate = useNavigate();

  const { userInfo } = useContext(UserInfoContext);
  // if(!user.accesstoken) return navigate('/login')
  const [content, setContent] = useState('You need to login');
  const [userData, setUserData] = useState([]);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchProtected = async () => {
      const res = await fetch('api/users/protected', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'Application/JSON',
          authorization: `Bearer ${userInfo.accesstoken}`,
        },
      });
      const datas = await res.json();
      console.log(`datas from history`, datas);
      if (datas.data === undefined) {
        navigate('/account');
        return content;
      } else {
        setContent(datas.data);
      }
    };

    const token = localStorage.getItem('accesstoken');
    let user_Id;
    if (token) {
      const decoded = jwt_decode(token);

      user_Id = decoded.userId;
      setUserId(user_Id);
    }
    // setUserId(decoded.userId);
    const getAllData = async () => {
      const body = { userId: user_Id };

      try {
        const res = await fetch(`api/allSavedforID`, {
          method: 'POST',
          headers: { 'Content-Type': 'Application/JSON' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchProtected();
    if (user_Id) getAllData();
  }, [userInfo]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    // minimumFactionDigits: 2,
  });
  // console.log(`USERID from HISTORY.JS`, userId);

  const deleteHandler = async (id) => {
    const body = {
      userId: userId,
      home_id: id,
    };
    console.log(`THIS IS BODY FROM DELETE DATA`, body);
    try {
      const res = await fetch(`api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'Application/JSON' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      // date -> after delete
      setUserData(data);
      // console.log(`userData`, userData);
    } catch (error) {
      console.log(error.message);
    }
  };

  const editHandler = async (id) => {
    const body = {
      userId: userId,
      home_id: id,
      name: name,
      address: address,
    };
    try {
      const res = await fetch(`api/editHomeInfo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'Application/JSON' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      setUserData(data);
      // console.log(`userData`, userData);
    } catch (error) {
      console.log(error.message);
    }
  };

  // console.log(`111111111`, userData);
  return (
    <>
      <h1>Target Home Lists</h1>
      {/* <HomeSavedList userId={userId} /> */}
      <table className='styled-table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>HOME VALUES</th>
            <th>DOWN PAYMENT</th>
            <th>LOAN AMOUNT</th>
            <th>INTEREST RATE</th>
            <th>LOAN TERM</th>
            <th>PAYMENT</th>
            <th>Edit</th>
            <th>DELETE</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((data, index) => (
            <tr key={index}>
              <td>{data.name}</td>
              <td>{formatter.format(data.homevalue)}</td>
              <td>{formatter.format(data.downpayment)}</td>
              <td>{formatter.format(data.loanamount)}</td>
              <td>{data.interest}%</td>
              <td>{data.loanterm} Years</td>
              <td>{formatter.format(data.monthlypayment)}</td>
              <td>
                {/* <button onClick={() => editHandler(data.home_id)}>
                  Edit
                </button> */}
                <Popup trigger={<button> Edit </button>} modal nested>
                  {
                    // @ts-ignore
                    (close) => (
                      <div className='modal'>
                        <div className='content'>
                          <InputForm
                            text='Name'
                            placeholder={data.name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                          <InputForm
                            text='Address'
                            placeholder={data.address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          {/* <button onClick={() => close()}>Save</button> */}
                          <button onClick={() => {editHandler(data.home_id),close()}}>
                            Confirm Change
                          </button>

                          <button onClick={() => close()}>Close</button>
                        </div>
                      </div>
                    )
                  }
                </Popup>
              </td>
              <td>
                <button onClick={() => deleteHandler(data.home_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default History;
