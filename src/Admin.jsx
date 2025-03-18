import { Route, Routes } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";

import OverviewPage from "./Pages/AdminPage/OverviewPage";
import ProductsPageAdmin from "./Pages/AdminPage/ProductsPage";
import UsersPage from "./Pages/AdminPage/UsersPage";
import SalesPage from "./Pages/AdminPage/SalesPage";
import OrdersPage from "./Pages/AdminPage/OrdersPage";
import AnalyticsPage from "./Pages/AdminPage/AnalyticsPage";
import SettingsPage from "./Pages/AdminPage/SettingsPage";
import PromotionPageAdmin from "./Pages/AdminPage/PromotionPage"
import BrandsPage from './Pages/AdminPage/BrandsPage'
import BlogsPage from './Pages/AdminPage/BlogsPage'
import QuizzesPage from './Pages/AdminPage/QuizzesPage'
import SkinTypesPage from './Pages/AdminPage/SkinTypesPage'

function Admin() {
	return (
		<div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
			{/* BG */}
			<div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
				<div className='absolute inset-0 backdrop-blur-sm' />
			</div>

			<Sidebar />
			<Routes>
				<Route path='' element={<OverviewPage />} />
				<Route path='products' element={<ProductsPageAdmin />} />
				<Route path='brands' element={<BrandsPage />} />
				<Route path='users' element={<UsersPage />} />
				<Route path='sales' element={<SalesPage />} />
				<Route path='orders' element={<OrdersPage />} />
				<Route path='analytics' element={<AnalyticsPage />} />
				<Route path='promotions' element={<PromotionPageAdmin />} />
				<Route path='blogs' element={<BlogsPage />} />
				<Route path='quizzes' element={<QuizzesPage />} />
				<Route path='skintypes' element={<SkinTypesPage />} />
				<Route path='settings' element={<SettingsPage />} />
			</Routes>
		</div>
	);
}

export default Admin;
