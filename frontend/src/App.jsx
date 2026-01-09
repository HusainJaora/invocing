import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './components/ProtectedRRoute';
import MainLayout from './layout/MainLayout';
import {CustomerList, CustomerEdit, CustomerAdd} from './Pages/Customer';
import {ProductList, ProductEdit, ProductAdd} from './Pages/Product';  
import {UserList, AddUserModal, EditUser} from './Pages/User';
import {InvoiceList, InvoiceAdd, InvoiceEdit} from './Pages/Invoice';




function App() {
  return (
    <BrowserRouter>
      {/* <AuthProvider> */}
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* All Protected Routes with MainLayout - Sidebar persists for ALL pages */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Dashboard />} />
            
          
            
            {/* Customer Routes */}
            <Route path="/customers/add" element={<CustomerAdd />} />
            <Route path="/customer/list" element={<CustomerList />} />
            <Route path="/customers/edit/:customerId" element={<CustomerEdit />} />
            
            
            {/* Product Routes */}  
            <Route path="/products/add" element={<ProductAdd />} />       
            <Route path="/master/product/list" element={<ProductList />} />      
            <Route path="/products/edit/:productId" element={<ProductEdit />} /> 
            


            {/* User Routes */}  
            <Route path="/users/add" element={<AddUserModal />} />        
            <Route path="/user/list" element={<UserList />} />            
            <Route path="/users/edit/:user_id" element={<EditUser />} /> 

            {/* Invoice Routes */}
            <Route path="/invoices/add" element={<InvoiceAdd />} />        
            <Route path="/sales/invoice/list" element={<InvoiceList />} />            
            <Route path="/invoices/edit/:invoice_id" element={<InvoiceEdit />} />


           
           
          </Route>
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      {/* </AuthProvider> */}
    </BrowserRouter>
  );
}

export default App;


