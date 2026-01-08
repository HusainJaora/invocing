

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ENDPOINTS from '../api/endpoint';
import  Pagination  from '../components/Pagination';
import  SearchActionBar  from '../components/SearchActionBar';
import { Plus, Edit, Trash2,Eye, X ,User,Phone, Mail, MapPin, ArrowLeft, Save} from 'lucide-react';


export const CustomerList = () => {
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const searchLower = searchValue.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.customer_name.toLowerCase().includes(searchLower) ||
        customer.customer_contact.toLowerCase().includes(searchLower) ||
        customer.customer_email.toLowerCase().includes(searchLower) ||
        customer.customer_address.toLowerCase().includes(searchLower)
      );
      setFilteredCustomers(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchValue, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(ENDPOINTS.CUSTOMER.CUSTOMER_LIST, {
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
          setErrors(['Failed to fetch customers']);
        }
        return;
      }

      if (data.customers && Array.isArray(data.customers)) {
        setCustomers(data.customers);
        setFilteredCustomers(data.customers);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }

    } catch (error) {
      console.error('Error fetching customers:', error);
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

  const handleAddCustomer = () => {
    navigate('/customers/add');
  };

  const handleViewCustomer = (customerId) => {
    setCustomerToView(customerId);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setCustomerToView(null);
  };

  const handleEditFromView = (customerId) => {
    setShowViewModal(false);
    setCustomerToView(null);
    navigate(`/customers/edit/${customerId}`);
  };

  const handleEditCustomer = (customerId) => {
    navigate(`/customers/edit/${customerId}`);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    setDeleteLoading(true);
    setErrors([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `${ENDPOINTS.CUSTOMER.CUSTOMER_DELETE}/${customerToDelete.customer_id}`,
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
          setErrors(['Failed to delete customer']);
        }
        return;
      }

      // Successfully deleted - refresh the list
      await fetchCustomers();
      setShowDeleteModal(false);
      setCustomerToDelete(null);

    } catch (error) {
      console.error('Error deleting customer:', error);
      setErrors(['Network error. Please check your connection and try again.']);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
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
                placeholder="Search by name, contact, email, or address..."
              />
              
              <button
                onClick={handleAddCustomer}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
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
                <p className="text-gray-600">Loading customers...</p>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600 mb-6">
                  {searchValue ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
                </p>
                {!searchValue && (
                  <button
                    onClick={handleAddCustomer}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Customer
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
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCustomers.map((customer) => (
                      <tr key={customer.customer_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{customer.customer_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.customer_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.customer_contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customer.customer_email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-xs truncate">
                            {customer.customer_address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewCustomer(customer.customer_id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditCustomer(customer.customer_id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(customer)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Customer"
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
                totalItems={filteredCustomers.length}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete this customer?
              </p>
              
              <p className="text-sm text-gray-500 text-center mt-3">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
      )}

      {/* Customer View Modal */}
      {showViewModal && customerToView && (
        <CustomerView
          customerId={customerToView}
          onClose={handleCloseViewModal}
          onEdit={handleEditFromView}
        />
      )}
    </div>
  );
};



const CustomerView = ({ customerId, onClose, onEdit }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${ENDPOINTS.CUSTOMER.CUSTOMER_DETAIL}/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          setError(data.error);
        } else {
          setError('Failed to fetch customer details');
        }
        return;
      }

      setCustomer(data);

    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (onEdit && customer) {
      onEdit(customer.customer_id);
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Customer Details</h2>
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
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading customer details...</p>
            </div>
          ) : error ? (
            <div className="py-12">
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
          ) : customer ? (
            <>
              {/* Customer ID Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  <span className="mr-1">ID:</span>
                  <span className="font-bold">{customer.customer_id}</span>
                </div>
              </div>

              {/* Customer Information Grid */}
              <div className="space-y-4">
                {/* Name and Contact in one row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Customer Name</p>
                        <p className="text-lg font-semibold text-gray-900">{customer.customer_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Contact Number</p>
                        <p className="text-lg font-semibold text-gray-900">{customer.customer_contact}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-gray-900 break-all">
                        {customer.customer_email === 'NA' ? (
                          <span className="text-gray-400 italic">Not provided</span>
                        ) : (
                          customer.customer_email
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {customer.customer_address === 'NA' ? (
                          <span className="text-gray-400 italic">Not provided</span>
                        ) : (
                          customer.customer_address
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



export const CustomerEdit = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const customer_id = customerId;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch customer data on component mount
  useEffect(() => {
    fetchCustomerData();
  }, [customer_id]);

  const fetchCustomerData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${ENDPOINTS.CUSTOMER.CUSTOMER_DETAIL}/${customer_id}`, {
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
          setFetchError('Customer not found');
          return;
        }

        if (data.error) {
          setFetchError(data.error);
        } else {
          setFetchError('Failed to fetch customer details');
        }
        return;
      }

      // Pre-fill form with customer data
      const customerData = {
        customer_name: data.customer_name || '',
        customer_contact: data.customer_contact || '',
        customer_email: data.customer_email === 'NA' ? '' : data.customer_email || '',
        customer_address: data.customer_address === 'NA' ? '' : data.customer_address || ''
      };
      
      setFormData(customerData);
      setOriginalData(customerData);

    } catch (error) {
      console.error('Error fetching customer:', error);
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
      case 'customer_name':
        if (!value.trim()) {
          return 'Customer name is required';
        }
        return '';
      
      case 'customer_contact':
        if (!value.trim()) {
          return 'Customer contact is required';
        } else if (!/^[0-9]{10}$/.test(value.trim())) {
          return 'Customer contact must be a 10-digit number';
        }
        return '';
      
      case 'customer_email':
        if (value.trim() && value.trim() !== 'NA') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            return 'Please enter a valid email address';
          }
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {
      customer_name: validateField('customer_name', formData.customer_name),
      customer_contact: validateField('customer_contact', formData.customer_contact),
      customer_email: validateField('customer_email', formData.customer_email),
      customer_address: ''
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
        customer_name: formData.customer_name.trim(),
        customer_contact: formData.customer_contact.trim(),
        customer_email: formData.customer_email.trim() || 'NA',
        customer_address: formData.customer_address.trim() || 'NA'
      };

      const response = await fetch(`${ENDPOINTS.CUSTOMER.UPDATE_CUSTOMER}/updateCustomer/${customer_id}`, {
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
          setFetchError('Customer not found');
          return;
        }

        if (response.status === 409) {
          setFieldErrors(prev => ({
            ...prev,
            customer_contact: data.error || 'Customer with this contact already exists'
          }));
          return;
        }

        if (data.error) {
          setFetchError(data.error);
        } else {
          setFetchError('Failed to update customer');
        }
        return;
      }

      // Success - navigate back to customer list
      navigate('/customer/list');

    } catch (error) {
      console.error('Update error:', error);
      setFetchError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/customer/list');
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
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Edit Customer</h2>
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
              <p className="text-gray-600">Loading customer data...</p>
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
                {/* Name and Contact in one row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <label htmlFor="customer_name" className="text-sm font-medium text-gray-500 mb-2 block">
                            Customer Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="customer_name"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter name"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                    {fieldErrors.customer_name && (
                      <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_name}</p>
                    )}
                  </div>

                  {/* Customer Contact */}
                  <div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <label htmlFor="customer_contact" className="text-sm font-medium text-gray-500 mb-2 block">
                            Contact Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="customer_contact"
                            name="customer_contact"
                            value={formData.customer_contact}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="10-digit number"
                            maxLength="10"
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                    {fieldErrors.customer_contact && (
                      <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_contact}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <label htmlFor="customer_email" className="text-sm font-medium text-gray-500 mb-2 block">
                          Email Address <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          id="customer_email"
                          name="customer_email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="customer@example.com"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  {fieldErrors.customer_email && (
                    <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_email}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <label htmlFor="customer_address" className="text-sm font-medium text-gray-500 mb-2 block">
                          Address <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <textarea
                          id="customer_address"
                          name="customer_address"
                          value={formData.customer_address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Enter address"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  {fieldErrors.customer_address && (
                    <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_address}</p>
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



export const CustomerAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: ''
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
      case 'customer_name':
        if (!value.trim()) {
          return 'Customer name is required';
        }
        return '';
      
      case 'customer_contact':
        if (!value.trim()) {
          return 'Customer contact is required';
        } else if (!/^[0-9]{10}$/.test(value.trim())) {
          return 'Customer contact must be a 10-digit number';
        }
        return '';
      
      case 'customer_email':
        if (value.trim() && value.trim() !== 'NA') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            return 'Please enter a valid email address';
          }
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {
      customer_name: validateField('customer_name', formData.customer_name),
      customer_contact: validateField('customer_contact', formData.customer_contact),
      customer_email: validateField('customer_email', formData.customer_email),
      customer_address: ''
    };

    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const isFormValid = () => {
    // Check if required fields have values
    return formData.customer_name.trim() !== '' && 
           formData.customer_contact.trim() !== '' &&
           /^[0-9]{10}$/.test(formData.customer_contact.trim());
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
        customer_name: formData.customer_name.trim(),
        customer_contact: formData.customer_contact.trim(),
        customer_email: formData.customer_email.trim() || 'NA',
        customer_address: formData.customer_address.trim() || 'NA'
      };

      const response = await fetch(ENDPOINTS.CUSTOMER.ADD_CUSTOMER, {
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
          // Duplicate contact error
          if (data.error && data.error.includes('contact already exists')) {
            setFieldErrors(prev => ({
              ...prev,
              customer_contact: data.error
            }));
          } else {
            setGeneralError(data.error || 'Failed to add customer');
          }
          return;
        }

        if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError('Failed to add customer');
        }
        return;
      }

      // Success - navigate back to customer list
      navigate('/customer/list');

    } catch (error) {
      console.error('Add customer error:', error);
      setGeneralError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/customer/list');
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
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Add New Customer</h2>
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
              {/* Name and Contact in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <label htmlFor="customer_name" className="text-sm font-medium text-gray-500 mb-2 block">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="customer_name"
                          name="customer_name"
                          value={formData.customer_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter name"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  {fieldErrors.customer_name && (
                    <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_name}</p>
                  )}
                </div>

                {/* Customer Contact */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <label htmlFor="customer_contact" className="text-sm font-medium text-gray-500 mb-2 block">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="customer_contact"
                          name="customer_contact"
                          value={formData.customer_contact}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="10-digit number"
                          maxLength="10"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  {fieldErrors.customer_contact && (
                    <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_contact}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <label htmlFor="customer_email" className="text-sm font-medium text-gray-500 mb-2 block">
                        Email Address <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        id="customer_email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="customer@example.com"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
                {fieldErrors.customer_email && (
                  <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_email}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <label htmlFor="customer_address" className="text-sm font-medium text-gray-500 mb-2 block">
                        Address <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <textarea
                        id="customer_address"
                        name="customer_address"
                        value={formData.customer_address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Enter address"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
                {fieldErrors.customer_address && (
                  <p className="mt-1 text-sm text-red-600 ml-1">{fieldErrors.customer_address}</p>
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
                    Add Customer
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

