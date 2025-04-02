import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, Edit } from "lucide-react";
import { fetchCustomers } from "../../utils/api";
import EditUserForm from "./EditUserForm";
import PaginationAdmin from '../Pagination/PaginationAdmin';
import { toast } from 'react-toastify';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UsersTable = ({ customers }) => {
  const [localCustomers, setLocalCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false); // Añadir estado de carga

  // Nueva función para refetch de datos
  const refetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setLocalCustomers(data);

      // Si hay un término de búsqueda activo, aplícalo a los nuevos datos
      if (searchTerm) {
        const filtered = data.filter(
          (customer) =>
            customer.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.Email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar useEffect inicial para usar refetchData
  useEffect(() => {
    refetchData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = localCustomers.filter(
      (customer) =>
        customer.FullName.toLowerCase().includes(term) ||
        customer.Email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (customerId) => {
    setEditingUser(customerId);
  };

  const handleClose = () => {
    setEditingUser(null);
  };

  // Actualizar handleUpdateCustomer para refetch después de actualizar
  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      // Actualizar UI inmediatamente para mejor experiencia de usuario
      setLocalCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.CustomerId === updatedCustomer.CustomerId
            ? updatedCustomer
            : customer
        )
      );

      if (searchTerm) {
        setFilteredUsers((prevFiltered) =>
          prevFiltered.map((customer) =>
            customer.CustomerId === updatedCustomer.CustomerId
              ? updatedCustomer
              : customer
          )
        );
      }

      // Refetch para asegurar datos actualizados
      await refetchData();
    } catch (error) {
      console.error('Error updating customer data:', error);
    }
  };

  // Actualizar handleDelete para refetch después de borrar
  const handleDelete = async (customerId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/delete/${customerId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');

      // Refetch después de eliminar
      await refetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const totalPages = Math.ceil(
    (searchTerm ? filteredUsers : localCustomers).length / usersPerPage
  );
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const dataToDisplay = searchTerm ? filteredUsers : localCustomers;
  const currentUsers = dataToDisplay.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      {editingUser && (
        <EditUserForm
          customerId={editingUser}
          onClose={handleClose}
          onUpdate={handleUpdateCustomer}
        />
      )}

      <motion.div
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Users</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="bg-gray-100 text-black placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Avatar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  DOB
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-300">
              {currentUsers.map((customer) => (
                <motion.tr
                  key={customer.CustomerId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {customer.PictureUrl ? (
                        <img
                          src={customer.PictureUrl}
                          alt={customer.FullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span>
                          {customer.FullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">
                      {customer.FullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {customer.Email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {customer.Gender && customer.Gender !== "Unknown"
                        ? customer.Gender
                        : "Not specified"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {customer.Dob ? customer.Dob : "Not provided"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.IsActive ? 'bg-green-800 text-green-100' : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {customer.IsActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <button
                      onClick={() => handleEdit(customer.CustomerId)}
                      className="text-blue-600 hover:text-blue-400 mr-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-400"
                      onClick={() => handleDelete(customer.CustomerId)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-300">
          <PaginationAdmin
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            theme="blue"
            maxVisiblePages={5}
          />
        </div>
      </motion.div>
    </>
  );
};

export default UsersTable;
