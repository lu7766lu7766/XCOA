export default {
	methods: {
		previewOpen(src, config = 'height=600,width=800') {
			window.open(src, '预览', config)
		},
	},
}
