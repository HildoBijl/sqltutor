import { Page } from 'components'
import { ErrorPage, Home, Test, Overview } from 'pages'

export const routes = [
	{
		path: '/',
		element: <Page />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Home />,
				tabIndex: 0,
			},
			{
				path: '/test',
				element: <Test />,
				tabIndex: 1,
			},
			{
				path: '/overview',
				element: <Overview />,
				tabIndex: 1,
			},
			{
				path: '*',
				element: <Home />,
				tabIndex: 0,
			},
		],
	},
]
