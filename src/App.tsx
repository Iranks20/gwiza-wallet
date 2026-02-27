import { Navigate, Route, Routes } from 'react-router'
import AdminLogin from './screens/AdminLogin'
import UserLogin from './screens/UserLogin'
import ForgotPassword from './screens/ForgotPassword'
import ResetPassword from './screens/ResetPassword'
import OtpVerification from './screens/OtpVerification'
import AuthSplash from './screens/AuthSplash'
import AdminDashboard from './screens/AdminDashboard'
import AdminCountries from './screens/AdminCountries'
import AdminCurrencies from './screens/AdminCurrencies'
import AdminOperationTypes from './screens/AdminOperationTypes'
import AdminPermissions from './screens/AdminPermissions'
import AdminWallets from './screens/AdminWallets'
import AdminTransactionRegister from './screens/AdminTransactionRegister'
import AdminAuditLogs from './screens/AdminAuditLogs'
import AdminFeesLedger from './screens/AdminFeesLedger'
import AdminHealth from './screens/AdminHealth'
import AdminReady from './screens/AdminReady'
import CountrySettings from './screens/CountrySettings'
import AdminKYCTiers from './screens/AdminKYCTiers'
import AdminProfileTypes from './screens/AdminProfileTypes'
import AdminProfileGroups from './screens/AdminProfileGroups'
import AdminChannels from './screens/AdminChannels'
import AdminSystemAccounts from './screens/AdminSystemAccounts'
import AdminProfileTypeGroupsLayout from './screens/AdminProfileTypeGroupsLayout'
import AdminGroupPermissions from './screens/AdminGroupPermissions'
import AdminThresholds from './screens/AdminThresholds'
import AdminTransactionRules from './screens/AdminTransactionRules'
import AdminTransactionFees from './screens/AdminTransactionFees'
import UserLayout from './components/UserLayout'
import UserTransactions from './screens/UserTransactions'
import {
  UserFeesByDateRange,
  UserFeesByTransaction,
  UserFeesHome,
  UserOverview,
  UserTransactionDetails,
  UserWalletDetails,
  UserWallets,
} from './screens/UserPanels'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/auth" element={<AuthSplash />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify-otp" element={<OtpVerification />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/settings/countries" element={<AdminCountries />} />
      <Route path="/admin/settings/countries/:countryId/configure" element={<CountrySettings />}>
        <Route path="kyc-tiers" element={<AdminKYCTiers embedded />} />
        <Route path="profile-types" element={<AdminProfileTypes embedded />} />
        <Route path="profile-type-groups" element={<AdminProfileGroups embedded />} />
        <Route path="profile-type-groups/:groupId" element={<AdminProfileTypeGroupsLayout />}>
          <Route path="permissions" element={<AdminGroupPermissions embedded />} />
          <Route path="thresholds" element={<AdminThresholds embedded />} />
          <Route path="transaction-rules" element={<AdminTransactionRules embedded />} />
          <Route path="transaction-rules/:ruleId/transaction-fees" element={<AdminTransactionFees embedded />} />
        </Route>
        <Route path="transaction-channels" element={<AdminChannels embedded />} />
        <Route path="system-accounts" element={<AdminSystemAccounts embedded />} />
      </Route>
      <Route path="/admin/settings/currencies" element={<AdminCurrencies />} />
      <Route path="/admin/settings/transaction-operation-types" element={<AdminOperationTypes />} />
      <Route path="/admin/settings/profile-permissions" element={<AdminPermissions />} />
      <Route path="/admin/wallets" element={<AdminWallets />} />
      <Route path="/admin/transactions/register" element={<AdminTransactionRegister />} />
      <Route path="/admin/transactions/audit-logs" element={<AdminAuditLogs />} />
      <Route path="/admin/transactions/fees-ledger" element={<AdminFeesLedger />} />
      <Route path="/admin/system/health" element={<AdminHealth />} />
      <Route path="/admin/system/ready" element={<AdminReady />} />

      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<UserOverview />} />
        <Route path="wallets" element={<UserWallets />} />
        <Route path="wallets/:walletId" element={<UserWalletDetails />} />
        <Route path="transactions" element={<UserTransactions />} />
        <Route path="transactions/:txnId" element={<UserTransactionDetails />} />
        <Route path="fees" element={<UserFeesHome />} />
        <Route path="fees/by-transaction" element={<UserFeesByTransaction />} />
        <Route path="fees/by-date-range" element={<UserFeesByDateRange />} />
      </Route>
    </Routes>
  )
}
