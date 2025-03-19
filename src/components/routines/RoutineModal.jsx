import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchSkinTypes } from '../../utils/api';
import { createRoutine, updateRoutine } from '../../utils/apiOfRoutine';

const RoutineModal = ({ isOpen, onClose, routine = null, refetchRoutines }) => {
  const [skinTypes, setSkinTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
        console.log('Skin Types data:', data);
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
        // Reset form for create mode
        setRoutineData({
          RoutineId: 0,
          RoutineName: '',
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
    setRoutineData({
      ...routineData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!routineData.RoutineName || !routineData.SkinTypeId || !routineData.RoutinePeriod) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Format data for API
      const formattedData = {
        RoutineName: routineData.RoutineName,
        RoutinePeriod: routineData.RoutinePeriod,
        Description: routineData.Description,
        SkinTypeId: parseInt(routineData.SkinTypeId, 10)
      };

      if (isEditMode) {
        await updateRoutine(routine.RoutineId, formattedData);
        toast.success('Routine updated successfully!');
      } else {
        await createRoutine(formattedData);
        toast.success('Routine created successfully!');
      }
      
      if (refetchRoutines) {
        refetchRoutines();
      }
      onClose();
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
      <div className="relative bg-gray-800 text-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold">
            {isEditMode ? 'Edit Routine' : 'Create New Routine'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Routine Name *
              </label>
              <input
                type="text"
                name="RoutineName"
                value={routineData.RoutineName}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter routine name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Period *
              </label>
              <select
                name="RoutinePeriod"
                value={routineData.RoutinePeriod}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="">Select Period</option>
                <option value="morning">Morning</option>
                <option value="night">Night</option>
                <option value="all-day">All Day</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Skin Type *
              </label>
              <select
                name="SkinTypeId"
                value={routineData.SkinTypeId}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              >
                <option value="">Select Skin Type</option>
                {skinTypes.map((type) => {
                  return (
                    <option key={type.SkinTypeId} value={type.SkinTypeId}>
                      {type.TypeName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="Description"
                value={routineData.Description}
                onChange={handleInputChange}
                className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white h-32"
                placeholder="Enter routine description"
              />
            </div>

            {/* <div className="flex items-center">
              <input
                type="checkbox"
                name="IsActive"
                id="isActive"
                checked={routineData.IsActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-gray-300"
              >
                Active
              </label>
            </div> */}
          </div>

          {/* Note about steps */}
          <div className="bg-gray-700 p-4 rounded-md">
            <p className="text-sm text-gray-300">
              <b>Note:</b> Steps and products can be added after creating the routine. This form is for setting up the basic routine information.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md mr-2 hover:bg-gray-500"
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
