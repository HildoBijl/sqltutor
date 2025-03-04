import { Container } from './Container'

// The Subpage is the component underneath the header bar in which the page contents are place.
export function Subpage({ children }) {
	return <Container sx={{ py: '0.8rem', position: 'relative' }}>{children}</Container>
}
