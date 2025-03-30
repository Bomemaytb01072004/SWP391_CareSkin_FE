import React, { useState, useEffect } from 'react';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const EditUserForm = ({ customerId, onClose }) => {
  const [user, setUser] = useState({
    FullName: '',
    Email: '',
    Phone: '',
    Dob: '',
    Gender: '',
    Address: '',
    PictureUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!customerId) return;

    fetch(`${backendUrl}/api/Customer/${customerId}`)
      .then((response) => response.json())
      .then((data) => {
        setUser({
          FullName: data.FullName || '',
          Email: data.Email || '',
          Phone: data.Phone || '',
          Dob: data.Dob ? data.Dob.split('T')[0] : '',
          Gender: data.Gender || '',
          Address: data.Address || '',
          PictureUrl: data.PictureUrl || '',
        });
      })
      .catch((error) => console.error('Error fetching user details:', error));
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

    const formData = new FormData();
    formData.append('FullName', user.FullName);
    formData.append('Phone', user.Phone);
    formData.append('Dob', user.Dob);
    formData.append('Gender', user.Gender);
    formData.append('Address', user.Address);

    if (selectedFile) {
      formData.append('PictureFile', selectedFile);
    }

    try {
      const response = await fetch(`${backendUrl}/api/Customer/${customerId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setMessage('User updated successfully!');
      setEditMode(false);
    } catch (error) {
      setMessage('Error updating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          {editMode ? 'Edit User Details' : 'User Details'}
        </h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={user.PictureUrl || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-600 text-sm">Full Name</label>
            <input
              type="text"
              name="FullName"
              value={user.FullName}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full border p-3 rounded-md text-gray-800 focus:ring ${
                editMode
                  ? 'focus:ring-blue-300 bg-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm">Email</label>
            <input
              type="email"
              name="Email"
              value={user.Email}
              disabled
              className="w-full border p-3 rounded-md bg-gray-100 text-gray-900 cursor-not-allowed"
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
              className={`w-full border p-3 rounded-md text-gray-800 focus:ring ${
                editMode
                  ? 'focus:ring-blue-300 bg-white'
                  : 'bg-gray-200 text-gray-900'
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
              className={`w-full border p-3 rounded-md text-gray-800 focus:ring ${
                editMode
                  ? 'focus:ring-blue-300 bg-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm">Gender</label>
            <select
              name="Gender"
              value={user.Gender}
              disabled
              className="w-full border p-3 rounded-md bg-gray-100 text-gray-900 cursor-not-allowed"
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
              className={`w-full border p-3 rounded-md text-gray-800 focus:ring ${
                editMode
                  ? 'focus:ring-blue-300 bg-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Profile Picture Upload */}
        {editMode && (
          <div className="mt-4">
            <label className="text-gray-600 text-sm">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border p-3 rounded-md"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-gray-700 text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          {editMode && (
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-5 py-2 rounded-md hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <p className="mt-3 text-center text-sm text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default EditUserForm;
