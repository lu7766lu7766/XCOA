export default class API {
	constructor() {
		this.operating_report = {
			headquarters: new (require('./Request/OperatingReport').default)(),
		}
		this.statistics_finance = new (require('./Request/StatisticsFinance').default)()
	}
}
