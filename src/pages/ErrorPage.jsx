import { Link } from 'react-router-dom'

export function ErrorPage() {
	return <div style={{ alignItems: 'center', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', minHeight: '100vh' }}>
		<h2 style={{ textAlign: 'center', margin: '0.5rem' }}>Oops...</h2>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}>Something went wrong in the script execution. It is our mistake. Please refresh and try again.</p>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}><Link to="/">Or you can return to the home page</Link></p>
	</div>
}
