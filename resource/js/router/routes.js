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
				path: 'Finance/CompanyTotalFeePercentage.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-branch-company-percentage',
						component: () => import('pages/OperatingReport/CompanyPercentage/Branch'),
					},
					{
						path: 'detail',
						name: 'operating-report-branch-company-percentage-detail',
						component: () => import('pages/OperatingReport/CompanyPercentage/Branch/Detail'),
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
				path: 'Finance/Group/CrossCompanyAnalysis.html',
				component: () => import('pages/OperatingReport'),
				children: [
					{
						path: '',
						name: 'operating-report-cross-company',
						component: () => import('pages/OperatingReport/CrossCompanyAnalysis/Headquarters'),
					},
					{
						path: 'detail',
						name: 'operating-report-cross-company-detail',
						component: () => import('pages/OperatingReport/CrossCompanyAnalysis/Headquarters/Detail'),
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
