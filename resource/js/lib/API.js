export default class API
{
  constructor()
  {
    this.operating_report = {
      headquarters: new (require('./Request/OperatingReport/Headquarters').default),
      branch: new (require('./Request/OperatingReport/Branch').default),
    }
    this.statistics_finance = new (require('./Request/StatisticsFinance').default)
  }
}
