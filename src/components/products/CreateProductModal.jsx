import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function CreateProductModal({
    // State + hàm setState do cha (ProductsTable) truyền xuống
    newProduct,
    setNewProduct,
    brandList,
    brandNameInput,
    setBrandNameInput,
    showSuggestions,
    setShowSuggestions,
    skinTypeList,

    // Upload file + preview
    previewUrlNewUpload,
    setPreviewUrlNewUpload,
    previewUrlAdditionalImages,

    // Handler xóa ảnh / thêm ảnh / submit ...
    handleRemoveAdditionalImage,
    handleAdditionalImagesChange,
    handleAddProduct,

    // Hàm đóng modal
    onClose,
}) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl overflow-auto z-[10000]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Add New Product
                    </h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="ProductName"
                        className="p-2 border border-gray-300 text-gray-900 rounded-lg"
                        value={newProduct.ProductName}
                        autoFocus
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, ProductName: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        className="p-2 border border-gray-300 text-gray-900 rounded-lg"
                        value={newProduct.Category}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, Category: e.target.value })
                        }
                    />

                    {/* Brand - autocomplete */}
                    <div className="relative col-span-2">
                        <label className="block mb-1 text-gray-700 font-semibold">
                            Brand
                        </label>
                        <input
                            type="text"
                            placeholder="Search brand name..."
                            className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                            value={brandNameInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setBrandNameInput(val);
                                setShowSuggestions(!!val);
                            }}
                        />
                        {showSuggestions && brandNameInput && (
                            <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                                {brandList
                                    .filter((b) =>
                                        b.Name.toLowerCase().includes(brandNameInput.toLowerCase())
                                    )
                                    .map((brand) => (
                                        <li
                                            key={brand.BrandId}
                                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                setNewProduct({ ...newProduct, BrandId: brand.BrandId });
                                                setBrandNameInput(brand.Name);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            {brand.Name}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    {/* File upload */}
                    <div className="relative col-span-2">
                        <label className="block mb-1 text-gray-700 font-semibold">
                            Image
                        </label>
                        <div className="flex flex-row items-center gap-4">
                            {previewUrlNewUpload ? (
                                <a
                                    href={previewUrlNewUpload}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-40 h-40 border border-gray-300"
                                >
                                    <img
                                        src={previewUrlNewUpload}
                                        alt="Preview new upload"
                                        className="w-full h-full object-cover rounded"
                                    />
                                </a>
                            ) : (
                                newProduct.PictureFile &&
                                typeof newProduct.PictureFile === 'string' && (
                                    <Link
                                        to={newProduct.PictureFile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block w-40 h-40 border border-gray-300"
                                    >
                                        <img
                                            src={newProduct.PictureFile}
                                            alt="Current product image"
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </Link>
                                )
                            )}

                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                            >
                                <span className="text-2xl text-gray-400">
                                    {previewUrlNewUpload ||
                                        (newProduct.PictureFile && typeof newProduct.PictureFile === "string")
                                        ? ""
                                        : "+"}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {previewUrlNewUpload ||
                                        (newProduct.PictureFile && typeof newProduct.PictureFile === "string")
                                        ? "Replace image"
                                        : "Upload product image"}
                                </span>
                            </label>

                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setNewProduct({ ...newProduct, PictureFile: file });
                                        const preview = URL.createObjectURL(file);
                                        setPreviewUrlNewUpload(preview);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Additional images */}
                    <div className="mt-2 relative col-span-2">
                        <label className="block mb-1 text-gray-700 font-semibold">
                            Additional images
                        </label>
                        <div className="flex flex-row items-center gap-4">
                            {previewUrlAdditionalImages.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {previewUrlAdditionalImages.map((url, index) => (
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
                                            {/* Nút xóa ảnh */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAdditionalImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label
                                htmlFor="file-upload-additional"
                                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                            >
                                <span className="text-2xl text-gray-400">+</span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {previewUrlAdditionalImages.length > 0
                                        ? "Add additional image"
                                        : "Upload image"}
                                </span>
                            </label>

                            <input
                                id="file-upload-additional"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleAdditionalImagesChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 font-semibold">
                        Description
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Description"
                        className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                        value={newProduct.Description}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, Description: e.target.value })
                        }
                    />
                </div>

                {/* ProductForSkinTypes */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">SkinTypes</h4>
                        <button
                            onClick={() =>
                                setNewProduct((prev) => ({
                                    ...prev,
                                    ProductForSkinTypes: [
                                        ...prev.ProductForSkinTypes,
                                        {
                                            ProductForSkinTypeId: '',
                                            SkinTypeId: '',
                                            TypeName: '',
                                            showSuggestions: false,
                                        },
                                    ],
                                }))
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                            + Add Skin Type
                        </button>
                    </div>

                    {newProduct.ProductForSkinTypes.map((st, index) => (
                        <div key={index} className="relative flex gap-2 mb-2 items-center">
                            <input
                                type="text"
                                placeholder="Skin type..."
                                className="w-full p-2 border border-gray-300 text-gray-900 rounded-lg"
                                value={st.TypeName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNewProduct((prev) => {
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

                            {st.showSuggestions && st.TypeName && (
                                <ul className="absolute left-0 right-0 top-12 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                                    {skinTypeList
                                        .filter((b) =>
                                            b.TypeName.toLowerCase().includes(st.TypeName.toLowerCase())
                                        )
                                        .map((skinType) => (
                                            <li
                                                key={skinType.SkinTypeId}
                                                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setNewProduct((prev) => {
                                                        const updated = [...prev.ProductForSkinTypes];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            SkinTypeId: skinType.SkinTypeId,
                                                            TypeName: skinType.TypeName,
                                                            showSuggestions: false,
                                                        };
                                                        return { ...prev, ProductForSkinTypes: updated };
                                                    });
                                                }}
                                            >
                                                {skinType.TypeName}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            <button
                                onClick={() => {
                                    setNewProduct((prev) => ({
                                        ...prev,
                                        ProductForSkinTypes: prev.ProductForSkinTypes.filter(
                                            (_, i) => i !== index
                                        ),
                                    }));
                                }}
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Variations */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Variations</h4>
                        <button
                            onClick={() =>
                                setNewProduct((prev) => ({
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
                    {newProduct.Variations.map((variation, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <input
                                type="number"
                                placeholder="Ml"
                                className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                                value={variation.Ml}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.Variations];
                                        updated[index] = {
                                            ...updated[index],
                                            Ml: parseInt(e.target.value) || 0,
                                        };
                                        return { ...prev, Variations: updated };
                                    })
                                }
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                                value={variation.Price}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.Variations];
                                        updated[index] = {
                                            ...updated[index],
                                            Price: parseFloat(e.target.value) || 0,
                                        };
                                        return { ...prev, Variations: updated };
                                    })
                                }
                            />
                            <button
                                onClick={() =>
                                    setNewProduct((prev) => ({
                                        ...prev,
                                        Variations: prev.Variations.filter((_, i) => i !== index),
                                    }))
                                }
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* MainIngredients */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Main Ingredients</h4>
                        <button
                            onClick={() =>
                                setNewProduct((prev) => ({
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
                    {newProduct.MainIngredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <input
                                type="text"
                                placeholder="IngredientName"
                                className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                                value={ing.IngredientName}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.MainIngredients];
                                        updated[index] = {
                                            ...updated[index],
                                            IngredientName: e.target.value,
                                        };
                                        return { ...prev, MainIngredients: updated };
                                    })
                                }
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                                value={ing.Description}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.MainIngredients];
                                        updated[index] = {
                                            ...updated[index],
                                            Description: e.target.value,
                                        };
                                        return { ...prev, MainIngredients: updated };
                                    })
                                }
                            />
                            <button
                                onClick={() =>
                                    setNewProduct((prev) => ({
                                        ...prev,
                                        MainIngredients: prev.MainIngredients.filter(
                                            (_, i) => i !== index
                                        ),
                                    }))
                                }
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* DetailIngredients */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Detail Ingredients</h4>
                        <button
                            onClick={() =>
                                setNewProduct((prev) => ({
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
                    {newProduct.DetailIngredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <input
                                type="text"
                                placeholder="IngredientName"
                                className="w-full p-1 border border-gray-300 text-gray-900 rounded"
                                value={ing.IngredientName}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.DetailIngredients];
                                        updated[index] = {
                                            ...updated[index],
                                            IngredientName: e.target.value,
                                        };
                                        return { ...prev, DetailIngredients: updated };
                                    })
                                }
                            />
                            <button
                                onClick={() =>
                                    setNewProduct((prev) => ({
                                        ...prev,
                                        DetailIngredients: prev.DetailIngredients.filter(
                                            (_, i) => i !== index
                                        ),
                                    }))
                                }
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Usages */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Usages</h4>
                        <button
                            onClick={() =>
                                setNewProduct((prev) => ({
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
                    {newProduct.Usages.map((usage, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <input
                                type="number"
                                placeholder="Step"
                                className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                                value={usage.Step}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.Usages];
                                        updated[index] = {
                                            ...updated[index],
                                            Step: parseInt(e.target.value) || 1,
                                        };
                                        return { ...prev, Usages: updated };
                                    })
                                }
                            />
                            <input
                                type="text"
                                placeholder="Instruction"
                                className="w-1/2 p-1 border border-gray-300 text-gray-900 rounded"
                                value={usage.Instruction}
                                onChange={(e) =>
                                    setNewProduct((prev) => {
                                        const updated = [...prev.Usages];
                                        updated[index] = {
                                            ...updated[index],
                                            Instruction: e.target.value,
                                        };
                                        return { ...prev, Usages: updated };
                                    })
                                }
                            />
                            <button
                                onClick={() =>
                                    setNewProduct((prev) => ({
                                        ...prev,
                                        Usages: prev.Usages.filter((_, i) => i !== index),
                                    }))
                                }
                                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={handleAddProduct}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateProductModal;
