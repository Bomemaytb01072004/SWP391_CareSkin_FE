import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import bgImage from '../../assets/bg-login.png';

const UserProfile = () => {
  const [user, setUser] = useState({
    CustomerId: null,
    UserName: '',
    Email: '',
    FullName: '',
    Phone: '',
    Dob: '',
    Gender: '',
    PictureUrl: '',
    Address: '',
  });

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [CustomerId, setCustomerId] = useState(
    localStorage.getItem('CustomerId')
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not logged in.');
      return;
    }

    if (!CustomerId) {
      try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.CustomerId) {
          setCustomerId(decodedToken.CustomerId);
          localStorage.setItem('CustomerId', decodedToken.CustomerId);
        } else {
          console.error('CustomerId not found in token');
          return; // Stop execution if no CustomerId
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        return;
      }
    }
  }, [token]);

  useEffect(() => {
    if (!CustomerId) {
      console.error('No CustomerId found, skipping API request.');
      return;
    }

    fetch(`http://careskinbeauty.shop:4456/api/Customer/${CustomerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUser({
          CustomerId: data.CustomerId,
          UserName: data.UserName,
          Email: data.Email || '',
          FullName: data.FullName || '',
          Phone: data.Phone || '',
          Dob: data.Dob ? data.Dob.split('T')[0] : '',
          Gender: data.Gender || '',
          PictureUrl: data.PictureUrl,
          Address: data.Address || '',
        });
      })
      .catch((error) => console.error('Error fetching profile:', error));
  }, [CustomerId, token]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('FullName', user.FullName);
    formData.append('Email', user.Email);
    formData.append('Phone', user.Phone);
    formData.append('Dob', user.Dob);
    formData.append('Gender', user.Gender);
    formData.append('Address', user.Address);
    formData.append('PictureFile', user.PictureUrl);

    if (selectedFile) {
      formData.append('PictureFile', selectedFile);
    }

    try {
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Customer/${CustomerId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseData = await response.json();
      console.log('Update response status:', response.status);
      console.log('Update response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      setMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen flex items-center justify-center bg-cover py-16 bg-center p-4"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-100 p-6">
            <div className="flex flex-col items-center">
              <img
                src={user.PictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
              />
              <h6>Upload your image</h6>
              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2 p-3"
                />
              )}
              <h2 className="mt-3 font-semibold text-lg">{user.FullName}</h2>
            </div>
            <div className="mt-6">
              <ul className="space-y-4">
                {['Account', 'Password', 'Order History', 'Notification'].map(
                  (tab) => (
                    <li
                      key={tab}
                      className="p-3 rounded-md cursor-pointer text-gray-700 hover:bg-gray-200 transition"
                    >
                      {tab}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-2/3 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Account Settings
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 text-sm">Full Name</label>
                <input
                  type="text"
                  name="FullName"
                  value={user.FullName}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full border p-2 rounded-md focus:ring ${
                    editMode ? 'focus:ring-blue-200' : 'bg-gray-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Email</label>
                <input
                  type="Email"
                  name="Email"
                  value={user.Email}
                  disabled
                  className="w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Phone Number</label>
                <input
                  type="text"
                  name="Phone"
                  value={user.Phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full border p-2 rounded-md focus:ring ${
                    editMode ? 'focus:ring-blue-200' : 'bg-gray-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Date of Birth</label>
                <input
                  type="date"
                  name="Dob"
                  value={user.Dob}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full border p-2 rounded-md focus:ring ${
                    editMode ? 'focus:ring-blue-200' : 'bg-gray-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Gender</label>
                <select
                  name="Gender"
                  value={user.Gender}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full border p-2 rounded-md focus:ring ${
                    editMode ? 'focus:ring-blue-200' : 'bg-gray-100'
                  }`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Address</label>
                <input
                  type="text"
                  name="Address"
                  value={user.Address}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full border p-2 rounded-md focus:ring ${
                    editMode ? 'focus:ring-blue-200' : 'bg-gray-100'
                  }`}
                />
              </div>
            </div>

            {/* Buttons */}
            {editMode && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Success/Error Message */}
            {message && (
              <p className="mt-3 text-center text-sm text-green-600">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
