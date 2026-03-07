import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.js'
import { BrowserRouter } from 'react-router'
import { GOOGLE_CONFIG } from './config/environment'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={GOOGLE_CONFIG.CLIENT_ID}>
			<BrowserRouter>
				<AuthProvider>
					<App />
				</AuthProvider>
			</BrowserRouter>
		</GoogleOAuthProvider>
	</StrictMode>
)
