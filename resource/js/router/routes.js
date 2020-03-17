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
						component: () => import('pages/OperatingReport/CompanyTotalFeeRate/Headquarters'),
					},
					{
						path: 'detail',
						name: 'operating-report-detail',
						component: () => import('pages/OperatingReport/CompanyTotalFeeRate/Headquarters/Detail'),
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
						component: () => import('pages/OperatingReport/CompanyTotalFeeRate/Branch'),
					},
					{
						path: 'detail',
						name: 'operating-report-branch-detail',
						component: () => import('pages/OperatingReport/CompanyTotalFeeRate/Branch/Detail'),
					},
				],
			},
			{
				path: 'Finance/Group/CompanyTotalFeePercentage.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-company-percentage',
						component: () => import('pages/OperatingReport/CompanyPercentage/Headquarters'),
					},
					{
						path: 'detail',
						name: 'operating-report-company-percentage-detail',
						component: () => import('pages/OperatingReport/CompanyPercentage/Headquarters/Detail'),
					},
				],
			},
			{
				path: 'Finance/Group/RegionCompanyFeeRate.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-region-fee',
						component: () => import('pages/OperatingReport/RegionCompanyFeeRate/Headquarters'),
					},
					{
						path: 'detail',
						name: 'operating-report-region-fee-detail',
						component: () => import('pages/OperatingReport/RegionCompanyFeeRate/Headquarters/Detail'),
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
