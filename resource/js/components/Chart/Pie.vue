<template>
	<ve-pie v-if="Object.keys(datas).length" :height="height + 'px'" :afterConfig="getConfig"></ve-pie>
</template>

<script>
	import VePie from 'v-charts/lib/pie.common'
	import 'echarts/lib/component/title'

	export default {
		props: {
			datas: {
				type: Object | Array,
				required: true,
			},
			amountKey: {
				type: String,
				default: 'total_amount',
			},
			height: {
				type: String | Number,
				default: 500,
			},
			title: {
				type: String,
			},
		},
		components: {
			VePie,
		},
		methods: {
			getConfig(options) {
				options = Object.assign({}, options, {
					title: {
						text: this.title,
						left: 'center',
					},
					tooltip: {
						trigger: 'item',
						formatter: '{b}: {c} ({d}%)',
					},
					legend: {
						orient: 'vertical',
						left: 10,
						data: Object.keys(this.datas),
					},
					series: [
						{
							name: '访问来源',
							type: 'pie',
							type: 'pie',
							radius: '65%',
							center: ['50%', '50%'],
							label: {
								formatter: '{hr|}\n  {b|{b}：}{c}  {per|{d}%} ',
								backgroundColor: '#eee',
								borderColor: '#aaa',
								borderWidth: 1,
								borderRadius: 4,
								rich: {
									a: {
										color: '#999',
										lineHeight: 22,
										align: 'center',
									},
									hr: {
										borderColor: '#aaa',
										width: '100%',
										borderWidth: 0.5,
										height: 0,
									},
									b: {
										fontSize: 16,
										lineHeight: 33,
									},
									per: {
										color: '#eee',
										backgroundColor: '#334455',
										padding: [2, 4],
										borderRadius: 2,
									},
								},
							},
							data: _.reduce(
								this.datas,
								(result, datas, name) => {
									result.push({
										value: _.jSumBy(datas, this.amountKey),
										name,
									})
									return result
								},
								[]
							),
						},
					],
				})
				return options
			},
		},
	}
</script>
