import { Page } from 'components'
import { ErrorPage, Home, Test, Test2, Overview, Component, ComponentTitle } from 'pages'

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
				path: '/test2',
				element: <Test2 />,
				title: 'Test2 Page',
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
						path: ':tab',
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
