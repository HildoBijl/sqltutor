import MuiContainer from '@mui/material/Container'

// The Container is used for page layout, to ensure the contents don't grow beyond a certain size on very wide screens.
export function Container({ children, ...props }) {
	return <MuiContainer maxWidth="lg" {...props}>{children}</MuiContainer>
}
