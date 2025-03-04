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
				header: false,
			},
			{
				path: '/test',
				element: <Test />,
				title: 'Test Page',
			},
			{
				path: '/overview',
				element: <Overview />,
				title: 'Tutorial Overview',
			},
			{
				path: '*',
				element: <Home />,
				header: false,
			},
		],
	},
]
