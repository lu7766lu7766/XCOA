import BaseRequest from 'lib/Request/BaseRequest'
import _config from './config'

export default class Request extends BaseRequest
{
  get baseUrls()
  {
    return super.baseUrls.concat('api/headquarters/operating_report')
  }

  constructor()
  {
    super()
    this.config = _config
  }

  async getList(data, options)
  {
    return await this.request('list', data, options)
  }

  async getCompany(data, options)
  {
    return await this.request('company', data, options)
  }

  async getCurrency(data, options)
  {
    return await this.request('currency', data, options)
  }

  async getPayout(data, options)
  {
    return await this.request('payout', data, options)
  }

  async getDetail(data, options)
  {
    return await this.request('detail', data, options)
  }
}
