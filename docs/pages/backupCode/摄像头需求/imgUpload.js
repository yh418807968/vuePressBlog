// import { concatImgUrl } from '@/utils' // 采用云之家的图片上传接口测试
function uploadWithFormData (options) {
  const formData = new FormData()
  Object.keys(options.extendData || {}).forEach((key) => {
    formData.append(key, options.extendData[key])
  })

  const xhr = new XMLHttpRequest()
  xhr.open(options.method || 'POST', options.url)
  xhr.setRequestHeader('Accept', '*/*')
  // xhr.setRequestHeader("Content-Type","multipart/form-data;charset=UTF-8");
  xhr.addEventListener('load', (msg) => { // 接收到完整的响应数据时触发
    const responseText = msg.target.responseText
    //  这里忽略200,  服务端会返回401等其他错误,  这个放到success回调里面处理
    if (1 || msg.target.status === 200) {
      let responseJson = {}
      try {
        responseJson = JSON.parse(responseText)
        if (options.success) options.success(responseJson)
      } catch (e) {
        if (options.error) options.error(responseText)
      }
    } else if (options.error) {
      options.error(responseText)
    }
  }, false)
  xhr.addEventListener('error', () => {
    if (options.error) options.error()
  }, false)
  xhr.addEventListener('progress', (event) => {
    const pre = Math.floor((100 * event.loaded) / event.total)
    if (options.process) options.process(pre)
  })
  xhr.addEventListener('abort', () => {
    if (options.error) options.error('timeout')
  }, false)

  xhr.send(formData)
  if (options.timeout) {
    setTimeout(() => {
      xhr.abort()
    }, options.timeout)
  }
}

function fileUpload (options) {
  if (window.FormData === undefined) {
    // 此处是ie9不支持FormData,但调用摄像头的getUserMedia也不支持ie,因此直接报错不支持拍摄照片
    this.$error('当前浏览器不支持拍摄照片，请更换浏览器')
  } else {
    uploadWithFormData(options)
  }
}
function imgUpload (options) {
  const upOptions = Object.assign({
    timeout: 30000,
    extendData: {}
  }, options)
  const apiUrl = `/docrest/doc/file/uploadfile?t=${+new Date()}`
  fileUpload({
    url: apiUrl,
    timeout: upOptions.timeout,
    extendData: upOptions.extendData,
    process: function process (pro) {
      if (upOptions.process) {
        upOptions.process(pro)
      }
    },
    success: function success (response) {
      if (response && response.data) {
        if (upOptions.success) {
          response.data.strContent = concatImgUrl(response.data.fileId)
          upOptions.success(response.data)
        }
      } else if (upOptions.error) {
        upOptions.error(response.msg || '照片上传失败，请重试')
      }
    },
    error: function error (e) {
      if (upOptions.error) {
        upOptions.error('照片上传失败，请重试')
      }
    }
  })
}
export default imgUpload
