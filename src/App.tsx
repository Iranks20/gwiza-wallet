import { Routes, Route, Navigate } from 'react-router'
import screens from './screens/index.js'
import UserLayout from './components/UserLayout.tsx'
import AdminLogin from './screens/AdminLogin.tsx'
import UserLogin from './screens/UserLogin.tsx'
import AuthSplash from './screens/AuthSplash.tsx'
import ForgotPassword from './screens/ForgotPassword.tsx'
import ResetPassword from './screens/ResetPassword.tsx'
import OtpVerification from './screens/OtpVerification.tsx'
import UserHome from './screens/UserHome.tsx'
import UserSend from './screens/UserSend.tsx'
import UserReceive from './screens/UserReceive.tsx'
import UserTransactions from './screens/UserTransactions.tsx'
import UserProfile from './screens/UserProfile.tsx'
import UserStateLimitExceeded from './screens/UserStateLimitExceeded.tsx'
import UserStateRuleBlocked from './screens/UserStateRuleBlocked.tsx'
import UserStatePending from './screens/UserStatePending.tsx'
import UserStateSuccess from './screens/UserStateSuccess.tsx'
import CountrySettings from './screens/CountrySettings.tsx'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/auth" replace />} />
			{Object.entries(screens).map(([screenName, ScreenComponent]) => (
				<Route
					key={screenName}
					path={`/${screenName}`}
					element={<ScreenComponent />}
				/>
			))}
			{/* Auth flows */}
			<Route path="/auth" element={<AuthSplash />} />
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/user/login" element={<UserLogin />} />
			<Route path="/auth/forgot-password" element={<ForgotPassword />} />
			<Route path="/auth/reset-password" element={<ResetPassword />} />
			<Route path="/auth/verify-otp" element={<OtpVerification />} />

			{/* User wallet panel */}
			<Route path="/user" element={<Navigate to="/user/home" replace />} />
			<Route path="/user/*" element={<UserLayout />}>
				<Route path="home" element={<UserHome />} />
				<Route path="send" element={<UserSend />} />
				<Route path="receive" element={<UserReceive />} />
				<Route path="transactions" element={<UserTransactions />} />
				<Route path="profile" element={<UserProfile />} />
				<Route path="state/limit-exceeded" element={<UserStateLimitExceeded />} />
				<Route path="state/rule-blocked" element={<UserStateRuleBlocked />} />
				<Route path="state/pending" element={<UserStatePending />} />
				<Route path="state/success" element={<UserStateSuccess />} />
			</Route>

			{/* Admin country settings */}
			<Route path="/settings/countries/:countryId" element={<CountrySettings />} />
		</Routes>
	)
}
