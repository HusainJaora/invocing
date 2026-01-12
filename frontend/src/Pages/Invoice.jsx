import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ENDPOINTS from '../api/endpoint';
import  Pagination  from '../components/Pagination';
import  SearchActionBar  from '../components/SearchActionBar';
import { Plus, Edit, Trash2, Eye, X, User, Calendar, DollarSign, Package, ArrowLeft, Save, ShoppingCart } from 'lucide-react';


export const InvoiceList = () => {
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      const searchLower = searchValue.toLowerCase();
      const filtered = invoices.filter(invoice => 
        invoice.customer_name?.toLowerCase().includes(searchLower) ||
        invoice.customer_contact?.toLowerCase().includes(searchLower) ||
        invoice.invoice_id?.toString().includes(searchLower) ||
        invoice.grand_total?.toString().includes(searchLower)
      );
      setFilteredInvoices(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchValue, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(ENDPOINTS.INVOICE.INVOICE_LIST, {
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
          setErrors(['Failed to fetch invoices']);
        }
        return;
      }

      if (data.invoices && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
        setFilteredInvoices(data.invoices);
      } else {
        setInvoices([]);
        setFilteredInvoices([]);
      }

    } catch (error) {
      console.error('Error fetching invoices:', error);
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

  const handleAddInvoice = () => {
    navigate('/invoices/add');
  };

  const handleViewInvoice = (invoiceId) => {
    setInvoiceToView(invoiceId);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setInvoiceToView(null);
  };

  const handleEditFromView = (invoiceId) => {
    setShowViewModal(false);
    setInvoiceToView(null);
    navigate(`/invoices/edit/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId) => {
    navigate(`/invoices/edit/${invoiceId}`);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    setDeleteLoading(true);
    setErrors([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${ENDPOINTS.INVOICE.INVOICE_DELETE}/${invoiceToDelete.invoice_id}`,
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
          setErrors(['Failed to delete invoice']);
        }
        return;
      }

      // Successfully deleted - refresh the list
      await fetchInvoices();
      setShowDeleteModal(false);
      setInvoiceToDelete(null);

    } catch (error) {
      console.error('Error deleting invoice:', error);
      setErrors(['Network error. Please try again.']);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice List</h1>
        
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <SearchActionBar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          placeholder="Search..."
        />
        
        <button
          onClick={handleAddInvoice}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Invoice
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Invoice Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grand Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ShoppingCart className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 text-lg">No invoices found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {searchValue ? 'Try adjusting your search' : 'Get started by creating your first invoice'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentInvoices.map((invoice) => (
                      <tr key={invoice.invoice_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.invoice_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice.customer_name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{invoice.customer_contact || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(invoice.invoice_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.grand_total)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice.invoice_id)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditInvoice(invoice.invoice_id)}
                              className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                              title="Edit Invoice"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(invoice)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredInvoices.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredInvoices.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Invoice</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete invoice <span className="font-semibold">{invoiceToDelete?.invoice_id}</span> for customer <span className="font-semibold">{invoiceToDelete?.customer_name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && invoiceToView && (
        <ViewInvoiceModal
          invoiceId={invoiceToView}
          onClose={handleCloseViewModal}
          onEdit={handleEditFromView}
        />
      )}
    </div>
  );
};


// View Invoice Modal Component
const ViewInvoiceModal = ({ invoiceId, onClose, onEdit }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENDPOINTS.INVOICE.INVOICE_DETAIL}/${invoiceId}`, {
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

        setError(data.error || 'Failed to fetch invoice details');
        return;
      }

      setInvoice(data.invoice);

    } catch (error) {
      console.error('Error fetching invoice details:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : invoice ? (
            <div className="space-y-6">
              {/* Invoice Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Invoice ID</label>
                      <p className="text-lg font-semibold text-gray-900">{invoice.invoice_id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Invoice Date</label>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.invoice_date)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <label className="text-sm font-medium text-gray-500 mb-1 block">Customer</label>
                      <p className="text-lg font-semibold text-gray-900">{invoice.customer_name || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoice.customer_contact || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.product_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.product_description || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grand Total */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="ml-4 text-lg font-medium text-gray-900">Grand Total</span>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600">{formatCurrency(invoice.grand_total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onEdit(invoice.invoice_id)}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Invoice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};


// Add Invoice Component
export const InvoiceAdd = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Customer and Product lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0], // Default to today
    items: [{ product_id: '', price: '', quantity: '' }]
  });

  // Fetch customers and products on mount
  useEffect(() => {
    fetchCustomersAndProducts();
  }, []);

  const fetchCustomersAndProducts = async () => {
    setLoadingData(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      // Fetch customers
      const customerResponse = await fetch(ENDPOINTS.CUSTOMER.CUSTOMER_LIST, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const customerData = await customerResponse.json();
      if (customerResponse.ok && customerData.customers) {
        setCustomers(customerData.customers);
      }

      // Fetch products
      const productResponse = await fetch(ENDPOINTS.PRODUCT.PRODUCT_LIST, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const productData = await productResponse.json();
      if (productResponse.ok && productData.products) {
        setProducts(productData.products);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setGeneralError('Failed to load customers and products');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));

    if (fieldErrors[`items.${index}.${field}`]) {
      setFieldErrors(prev => ({
        ...prev,
        [`items.${index}.${field}`]: ''
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', price: '', quantity: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.customer_id) {
      errors.customer_id = 'Customer is required';
    }

    if (!formData.invoice_date) {
      errors.invoice_date = 'Invoice date is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`items.${index}.product_id`] = 'Product is required';
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        errors[`items.${index}.price`] = 'Valid price is required';
      }
      if (!item.quantity || parseInt(item.quantity) <= 0) {
        errors[`items.${index}.quantity`] = 'Valid quantity is required';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setGeneralError('Please fix the errors below');
      return;
    }

    setSubmitting(true);
    setGeneralError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(ENDPOINTS.INVOICE.ADD_INVOICE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          invoice_date: formData.invoice_date,
          items: formData.items.map(item => ({
            product_id: parseInt(item.product_id),
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity)
          }))
        })
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

        if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError('Failed to create invoice');
        }
        return;
      }

      // Success - navigate to invoice list
      navigate('/sales/invoice/list');

    } catch (error) {
      console.error('Error creating invoice:', error);
      setGeneralError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/sales/invoice/list');
  };

  const isFormValid = () => {
    return formData.customer_id && 
           formData.invoice_date && 
           formData.items.length > 0 &&
           formData.items.every(item => item.product_id && item.price && item.quantity);
  };

  const getProductById = (productId) => {
    return products.find(p => p.product_id === parseInt(productId));
  };

  // Calculate total
  const calculateGrandTotal = () => {
    return formData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Invoice</h1>
         
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Date Row */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <label htmlFor="customer_id" className="text-sm font-medium text-gray-500 mb-2 block">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="customer_id"
                      name="customer_id"
                      value={formData.customer_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    >
                      <option value="">Select customer</option>
                      {customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.customer_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {fieldErrors.customer_id && (
                <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_id}</p>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <label htmlFor="invoice_date" className="text-sm font-medium text-gray-500 mb-2 block">
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="invoice_date"
                      name="invoice_date"
                      value={formData.invoice_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
              {fieldErrors.invoice_date && (
                <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.invoice_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    {/* Product */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => {
                          handleItemChange(index, 'product_id', e.target.value);
                          // Auto-fill price if product is selected
                          const product = getProductById(e.target.value);
                          if (product) {
                            handleItemChange(index, 'price', product.product_price);
                          }
                        }}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 relative z-10"
                        disabled={submitting}
                      >
                        <option value="">Select product</option>
                        {products.map(product => (
                          <option key={product.product_id} value={product.product_id}>
                            {product.product_name}
                          </option>
                        ))}
                      </select>
                      {fieldErrors[`items.${index}.product_id`] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors[`items.${index}.product_id`]}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                        disabled={submitting}
                      />
                      {fieldErrors[`items.${index}.price`] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors[`items.${index}.price`]}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="1"
                        disabled={submitting}
                      />
                      {fieldErrors[`items.${index}.quantity`] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors[`items.${index}.quantity`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={submitting}
                      className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Item Total */}
                {item.price && item.quantity && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                    <span className="text-sm font-medium text-gray-600">
                      Item Total: <span className="text-lg font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="mt-6 bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="ml-4 text-lg font-medium text-gray-900">Grand Total</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{formatCurrency(calculateGrandTotal())}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
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
                Creating...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-2" />
                Create Invoice
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};


// Edit Invoice Component
export const InvoiceEdit = () => {
  const { invoice_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Customer and Product lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: '',
    items: []
  });

  // Fetch invoice details and dropdown data on mount
  useEffect(() => {
    fetchInvoiceAndData();
  }, [invoice_id]);

  const fetchInvoiceAndData = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      // Fetch invoice details
      const invoiceResponse = await fetch(`${ENDPOINTS.INVOICE.INVOICE_DETAIL}/${invoice_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const invoiceData = await invoiceResponse.json();

      if (!invoiceResponse.ok) {
        if (invoiceResponse.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        setGeneralError(invoiceData.error || 'Failed to fetch invoice');
        return;
      }

      // Fetch customers
      const customerResponse = await fetch(ENDPOINTS.CUSTOMER.CUSTOMER_LIST, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const customerData = await customerResponse.json();
      if (customerResponse.ok && customerData.customers) {
        setCustomers(customerData.customers);
      }

      // Fetch products
      const productResponse = await fetch(ENDPOINTS.PRODUCT.PRODUCT_LIST, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const productData = await productResponse.json();
      if (productResponse.ok && productData.products) {
        setProducts(productData.products);
      }

      // Set form data
      if (invoiceData.invoice) {
        const invoice = invoiceData.invoice;
        setFormData({
          customer_id: invoice.customer_id?.toString() || '',
          invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : '',
          items: invoice.items?.map(item => ({
            item_id: item.item_id,
            product_id: item.product_id?.toString() || '',
            price: item.price?.toString() || '',
            quantity: item.quantity?.toString() || ''
          })) || []
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setGeneralError('Network error. Please try again.');
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
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));

    if (fieldErrors[`items.${index}.${field}`]) {
      setFieldErrors(prev => ({
        ...prev,
        [`items.${index}.${field}`]: ''
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', price: '', quantity: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      
      // Remove errors for this item
      const newErrors = { ...fieldErrors };
      delete newErrors[`items.${index}.product_id`];
      delete newErrors[`items.${index}.price`];
      delete newErrors[`items.${index}.quantity`];
      setFieldErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.customer_id) {
      errors.customer_id = 'Customer is required';
    }

    if (!formData.invoice_date) {
      errors.invoice_date = 'Invoice date is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`items.${index}.product_id`] = 'Product is required';
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        errors[`items.${index}.price`] = 'Valid price is required';
      }
      if (!item.quantity || parseInt(item.quantity) <= 0) {
        errors[`items.${index}.quantity`] = 'Valid quantity is required';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setGeneralError('Please fix the errors below');
      return;
    }

    setSubmitting(true);
    setGeneralError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENDPOINTS.INVOICE.UPDATE_INVOICE}/${invoice_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          invoice_date: formData.invoice_date,
          items: formData.items.map(item => ({
            item_id: parseInt(item.item_id),
            product_id: parseInt(item.product_id),
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity)
          }))
        })
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

        if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError('Failed to update invoice');
        }
        return;
      }

      // Success - navigate to invoice list
      navigate('/sales/invoice/list');

    } catch (error) {
      console.error('Error updating invoice:', error);
      setGeneralError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/sales/invoice/list');
  };

  const isFormValid = () => {
    return formData.customer_id && 
           formData.invoice_date && 
           formData.items.length > 0 &&
           formData.items.every(item => item.product_id && item.price && item.quantity);
  };

  const getProductById = (productId) => {
    return products.find(p => p.product_id === parseInt(productId));
  };

  // Calculate total
  const calculateGrandTotal = () => {
    return formData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Invoice {invoice_id}</h1>
          <p className="text-gray-600 mt-1">Update invoice details</p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Date Row */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <label htmlFor="customer_id" className="text-sm font-medium text-gray-500 mb-2 block">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="customer_id"
                      name="customer_id"
                      value={formData.customer_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    >
                      <option value="">Select customer</option>
                      {customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.customer_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {fieldErrors.customer_id && (
                <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_id}</p>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <label htmlFor="invoice_date" className="text-sm font-medium text-gray-500 mb-2 block">
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="invoice_date"
                      name="invoice_date"
                      value={formData.invoice_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
              {fieldErrors.invoice_date && (
                <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.invoice_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    {/* Product */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={submitting}
                      >
                        <option value="">Select product</option>
                        {products.map(product => (
                          <option key={product.product_id} value={product.product_id}>
                            {product.product_name}
                          </option>
                        ))}
                      </select>
                      {fieldErrors[`items.${index}.product_id`] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors[`items.${index}.product_id`]}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                        disabled={submitting}
                      />
                      {fieldErrors[`items.${index}.price`] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors[`items.${index}.price`]}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="1"
                        disabled={submitting}
                      />
                      {fieldErrors[`items.${index}.quantity`] && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors[`items.${index}.quantity`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={submitting}
                      className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Item Total */}
                {item.price && item.quantity && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                    <span className="text-sm font-medium text-gray-600">
                      Item Total: <span className="text-lg font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            disabled={submitting}
            className="mt-4 w-full px-4 py-2 border-2 border-dashed border-indigo-300 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>

          {/* Grand Total */}
          <div className="mt-6 bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="ml-4 text-lg font-medium text-gray-900">Grand Total</span>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{formatCurrency(calculateGrandTotal())}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
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
                Updating...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-2" />
                Update Invoice
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

