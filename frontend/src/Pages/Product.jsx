import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ENDPOINTS from '../api/endpoint';
import Pagination from '../components/Pagination';
import SearchActionBar from '../components/SearchActionBar';
import { Plus, Edit, Trash2, Eye, X, Package, FileText, Save } from 'lucide-react';


export const ProductList = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [productToView, setProductToView] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();

  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredProducts(products);
    } else {
      const searchLower = searchValue.toLowerCase();
      const filtered = products.filter(product => 
        product.product_name.toLowerCase().includes(searchLower) ||
        product.product_description.toLowerCase().includes(searchLower)
      );
      setFilteredProducts(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchValue, products]);

  const fetchProducts = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(ENDPOINTS.PRODUCT.PRODUCT_LIST, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (data.message) {
          setErrors([data.message]);
        } else if (data.error) {
          setErrors([data.error]);
        } else {
          setErrors(['Failed to fetch products']);
        }
        return;
      }

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setErrors(['Network error. Please check your connection and try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleViewProduct = (productId) => {
    setProductToView(productId);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setProductToView(null);
  };

  const handleEditFromView = (productId) => {
    setShowViewModal(false);
    setProductToView(null);
    navigate(`/products/edit/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    setErrors([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${ENDPOINTS.PRODUCT.PRODUCT_DELETE}/${productToDelete.product_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (data.message) {
          setErrors([data.message]);
        } else if (data.error) {
          setErrors([data.error]);
        } else {
          setErrors(['Failed to delete product']);
        }
        return;
      }

      // Successfully deleted - refresh the list
      await fetchProducts();
      console.log('Product deleted successfully');
      setShowDeleteModal(false);
      setProductToDelete(null);

    } catch (error) {
      console.error('Error deleting product:', error);
      setErrors(['Network error. Please check your connection and try again.']);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product List</h1>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-red-600 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <SearchActionBar
                searchValue={searchValue}
                onSearchChange={handleSearchChange}
                placeholder="Search by name or description..."
              />
              
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {searchValue ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
                </p>
                {!searchValue && (
                  <button
                    onClick={handleAddProduct}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Product
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProducts.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.product_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.product_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-xs truncate">
                            {product.product_description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewProduct(product.product_id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product.product_id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete "{productToDelete?.product_name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && productToView && (
        <ViewProductModal
          productId={productToView}
          onClose={handleCloseViewModal}
          onEdit={handleEditFromView}
        />
      )}
    </div>
  );
};


// View Product Modal Component
export const ViewProductModal = ({ productId, onClose, onEdit }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENDPOINTS.PRODUCT.PRODUCT_DETAIL}/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        setError(data.error || 'Failed to fetch product details');
        return;
      }

      setProduct(data);

    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading product details...</p>
            </div>
          ) : error ? (
            <div className="py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : product ? (
            <>
              <div className="space-y-4">
                {/* Product ID */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Product ID</p>
                      <p className="text-lg font-semibold text-gray-900">{product.product_id}</p>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Product Name</p>
                      <p className="text-lg font-semibold text-gray-900">{product.product_name}</p>
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {product.product_description === 'NA' ? (
                          <span className="text-gray-400 italic">NA</span>
                        ) : (
                          product.product_description
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

       
        
      </div>
    </div>
  );
};



export const ProductEdit = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const product_id = productId;

  const [formData, setFormData] = useState({
    product_name: '',
    product_description: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    product_name: '',
    product_description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch product data on component mount
  useEffect(() => {
    fetchProductData();
  }, [product_id]);

  const fetchProductData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENDPOINTS.PRODUCT.PRODUCT_DETAIL}/${product_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (response.status === 404) {
          setFetchError('Product not found');
          return;
        }

        if (data.error) {
          setFetchError(data.error);
        } else {
          setFetchError('Failed to fetch product details');
        }
        return;
      }

      // Pre-fill form with product data
      const productData = {
        product_name: data.product_name || '',
        product_description: data.product_description === 'NA' ? '' : data.product_description || ''
      };
      
      setFormData(productData);
      setOriginalData(productData);

    } catch (error) {
      console.error('Error fetching product:', error);
      setFetchError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user types
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'product_name':
        if (!value.trim()) {
          return 'Product name is required';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {
      product_name: validateField('product_name', formData.product_name),
      product_description: ''
    };

    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const hasChanges = () => {
    if (!originalData) return false;
    
    return Object.keys(formData).some(key => {
      const currentValue = formData[key].trim();
      const originalValue = originalData[key].trim();
      return currentValue !== originalValue;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      return;
    }

    setSubmitting(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const updateData = {
        product_name: formData.product_name.trim(),
        product_description: formData.product_description.trim() || 'NA'
      };

      const response = await fetch(`${ENDPOINTS.PRODUCT.UPDATE_PRODUCT}/${product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (response.status === 404) {
          setFetchError('Product not found');
          return;
        }

        if (response.status === 409) {
          setFieldErrors(prev => ({
            ...prev,
            product_name: data.error || 'Product with this name already exists'
          }));
          return;
        }

        if (data.error) {
          setFetchError(data.error);
        } else {
          setFetchError('Failed to update product');
        }
        return;
      }

      // Success - navigate back to product list
      navigate('/master/product/list');

    } catch (error) {
      console.error('Update error:', error);
      setFetchError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/master/product/list');
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Edit Product</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading product data...</p>
            </div>
          ) : fetchError ? (
            <div className="py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-600 text-sm">{fetchError}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <label htmlFor="product_name" className="text-sm font-medium text-gray-500 mb-2 block">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="product_name"
                          name="product_name"
                          value={formData.product_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter name"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  {fieldErrors.product_name && (
                    <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.product_name}</p>
                  )}
                </div>

                {/* Product Description */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <label htmlFor="product_description" className="text-sm font-medium text-gray-500 mb-2 block">
                          Description <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <textarea
                          id="product_description"
                          name="product_description"
                          value={formData.product_description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Enter description"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  {fieldErrors.product_description && (
                    <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.product_description}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !hasChanges()}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};



export const ProductAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_name: '',
    product_description: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    product_name: '',
    product_description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user types
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setGeneralError(null);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'product_name':
        if (!value.trim()) {
          return 'Product name is required';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {
      product_name: validateField('product_name', formData.product_name),
      product_description: ''
    };

    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const isFormValid = () => {
    // Check if required fields have values
    return formData.product_name.trim() !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setGeneralError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const submitData = {
        product_name: formData.product_name.trim(),
        product_description: formData.product_description.trim() || 'NA'
      };

      const response = await fetch(ENDPOINTS.PRODUCT.ADD_PRODUCT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (response.status === 400) {
          // Duplicate name error
          if (data.error && data.error.includes('already exists')) {
            setFieldErrors(prev => ({
              ...prev,
              product_name: data.error
            }));
          } else {
            setGeneralError(data.error || 'Failed to add product');
          }
          return;
        }

        if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError('Failed to add product');
        }
        return;
      }

      // Success - navigate back to product list
      navigate('/master/product/list');

    } catch (error) {
      console.error('Add product error:', error);
      setGeneralError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/master/product/list');
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Add New Product</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-600 text-sm">{generalError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <label htmlFor="product_name" className="text-sm font-medium text-gray-500 mb-2 block">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="product_name"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter name"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
                {fieldErrors.product_name && (
                  <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.product_name}</p>
                )}
              </div>

              {/* Product Description */}
              <div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <label htmlFor="product_description" className="text-sm font-medium text-gray-500 mb-2 block">
                        Description <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <textarea
                        id="product_description"
                        name="product_description"
                        value={formData.product_description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Enter description"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
                {fieldErrors.product_description && (
                  <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.product_description}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting || !isFormValid()}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    Add Product
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};