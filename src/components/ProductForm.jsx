import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, fetchCategories, resetSuccess } from '../features/products/productSlice';
import toast from 'react-hot-toast';

const ProductForm = ({ onCancel, initialData = null }) => {
  const dispatch = useDispatch();
  const { categories, loading, success, error } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  // Image items management: { id, type: 'existing'|'new', url, file?, public_id? }
  const [items, setItems] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
    if (initialData) {
        setFormData({
            name: initialData.name,
            description: initialData.description,
            price: initialData.price,
            stock: initialData.stock,
            category: initialData.category?._id || initialData.category || '',
        });
        if (initialData.images && initialData.images.length > 0) {
            const mappedImages = initialData.images.map((img, idx) => ({
                id: `existing-${idx}`,
                type: 'existing',
                url: img.url,
                public_id: img.public_id
            }));
            setItems(mappedImages);
        }
    }
  }, [dispatch, initialData]);

  useEffect(() => {
    if (success) {
      toast.success(initialData ? 'Product updated!' : 'Product added!');
      dispatch(resetSuccess());
      onCancel();
    }
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Operation failed');
    }
  }, [success, error, dispatch, onCancel]);

  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
          const newItems = files.map((file, idx) => ({
              id: `new-${Date.now()}-${idx}`,
              type: 'new',
              url: URL.createObjectURL(file), // Preview
              file: file
          }));
          setItems((prev) => [...prev, ...newItems]);
      }
  };

  const moveItem = (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= items.length) return;
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(index, 1);
      newItems.splice(newIndex, 0, movedItem);
      setItems(newItems);
  };

  const removeItem = (index) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('price', formData.price);
    productData.append('description', formData.description);
    productData.append('stock', formData.stock);
    productData.append('category', formData.category);

    // Filter "new" items and append their files
    // The "index" in metadata for "new" items will correspond to the order here
    const newFiles = items.filter(i => i.type === 'new').map(i => i.file);
    newFiles.forEach(file => {
        productData.append('images', file);
    });

    // Create Metadata to reconstruct the order
    // For new items, we need to track their index in the 'newFiles' array we just created
    let newFileCounter = 0;
    const metadata = items.map(item => {
        if (item.type === 'existing') {
            return { type: 'existing', url: item.url, public_id: item.public_id };
        } else {
            const meta = { type: 'new', index: newFileCounter }; // Logic on backend expects us to pick from req.files sequentially
            newFileCounter++;
            return meta;
        }
    });

    productData.append('imageMetadata', JSON.stringify(metadata));

    if (initialData) {
        dispatch(updateProduct({ id: initialData._id, productData }));
    } else {
        dispatch(createProduct(productData));
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">{initialData ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Sub-Category</option>
              {categories
                .filter(cat => !cat.parent) // Get Primary
                .map(primary => {
                    const subs = categories.filter(c => c.parent && (c.parent === primary._id || c.parent._id === primary._id));
                    if (subs.length === 0) return null;
                    return (
                        <optgroup key={primary._id} label={primary.name}>
                            {subs.map(sub => (
                                <option key={sub._id} value={sub._id}>
                                    {sub.name}
                                </option>
                            ))}
                        </optgroup>
                    );
                })
              }
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
            <input
              type="number"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <div className="mt-1">
                <input 
                    type="file" 
                    multiple
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                
                {/* Image List with Reordering */}
                {items.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="relative group border rounded p-2 bg-gray-50">
                                <img src={item.url} alt={`Product ${index}`} className="h-20 w-full object-cover rounded mb-2" />
                                <div className="flex justify-between items-center text-xs">
                                    <button 
                                        type="button"
                                        onClick={() => moveItem(index, -1)}
                                        disabled={index === 0}
                                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        &uarr;
                                    </button>
                                    <span className="text-gray-500">{item.type}</span>
                                    <button 
                                        type="button"
                                        onClick={() => moveItem(index, 1)}
                                        disabled={index === items.length - 1}
                                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        &darr;
                                    </button>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {loading ? 'Processing...' : (initialData ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
