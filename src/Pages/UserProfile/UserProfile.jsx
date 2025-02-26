import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import bgImage from '../../assets/bg-login.png';

const UserProfile = () => {
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    profilePicture: '',
    address: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const customerId = localStorage.getItem('customerId'); // Get user ID from localStorage

  useEffect(() => {
    if (!customerId) {
      console.error('No customer ID found. User is not logged in.');
      return;
    }

    fetch(`/api/Customer/get-profile/${customerId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setUser(data))
      .catch((error) => console.error('Error fetching profile:', error));
  }, [customerId]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');

    const updatedUser = {
      FullName: user.fullName,
      Email: user.email,
      Phone: user.phone,
      Dob: user.dob,
      Gender: user.gender,
      Address: user.address,
    };

    try {
      const response = await fetch(
        `/api/Customer/update-profile/${customerId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        }
      );

      if (!response.ok) throw new Error('Failed to update profile');

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
                src={user.profilePicture || 'https://via.placeholder.com/80'}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
              />
              <h2 className="mt-3 font-semibold text-lg">{user.fullName}</h2>
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
                  name="fullName"
                  value={user.fullName}
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
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  className="w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={user.phone}
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
                  name="dob"
                  value={user.dob}
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
                  name="gender"
                  value={user.gender}
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
                  name="address"
                  value={user.address}
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
