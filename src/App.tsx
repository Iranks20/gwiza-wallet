import { Routes, Route, Navigate } from 'react-router'
import UserLayout from './components/UserLayout'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './screens/AdminLogin'
import UserLogin from './screens/UserLogin'
import AuthSplash from './screens/AuthSplash'
import ForgotPassword from './screens/ForgotPassword'
import ResetPassword from './screens/ResetPassword'
import OtpVerification from './screens/OtpVerification'

import AdminDashboard from './screens/AdminDashboard'
import AdminCountries from './screens/AdminCountries'
import AdminCurrencies from './screens/AdminCurrencies'
import AdminOperationTypes from './screens/AdminOperationTypes'
import AdminPermissions from './screens/AdminPermissions'
import AdminWallets from './screens/AdminWallets'
import AdminWalletDetails from './screens/AdminWalletDetails'
import AdminTransactionRegister from './screens/AdminTransactionRegister'
import AdminAuditLogs from './screens/AdminAuditLogs'
import AdminFeesLedger from './screens/AdminFeesLedger'
import AdminHealth from './screens/AdminHealth'
import AdminReady from './screens/AdminReady'

import CountryConfigure from './screens/CountryConfigure'
import ProfileTypeGroupsLayout from './screens/ProfileTypeGroupsLayout'
import {
  ConfigureKYCTiers,
  ConfigureProfileTypes,
  ConfigureProfileTypeGroups,
  ConfigureTransactionChannels,
  ConfigureSystemAccounts,
  ConfigureGroupPermissions,
  ConfigureThresholds,
  ConfigureTransactionRules,
  ConfigureTransactionFees,
} from './screens/ConfigureTabs'

import UserOverview from './screens/UserOverview'
import UserWallets from './screens/UserWallets'
import UserWalletDetails from './screens/UserWalletDetails'
import UserTransactions from './screens/UserTransactions'
import UserTransactionDetails from './screens/UserTransactionDetails'
import UserFees from './screens/UserFees'
import UserFeesByTransaction from './screens/UserFeesByTransaction'
import UserFeesByDateRange from './screens/UserFeesByDateRange'
import UserProfile from './screens/UserProfile'
import UserSend from './screens/UserSend'
import UserReceive from './screens/UserReceive'
import UserStateLimitExceeded from './screens/UserStateLimitExceeded'
import UserStateRuleBlocked from './screens/UserStateRuleBlocked'
import UserStatePending from './screens/UserStatePending'
import UserStateSuccess from './screens/UserStateSuccess'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />

      {/* Auth */}
      <Route path="/auth" element={<AuthSplash />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify-otp" element={<OtpVerification />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        <Route path="settings/countries" element={<AdminCountries />} />
        <Route path="settings/countries/:countryId/configure" element={<CountryConfigure />}>
          <Route index element={<Navigate to="kyc-tiers" replace />} />
          <Route path="kyc-tiers" element={<ConfigureKYCTiers />} />
          <Route path="profile-types" element={<ConfigureProfileTypes />} />
          <Route path="profile-type-groups" element={<ConfigureProfileTypeGroups />} />
          <Route path="profile-type-groups/:groupId" element={<ProfileTypeGroupsLayout />}>
            <Route index element={<Navigate to="permissions" replace />} />
            <Route path="permissions" element={<ConfigureGroupPermissions />} />
            <Route path="thresholds" element={<ConfigureThresholds />} />
            <Route path="transaction-rules" element={<ConfigureTransactionRules />} />
            <Route path="transaction-rules/:ruleId/transaction-fees" element={<ConfigureTransactionFees />} />
          </Route>
          <Route path="transaction-channels" element={<ConfigureTransactionChannels />} />
          <Route path="system-accounts" element={<ConfigureSystemAccounts />} />
        </Route>

        <Route path="settings/currencies" element={<AdminCurrencies />} />
        <Route path="settings/transaction-operation-types" element={<AdminOperationTypes />} />
        <Route path="settings/profile-permissions" element={<AdminPermissions />} />

        <Route path="wallets" element={<AdminWallets />} />
        <Route path="wallets/:walletId" element={<AdminWalletDetails />} />
        <Route path="transactions/register" element={<AdminTransactionRegister />} />
        <Route path="transactions/audit-logs" element={<AdminAuditLogs />} />
        <Route path="transactions/fees-ledger" element={<AdminFeesLedger />} />
        <Route path="system/health" element={<AdminHealth />} />
        <Route path="system/ready" element={<AdminReady />} />
      </Route>

      {/* User */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="/user/overview" replace />} />
        <Route path="overview" element={<UserOverview />} />
        <Route path="wallets" element={<UserWallets />} />
        <Route path="wallets/:walletId" element={<UserWalletDetails />} />
        <Route path="transactions" element={<UserTransactions />} />
        <Route path="transactions/:txnId" element={<UserTransactionDetails />} />
        <Route path="fees" element={<UserFees />} />
        <Route path="fees/by-transaction" element={<UserFeesByTransaction />} />
        <Route path="fees/by-date-range" element={<UserFeesByDateRange />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="send" element={<UserSend />} />
        <Route path="receive" element={<UserReceive />} />
        <Route path="state/limit-exceeded" element={<UserStateLimitExceeded />} />
        <Route path="state/rule-blocked" element={<UserStateRuleBlocked />} />
        <Route path="state/pending" element={<UserStatePending />} />
        <Route path="state/success" element={<UserStateSuccess />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}
