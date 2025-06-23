export function Link({ to, children, ...props }) {
	return <a href={to} target="_blank" {...props}>{children}</a>
}
