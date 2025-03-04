import { Link } from 'react-router-dom'

export function ErrorPage() {
	return <div style={{ alignItems: 'center', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', minHeight: '100vh' }}>
		<h2 style={{ textAlign: 'center', margin: '0.5rem' }}>Oops...</h2>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}>We could not find the page you were looking for.</p>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}><Link to="/">Return to the home page</Link></p>
	</div>
}
