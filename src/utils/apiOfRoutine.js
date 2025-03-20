// apiOfRoutine.js
const apiBaseURL = 'http://careskinbeauty.shop:4456';
const apiURLRoutines = `${apiBaseURL}/api/routines`;
const apiURLRoutineProducts = `${apiBaseURL}/api/RoutineProduct`;
const apiURLRoutineSteps = `${apiBaseURL}/api/routine-steps`;

/* ===============================
        ROUTINES API
================================== */
// Fetch all routines
export async function fetchRoutines() {
  try {
    const response = await fetch(apiURLRoutines);
    if (!response.ok) throw new Error('Error fetching routines');
    return await response.json();
  } catch (error) {
    console.error('Error fetching routines:', error);
    throw error;
  }
}

// Fetch active routines
export async function fetchActiveRoutines() {
  try {
    const response = await fetch(`${apiURLRoutines}/active`);
    if (!response.ok) throw new Error('Error fetching active routines');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active routines:', error);
    throw error;
  }
}

// Fetch inactive routines
export async function fetchInactiveRoutines() {
  try {
    const response = await fetch(`${apiURLRoutines}/inactive`);
    if (!response.ok) throw new Error('Error fetching inactive routines');
    return await response.json();
  } catch (error) {
    console.error('Error fetching inactive routines:', error);
    throw error;
  }
}

// Fetch routine by ID
export async function fetchRoutineById(id) {
  try {
    const response = await fetch(`${apiURLRoutines}/${id}`);
    if (!response.ok) throw new Error(`Error fetching routine with id ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching routine with id ${id}:`, error);
    throw error;
  }
}

// Fetch routines by skin type
export async function fetchRoutinesBySkinType(skinTypeId) {
  try {
    const response = await fetch(`${apiURLRoutines}/skinType/${skinTypeId}`);
    if (!response.ok) throw new Error(`Error fetching routines for skin type ${skinTypeId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching routines for skin type ${skinTypeId}:`, error);
    throw error;
  }
}

// Create a routine
export async function createRoutine(routineData) {
  try {
    const formattedData = {
      RoutineName: routineData.RoutineName,
      RoutinePeriod: routineData.RoutinePeriod,
      Description: routineData.Description,
      SkinTypeId: routineData.SkinTypeId
    };

    const response = await fetch(apiURLRoutines, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) throw new Error('Error creating routine');
    return await response.json();
  } catch (error) {
    console.error('Error creating routine:', error);
    throw error;
  }
}

// Update a routine
export async function updateRoutine(id, routineData) {
  try {
    const response = await fetch(`${apiURLRoutines}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routineData),
    });
    if (!response.ok) throw new Error(`Error updating routine with id ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating routine with id ${id}:`, error);
    throw error;
  }
}

// Delete a routine
export async function deleteRoutine(id) {
  try {
    const response = await fetch(`${apiURLRoutines}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error deleting routine with id ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting routine with id ${id}:`, error);
    throw error;
  }
}

/* ===============================
        ROUTINE STEPS API
================================== */
// Fetch all routine steps for a routine
export async function fetchRoutineSteps(routineId) {
  try {
    const response = await fetch(`${apiURLRoutineSteps}/routine/${routineId}`);
    if (!response.ok) throw new Error(`Error fetching steps for routine ${routineId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching steps for routine ${routineId}:`, error);
    throw error;
  }
}

// Alias for fetchRoutineSteps to maintain backward compatibility
export const fetchRoutineStepsByRoutineId = fetchRoutineSteps;

// Create a routine step
export async function createRoutineStep(stepData) {
  try {
    const formattedData = {
      RoutineId: stepData.RoutineId,
      StepOrder: stepData.StepOrder,
      StepName: stepData.StepName,
      Description: stepData.Description
    };

    console.log('Sending to API:', formattedData);
    const response = await fetch(apiURLRoutineSteps, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) throw new Error('Error creating routine step');
    return await response.json();
  } catch (error) {
    console.error('Error creating routine step:', error);
    throw error;
  }
}

// Update a routine step
  export async function updateRoutineStep(id, stepData) {
    try {
      const response = await fetch(`${apiURLRoutineSteps}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData),
      });
      if (!response.ok) throw new Error(`Error updating routine step with id ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error updating routine step with id ${id}:`, error);
      throw error;
    }
  }

// Delete a routine step
export async function deleteRoutineStep(id) {
  try {
    const response = await fetch(`${apiURLRoutineSteps}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error deleting routine step with id ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting routine step with id ${id}:`, error);
    throw error;
  }
}

/* ===============================
        ROUTINE PRODUCTS API
================================== */
// Fetch all routine products for a routine step
export async function fetchRoutineProducts(routineStepId) {
  try {
    const response = await fetch(`${apiURLRoutineProducts}/routineStep/${routineStepId}`);
    if (!response.ok) throw new Error(`Error fetching products for routine step ${routineStepId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products for routine step ${routineStepId}:`, error);
    throw error;
  }
}

// Alias for fetchRoutineProducts to maintain backward compatibility
export const fetchRoutineProductsByStepId = fetchRoutineProducts;

// Fetch all routine products for a routine
export async function fetchRoutineProductsByRoutine(routineId) {
  try {
    const response = await fetch(`${apiURLRoutineProducts}/routine/${routineId}`);
    if (!response.ok) throw new Error(`Error fetching products for routine ${routineId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products for routine ${routineId}:`, error);
    throw error;
  }
}

// Add a product to a routine step (renamed to createRoutineProduct for consistency)
export async function createRoutineProduct(productData) {
  try {
    const formattedData = {
      RoutineStepId: productData.RoutineStepId,
      ProductId: productData.ProductId
    };

    const response = await fetch(apiURLRoutineProducts, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    if (!response.ok) throw new Error('Error adding product to routine step');
    return await response.json();
  } catch (error) {
    console.error('Error adding product to routine step:', error);
    throw error;
  }
}

// Update a routine product
export async function updateRoutineProduct(id, productData) {
  try {
    const response = await fetch(`${apiURLRoutineProducts}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error(`Error updating routine product with id ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating routine product with id ${id}:`, error);
    throw error;
  }
}

// Remove a product from a routine step
export async function removeProductFromRoutineStep(id) {
  try {
    const response = await fetch(`${apiURLRoutineProducts}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error removing routine product with id ${id}`);
    return true;
  } catch (error) {
    console.error(`Error removing routine product with id ${id}:`, error);
    throw error;
  }
}

// Alias for removeProductFromRoutineStep to maintain backward compatibility
export const deleteRoutineProduct = removeProductFromRoutineStep;

export default {
  fetchRoutines,
  fetchActiveRoutines,
  fetchInactiveRoutines,
  fetchRoutineById,
  fetchRoutinesBySkinType,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  fetchRoutineSteps,
  fetchRoutineStepsByRoutineId,
  createRoutineStep,
  updateRoutineStep,
  deleteRoutineStep,
  fetchRoutineProducts,
  fetchRoutineProductsByStepId,
  fetchRoutineProductsByRoutine,
  createRoutineProduct,
  updateRoutineProduct,
  removeProductFromRoutineStep,
  deleteRoutineProduct,
};
