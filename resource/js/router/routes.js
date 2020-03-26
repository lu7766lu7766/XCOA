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
						name: 'operating-report',
						component: () => import('pages/OperatingReport/CompanyTotalFeeRate'),
					},
					{
						path: 'detail',
						name: 'operating-report-detail',
						component: () => import('pages/OperatingReport/CompanyTotalFeeRate/Detail'),
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
						component: () => import('pages/OperatingReport/CompanyPercentage'),
					},
					{
						path: 'detail',
						name: 'operating-report-company-percentage-detail',
						component: () => import('pages/OperatingReport/CompanyPercentage/Detail'),
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
						component: () => import('pages/OperatingReport/RegionCompanyFeeRate'),
					},
					{
						path: 'detail',
						name: 'operating-report-region-fee-detail',
						component: () => import('pages/OperatingReport/RegionCompanyFeeRate/Detail'),
					},
				],
			},
			{
				path: 'Finance/Group/CrossCompanyAnalysis.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-cross-company',
						component: () => import('pages/OperatingReport/CrossCompanyAnalysis'),
					},
					{
						path: 'detail',
						name: 'operating-report-cross-company-detail',
						component: () => import('pages/OperatingReport/CrossCompanyAnalysis/Detail'),
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
	{
		path: '*',
		beforeEnter: (to, from, next) => {
			location.href = location.href.replace(location.origin, window.apiHost)
		},
	},
]
