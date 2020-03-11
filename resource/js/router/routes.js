export default [
	{
		// path: '/home/console.html',
		path: '/vue/test.html',
		component: () => import('pages/test'),
	},
	{
		path: '/',
		component: () => import('pages/index'),
		children: [
			{
				path: 'Finance/Group/CompanyTotalFeeRate.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-headquarters',
						component: () => import('pages/OperatingReport/Headquarters'),
					},
					{
						path: 'detail',
						name: 'operating-report-detail',
						component: () => import('pages/OperatingReport/Headquarters/Detail'),
					},
				],
			},
			{
				path: 'Finance/CompanyTotalFeeRate.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-branch-headquarters',
						component: () => import('pages/OperatingReport/Branch'),
					},
					{
						path: 'detail',
						name: 'operating-report-branch-detail',
						component: () => import('pages/OperatingReport/Branch/Detail'),
					},
				],
			},
			{
				path: 'StatisticsFinance',
				component: () => import('pages/StatisticsFinance'),
				name: 'statistics-finance',
			},
		],
	},
]
