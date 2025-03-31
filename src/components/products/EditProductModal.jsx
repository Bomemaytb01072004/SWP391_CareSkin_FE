import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function EditProductModal({
    editProductState,
    setEditProduct,
    brandList,
    brandNameInputEdit,
    setBrandNameInputEdit,
    showBrandSuggestionsEdit,
    setShowBrandSuggestionsEdit,
    showCategorySuggestions,
    setShowCategorySuggestions,
    previewUrlEdit,
    setPreviewUrlEdit,
    previewUrlAdditionalImagesEditState,
    handleRemoveExistingAdditionalImage,
    handleAdditionalImagesChangeEdit,
    handleEdit,
    onClose,
    skinTypeList,
    handleRemoveEditVariation,
    handleRemoveEditSkinType,
    handleRemoveEditUsage,
    handleRemoveEditMainIngredient,
    handleRemoveEditDetailIngredient,
}) {
    if (!editProductState) return null;

    const popularCategories = [
        "Cleanser",
        "Toner",
        "Moisturiser",
        "Serum",
        "Sunscreen",
    ];

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!editProductState.ProductName?.trim()) {
            newErrors.ProductName = 'Product name is required';
        } else if (editProductState.ProductName.trim().length < 3) {
            newErrors.ProductName = 'Product name must be at least 3 characters';
        } else if (editProductState.ProductName.trim().length > 100) {
            newErrors.ProductName = 'Product name must be less than 100 characters';
        }

        if (!editProductState.Category?.trim()) {
            newErrors.Category = 'Category is required';
        }

        const selectedBrand = brandList.find(
            b => b.Name.toLowerCase() === brandNameInputEdit.toLowerCase()
        );
        if (!selectedBrand) {
            newErrors.Brand = 'Please select from suggestions or create a new brand in Brands page';
        }

        if (!editProductState.ProductForSkinTypes || editProductState.ProductForSkinTypes.length === 0) {
            newErrors.SkinTypes = 'At least one Skin Type is required';
        } else {
            const skinTypesErrors = [];
            let hasInvalidSkinType = false;

            editProductState.ProductForSkinTypes.forEach((st, index) => {
                if (!st.TypeName || !skinTypeList.some(
                    skinType => skinType.TypeName.toLowerCase() === st.TypeName.toLowerCase()
                )) {
                    if (!skinTypesErrors[index]) skinTypesErrors[index] = {};
                    skinTypesErrors[index].TypeName = 'Please select from suggestions or create a new skin type in Skin Types page';
                    hasInvalidSkinType = true;
                }
            });

            if (hasInvalidSkinType) {
                newErrors.ProductForSkinTypes = skinTypesErrors;
            }
        }

        if (!editProductState.Variations || editProductState.Variations.length === 0) {
            newErrors.Variations = 'At least one variation is required';
        } else {
            const variationErrors = [];
            let hasVariationError = false;

            editProductState.Variations.forEach((variation, index) => {
                const varError = {};
                if (variation.Ml <= 0) {
                    varError.Ml = 'Volume must be greater than 0';
                    hasVariationError = true;
                }
                if (variation.Price <= 0) {
                    varError.Price = 'Price must be greater than 0';
                    hasVariationError = true;
                }
                if (Object.keys(varError).length > 0) {
                    variationErrors[index] = varError;
                }
            });

            if (hasVariationError) {
                newErrors.Variations = variationErrors;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmitEdit = () => {
        if (!validateForm()) {
            return;
        }
        handleEdit();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center overflow-y-auto backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="relative mt-5 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-7xl max-h-[90vh] overflow-y-scroll m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Edit Product
                    </h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="block mb-1 text-gray-700 font-semibold">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="ProductName"
                            className={`p-2 border ${errors.ProductName ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`}
                            value={editProductState.ProductName || ''}
                            autoFocus
                            onChange={(e) =>
                                setEditProduct({ ...editProductState, ProductName: e.target.value })
                            }
                        />
                        {errors.ProductName && (
                            <p className="text-red-500 text-sm mt-1">{errors.ProductName}</p>
                        )}
                    </div>

                    <div className="flex flex-col relative">
                        <label className="block mb-1 text-gray-700 font-semibold">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Category"
                            className={`p-2 border ${errors.Category ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`}
                            value={editProductState.Category || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEditProduct({ ...editProductState, Category: val });
                                setShowCategorySuggestions(!!val);
                            }}
                        />
                        {errors.Category && (
                            <span className="text-red-500 text-sm">{errors.Category}</span>
                        )}
                        {showCategorySuggestions && editProductState.Category && (
                            <ul className="absolute mt-[70px] w-full text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                                {popularCategories
                                    .filter((cat) =>
                                        cat.toLowerCase().includes(editProductState.Category.toLowerCase())
                                    )
                                    .map((category, index) => (
                                        <li
                                            key={index}
                                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                setEditProduct({ ...editProductState, Category: category });
                                                setShowCategorySuggestions(false);
                                            }}
                                        >
                                            {category}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="relative col-span-2">
                    <label className="block mb-1 text-gray-700 font-semibold">
                        Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Search brand name..."
                        className={`w-full p-2 border ${errors.Brand ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg mb-3`}
                        value={brandNameInputEdit}
                        onChange={(e) => {
                            const val = e.target.value;
                            setBrandNameInputEdit(val);
                            setShowBrandSuggestionsEdit(!!val);
                            setEditProduct((prev) => ({
                                ...prev,
                                BrandName: val,
                            }));
                        }}
                    />
                    {errors.Brand && (
                        <p className="text-red-500 text-sm mt-1">{errors.Brand}</p>
                    )}
                    {showBrandSuggestionsEdit && brandNameInputEdit && (
                        <ul className="absolute left-0 right-0 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-30">
                            {brandList
                                .filter((b) =>
                                    b.IsActive && b.Name.toLowerCase().includes(brandNameInputEdit.toLowerCase())
                                )
                                .map((brand) => (
                                    <li
                                        key={brand.BrandId}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setEditProduct((prev) => ({
                                                ...prev,
                                                BrandName: brand.Name,
                                                BrandId: brand.BrandId,
                                            }));
                                            setBrandNameInputEdit(brand.Name);
                                            setShowBrandSuggestionsEdit(false);
                                        }}
                                    >
                                        {brand.Name}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>

                <div className="relative col-span-2">
                    <label className="block mb-1 text-gray-700 font-semibold">Image</label>
                    <div className="flex flex-row items-center gap-4 mb-3">
                        {previewUrlEdit ? (
                            <a
                                href={previewUrlEdit}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-40 h-40 border border-gray-300"
                            >
                                <img
                                    src={previewUrlEdit}
                                    alt="Preview new upload"
                                    className="w-full h-full object-cover rounded"
                                />
                            </a>
                        ) : editProductState.PictureUrl ? (
                            <Link
                                to={editProductState.PictureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block w-40 h-40 border border-gray-300"
                            >
                                <img
                                    src={editProductState.PictureUrl}
                                    alt="Current product image"
                                    className="w-full h-full object-cover rounded"
                                />
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-500">No image available</span>
                        )}

                        <label
                            htmlFor="file-upload-edit"
                            className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                        >
                            <span className="text-2xl text-gray-400">+</span>
                            <span className="text-sm text-gray-500 mt-1">
                                Replace product image
                            </span>
                        </label>

                        <input
                            id="file-upload-edit"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    setEditProduct((prev) => ({
                                        ...prev,
                                        PictureFile: file,
                                    }));
                                    const preview = URL.createObjectURL(file);
                                    setPreviewUrlEdit(preview);
                                }
                            }}
                        />
                    </div>
                </div>


                <div className="mt-2 relative col-span-2">
                    <label className="block mb-1 text-gray-700 font-semibold">
                        Additional images
                    </label>
                    <div className="flex flex-row items-center gap-4 mb-3">
                        {previewUrlAdditionalImagesEditState && previewUrlAdditionalImagesEditState.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {previewUrlAdditionalImagesEditState.map((url, index) => (
                                    <div
                                        key={index}
                                        className="relative w-40 h-40 border border-gray-300 rounded overflow-hidden"
                                    >
                                        <Link
                                            to={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block w-40 h-40 border border-gray-300"
                                        >
                                            <img
                                                src={url}
                                                alt={`Additional ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingAdditionalImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label
                            htmlFor="file-upload-additional-edit"
                            className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                        >
                            <span className="text-2xl text-gray-400">+</span>
                            <span className="text-sm text-gray-500 mt-1">
                                {previewUrlAdditionalImagesEditState && previewUrlAdditionalImagesEditState.length > 0
                                    ? "Add additional image"
                                    : "Upload image"}
                            </span>
                        </label>

                        <input
                            id="file-upload-additional-edit"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleAdditionalImagesChangeEdit}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Skin Types <span className="text-red-500">*</span></h4>
                        <button
                            onClick={() =>
                                setEditProduct((prev) => ({
                                    ...prev,
                                    ProductForSkinTypes: [
                                        ...(prev.ProductForSkinTypes || []),
                                        { ProductForSkinTypeId: '', SkinTypeId: '', TypeName: '', showSuggestions: false },
                                    ],
                                }))
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                            + Add Skin Type
                        </button>
                    </div>

                    {errors.SkinTypes && typeof errors.SkinTypes === 'string' && (
                        <p className="text-red-500 text-sm mb-2">{errors.SkinTypes}</p>
                    )}

                    {(editProductState.ProductForSkinTypes || []).map((item, index) => (
                        <div key={index} className="relative flex gap-2 mb-2 items-center">
                            <input
                                type="text"
                                placeholder="Skin type..."
                                className={`w-full p-2 border ${errors.ProductForSkinTypes?.[index]?.TypeName ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`}
                                value={item.TypeName || ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEditProduct((prev) => {
                                        const updated = [...prev.ProductForSkinTypes];
                                        updated[index] = {
                                            ...updated[index],
                                            TypeName: val,
                                            showSuggestions: !!val,
                                        };
                                        return { ...prev, ProductForSkinTypes: updated };
                                    });
                                }}
                            />
                            {errors.ProductForSkinTypes?.[index]?.TypeName && (
                                <span className="text-red-500 text-sm">{errors.ProductForSkinTypes[index].TypeName}</span>
                            )}

                            {item.showSuggestions && item.TypeName && (
                                <ul className="absolute mt-20 left-0 right-0 z-100 bg-white border border-gray-300 rounded-lg shadow-lg max-w-[940px] max-h-40 overflow-y-auto">
                                    {skinTypeList
                                        .filter((s) =>
                                            s.IsActive && s.TypeName.toLowerCase().includes(item.TypeName.toLowerCase())
                                        )
                                        .map((s) => (
                                            <li
                                                key={s.SkinTypeId}
                                                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setEditProduct((prev) => {
                                                        const updated = [...prev.ProductForSkinTypes];
                                                        updated[index] = {
                                                            ProductForSkinTypeId: '',
                                                            SkinTypeId: s.SkinTypeId,
                                                            TypeName: s.TypeName,
                                                            showSuggestions: false,
                                                        };
                                                        return { ...prev, ProductForSkinTypes: updated };
                                                    });
                                                }}
                                            >
                                                {s.TypeName}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            <button
                                onClick={() => {
                                    handleRemoveEditSkinType(index)
                                }}
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Variations <span className="text-red-500">*</span></h4>
                        <button
                            onClick={() =>
                                setEditProduct((prev) => ({
                                    ...prev,
                                    Variations: [
                                        ...prev.Variations,
                                        { ProductVariationId: '', Ml: 0, Price: 0 },
                                    ],
                                }))
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                            + Add Variation
                        </button>
                    </div>

                    {errors.Variations && typeof errors.Variations === 'string' && (
                        <p className="text-red-500 text-sm mb-2">{errors.Variations}</p>
                    )}

                    {editProductState.Variations?.map((variation, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <div className="flex flex-col w-1/2">
                                <label className="text-sm font-medium text-gray-700">Ml</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Ml"
                                    className={`p-1 border ${errors.Variations?.[index]?.Ml ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded`}
                                    value={variation.Ml}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.Variations];
                                            updated[index] = {
                                                ...updated[index],
                                                Ml: parseFloat(e.target.value) || 0,
                                            };
                                            return { ...prev, Variations: updated };
                                        })
                                    }
                                />
                                {errors.Variations?.[index]?.Ml && (
                                    <p className="text-red-500 text-xs mt-1">{errors.Variations[index].Ml}</p>
                                )}
                            </div>

                            <div className="flex flex-col w-1/2">
                                <label className="text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Price"
                                    className={`p-1 border ${errors.Variations?.[index]?.Price ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded`}
                                    value={variation.Price}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.Variations];
                                            updated[index] = {
                                                ...updated[index],
                                                Price: parseFloat(e.target.value) || 0,
                                            };
                                            return { ...prev, Variations: updated };
                                        })
                                    }
                                />
                                {errors.Variations?.[index]?.Price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.Variations[index].Price}</p>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    handleRemoveEditVariation(index)
                                }}
                                className="mt-3  px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Main Ingredients</h4>
                        <button
                            onClick={() =>
                                setEditProduct((prev) => ({
                                    ...prev,
                                    MainIngredients: [
                                        ...prev.MainIngredients,
                                        {
                                            ProductMainIngredientId: '',
                                            IngredientName: '',
                                            Description: '',
                                        },
                                    ],
                                }))
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                            + Add Main Ingredient
                        </button>
                    </div>
                    {editProductState.MainIngredients?.map((ing, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <div className="flex flex-col w-1/2">
                                <label className="text-sm font-medium text-gray-700">Ingredient Name</label>
                                <textarea
                                    placeholder="IngredientName"
                                    className="p-1 border border-gray-300 text-gray-900 rounded h-24 resize-none overflow-auto"
                                    value={ing.IngredientName}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.MainIngredients];
                                            updated[index] = {
                                                ...updated[index],
                                                IngredientName: e.target.value,
                                            };
                                            return { ...prev, MainIngredients: updated };
                                        })
                                    }
                                />
                            </div>

                            <div className="flex flex-col w-1/2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    placeholder="Description"
                                    className="p-1 border border-gray-300 text-gray-900 rounded h-24 resize-none overflow-auto"
                                    value={ing.Description}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.MainIngredients];
                                            updated[index] = {
                                                ...updated[index],
                                                Description: e.target.value,
                                            };
                                            return { ...prev, MainIngredients: updated };
                                        })
                                    }
                                />
                            </div>

                            <button
                                onClick={() => {
                                    handleRemoveEditMainIngredient(index)
                                }}
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Detail Ingredients</h4>
                        <button
                            onClick={() =>
                                setEditProduct((prev) => ({
                                    ...prev,
                                    DetailIngredients: [
                                        ...prev.DetailIngredients,
                                        { ProductDetailIngredientId: '', IngredientName: '' },
                                    ],
                                }))
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                            + Add Detail Ingredient
                        </button>
                    </div>
                    {editProductState.DetailIngredients?.map((ing, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <div className="flex flex-col w-full">
                                <label className="text-sm font-medium text-gray-700">Ingredient Name</label>
                                <textarea
                                    placeholder="IngredientName"
                                    className="w-full p-1 border border-gray-300 text-gray-900 rounded"
                                    value={ing.IngredientName}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.DetailIngredients];
                                            updated[index] = {
                                                ...updated[index],
                                                IngredientName: e.target.value,
                                            };
                                            return { ...prev, DetailIngredients: updated };
                                        })
                                    }
                                    rows={2}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    handleRemoveEditDetailIngredient(index)
                                }}
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Usages</h4>
                        <button
                            onClick={() =>
                                setEditProduct((prev) => ({
                                    ...prev,
                                    Usages: [
                                        ...prev.Usages,
                                        { ProductUsageId: '', Step: 1, Instruction: '' },
                                    ],
                                }))
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                            + Add Usage
                        </button>
                    </div>
                    {editProductState.Usages?.map((usage, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <div className="flex flex-col w-1/2">
                                <label className="text-sm font-medium text-gray-700">Step</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Step"
                                    className="p-1 border border-gray-300 text-gray-900 rounded"
                                    value={usage.Step}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.Usages];
                                            updated[index] = {
                                                ...updated[index],
                                                Step: parseInt(e.target.value) || 1,
                                            };
                                            return { ...prev, Usages: updated };
                                        })
                                    }
                                />
                            </div>

                            <div className="flex flex-col w-1/2">
                                <label className="text-sm font-medium text-gray-700">Instruction</label>
                                <input
                                    type="text"
                                    placeholder="Instruction"
                                    className="p-1 border border-gray-300 text-gray-900 rounded"
                                    value={usage.Instruction}
                                    onChange={(e) =>
                                        setEditProduct((prev) => {
                                            const updated = [...prev.Usages];
                                            updated[index] = {
                                                ...updated[index],
                                                Instruction: e.target.value,
                                            };
                                            return { ...prev, Usages: updated };
                                        })
                                    }
                                />
                            </div>

                            <button
                                onClick={() => {
                                    handleRemoveEditUsage(index)
                                }}
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <button
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={onSubmitEdit}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditProductModal;
