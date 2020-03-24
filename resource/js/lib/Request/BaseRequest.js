import { iBaseRequest } from 'jactools'
import SuccessCodes from 'constants/SuccessCodes'
import ErrorCodes from 'constants/ErrorCodes'
import axios from 'axios'

export default class BaseRequest extends iBaseRequest {
	get host() {
		return window.apiHost //require('../../../../env.json').api
	}

	get baseUrls() {
		return super.baseUrls.concat('gateway')
	}

	axiosInit() {
		super.axiosInit()
		axios.default.withCredentials = true
	}

	constructor() {
		super({
			SuccessCodes,
			ErrorCodes,
		})
	}

	resultHandle(res, options) {
		if (res.data.status_code === 401) {
			parent.location.href = '/login.html'
		}
		return super.resultHandle(res, options)
	}

	errorHandle(res, errorMessages) {
		const msg = errorMessages.join('\n')
		if (res.data.code.indexOf('00001-5') > -1) {
			alert(_.map(res.data.data.msg, msg => (ErrorMessages[msg] ? ErrorMessages[msg] : msg)).join('\n'))
		} else {
			alert(msg ? msg : '操作失败')
		}
		throw { message: msg, ...res }
	}
}
