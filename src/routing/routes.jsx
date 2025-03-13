import { Page } from 'components'
import { ErrorPage, Home, Test, Overview, Component, ComponentTitle } from 'pages'

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
				path: '/c/:componentId',
				element: <Component />,
				title: <ComponentTitle />,
				back: '/overview',
				children: [
					{
						path: ':page',
						element: <Component />,
						title: <ComponentTitle />,
						back: '/overview',
					},
				],
			},
			{
				path: '*',
				element: <Home />,
				header: false,
			},
		],
	},
]
