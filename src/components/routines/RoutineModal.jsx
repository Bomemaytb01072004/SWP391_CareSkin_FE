import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle } from 'lucide-react'; // Import thêm CheckCircle icon
import { toast } from 'react-toastify';
import { fetchSkinTypes } from '../../utils/api';
import { createRoutine, updateRoutine } from '../../utils/apiOfRoutine';

const RoutineModal = ({ isOpen, onClose, routine = null, refetchRoutines }) => {
  const [skinTypes, setSkinTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // State mới cho thông báo thành công
  const [successMessage, setSuccessMessage] = useState(''); // Nội dung thông báo
  const [routineData, setRoutineData] = useState({
    RoutineId: 0,
    RoutineName: '',
    RoutinePeriod: 'morning', // Default value
    Description: '',
    SkinTypeId: '',
    IsActive: true,
    RoutineStepDTOs: []
  });

  const isEditMode = routine !== null;

  useEffect(() => {
    const loadSkinTypes = async () => {
      try {
        const data = await fetchSkinTypes();
        setSkinTypes(data);
      } catch (error) {
        console.error('Error loading skin types:', error);
        toast.error('Failed to load skin types.');
      }
    };

    if (isOpen) {
      loadSkinTypes();

      if (isEditMode && routine) {
        setRoutineData({
          RoutineId: routine.RoutineId,
          RoutineName: routine.RoutineName || '',
          RoutinePeriod: routine.RoutinePeriod || 'morning',
          Description: routine.Description || '',
          SkinTypeId: routine.SkinTypeId || '',
          IsActive: routine.IsActive !== undefined ? routine.IsActive : true,
          RoutineStepDTOs: routine.RoutineStepDTOs || []
        });
      } else {
        setRoutineData({
          RoutineId: 0,
          RoutineName: 'Routine for ', // Initialize with the required prefix
          RoutinePeriod: 'morning',
          Description: '',
          SkinTypeId: '',
          IsActive: true,
          RoutineStepDTOs: []
        });
      }
    }
  }, [isOpen, isEditMode, routine]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "RoutineName") {
      if (!value.startsWith("Routine for ")) {
        if ("Routine for ".startsWith(value)) {
          setRoutineData({
            ...routineData,
            [name]: "Routine for "
          });
        } else {
          setRoutineData({
            ...routineData,
            [name]: "Routine for " + value.replace(/^Routine for /i, '')
          });
        }
      } else {
        setRoutineData({
          ...routineData,
          [name]: value
        });
      }
    } else {
      setRoutineData({
        ...routineData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!routineData.RoutineName || !routineData.SkinTypeId || !routineData.RoutinePeriod) {
      toast.error('Please fill all required fields');
      return;
    }

    let finalRoutineName = routineData.RoutineName;
    if (!finalRoutineName.startsWith("Routine for ")) {
      finalRoutineName = "Routine for " + finalRoutineName;
    }

    if (finalRoutineName === "Routine for " || finalRoutineName.trim() === "Routine for") {
      toast.error('Please complete the routine name after "Routine for "');
      return;
    }

    if (!routineData.Description || routineData.Description.length < 20) {
      toast.error('Description must be at least 20 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const formattedData = {
        RoutineName: finalRoutineName,
        RoutinePeriod: routineData.RoutinePeriod,
        Description: routineData.Description,
        SkinTypeId: parseInt(routineData.SkinTypeId, 10),
        IsActive: routineData.IsActive
      };

      // Gọi API dựa trên mode
      if (isEditMode) {
        await updateRoutine(routine.RoutineId, formattedData);
      } else {
        await createRoutine(formattedData);
      }
      
      // Gọi refetchRoutines trước khi đóng modal
      if (typeof refetchRoutines === 'function') {
        await refetchRoutines();
      }

      // Đóng modal ngay lập tức
      onClose();
      
      // Sau đó hiển thị toast sau khi modal đã đóng
      const message = isEditMode ? 'Routine updated successfully!' : 'Routine created successfully!';
      toast.success(message, {
        position: 'top-right',
        autoClose: 5000
      });
    } catch (error) {
      console.error('Error saving routine:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} routine: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white text-black rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {showSuccess && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-10 p-6 rounded-lg">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">{successMessage}</h3>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        )}

        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h3 className="text-xl font-semibold">
            {isEditMode ? 'Edit Routine' : 'Create New Routine'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Routine Name * <span className="text-xs text-gray-500">(must start with "Routine for")</span>
              </label>
              <input
                type="text"
                name="RoutineName"
                value={routineData.RoutineName}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Routine for [skin type] [time period]"
                required
              />
              {!routineData.RoutineName.startsWith("Routine for ") && (
                <p className="text-red-500 text-xs mt-1">Name must start with "Routine for"</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Period *
              </label>
              <select
                name="RoutinePeriod"
                value={routineData.RoutinePeriod}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Select Period</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Skin Type *
              </label>
              <select
                name="SkinTypeId"
                value={routineData.SkinTypeId}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Select Skin Type</option>
                {skinTypes
                  .filter((type) => type.IsActive)
                  .map((type) => (
                    <option key={type.SkinTypeId} value={type.SkinTypeId}>
                      {type.TypeName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Description
              </label>
              <textarea
                name="Description"
                value={routineData.Description}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black h-32"
                placeholder="Enter routine description"
              />
            </div>
          </div>

          {/* Note about steps */}
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              <b>Note:</b> Steps and products can be added after creating the routine. This form is for setting up the basic routine information.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-black rounded-md mr-2 hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-1" />
                  {isEditMode ? 'Update' : 'Create'} Routine
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoutineModal;
