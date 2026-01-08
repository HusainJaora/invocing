
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './Pages/Login';
// import Dashboard from './Pages/Dashboard';
// import ProtectedRoute from './components/ProtectedRRoute';
// import MainLayout from './layout/MainLayout';
// import {CustomerList, CustomerEdit, CustomerAdd} from './Pages/Customer';
// import {ProductList, EditProduct, Product} from './Pages/Product';




// function App() {
//   return (
//     <BrowserRouter>
//       {/* <AuthProvider> */}
//         <Routes>
//           {/* Public Routes - No Layout */}
//           <Route path="/login" element={<LoginPage />} />
          
//           {/* All Protected Routes with MainLayout - Sidebar persists for ALL pages */}
//           <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
//             {/* Dashboard */}
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/home" element={<Dashboard />} />
            
          
            
//             {/* Customer Routes */}
//             <Route path="/customers/add" element={<CustomerAdd />} />
//             <Route path="/customer/list" element={<CustomerList />} />
//             <Route path="/customers/edit/:customerId" element={<CustomerEdit />} />
//             {/* <Route path="/customers/detail/:customerId" element={<CustomerDetail />} /> */}
            
//             {/* Product Routes */}  
//             <Route path="/products/add" element={<Product />} />
//             <Route path="/products/list" element={<ProductList />} />
//             <Route path="/products/edit/:productId" element={<EditProduct />} />
//             {/* <Route path="/products/detail/:productId" element={<ProductDetail />} /> */}


           
           
//           </Route>
//           {/* Redirects */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       {/* </AuthProvider> */}
//     </BrowserRouter>
//   );
// }

// export default App;




import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './components/ProtectedRRoute';
import MainLayout from './layout/MainLayout';
import {CustomerList, CustomerEdit, CustomerAdd} from './Pages/Customer';
import {ProductList, ProductEdit, ProductAdd} from './Pages/Product';  




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
            {/* <Route path="/customers/detail/:customerId" element={<CustomerDetail />} /> */}
            
            {/* Product Routes */}  
            <Route path="/products/add" element={<ProductAdd />} />       {/* ✅ Changed from Product to ProductAdd */}
            <Route path="/master/product/list" element={<ProductList />} />      {/* ✅ Changed from /products/ to /product/ */}
            <Route path="/products/edit/:productId" element={<ProductEdit />} />  {/* ✅ Changed from EditProduct to ProductEdit */}
            {/* <Route path="/products/detail/:productId" element={<ProductDetail />} /> */}


           
           
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