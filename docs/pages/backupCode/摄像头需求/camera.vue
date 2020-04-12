<template>
    <div class="saas-member-img-camera">
        <div class="camera-btn-panel" >
            <div class="camera-btn" @click="cameraClick()"></div>
            <span>拍摄照片</span>
            <video id="video" controls autoplay="autoplay" v-show="isPlaying && !shotFinished" @click="imgShot()"></video>
            <canvas id="canvas"  v-show="shotFinished" width="104" height="149"></canvas>
            <el-select class="camera-select" @change="onDeviceChange" v-model="selectedDevice">
                  <el-option
                    v-for="item in deviceList"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label">
                  </el-option>
                </el-select>
        </div>
        <div class="">
          <input type="file" value="测试大文件" @change="uploadBigFile">
        </div>
        <div class="btns" v-show="shotFinished">
          <img :src="curValue" alt="">
            <button class="img-btn modify-btn" @click="modifyImg">重拍</button>
            <button class="img-btn" @click="deleteImg">删除</button>
        </div>
        <modal v-if="showModal" title="选择设备" @cancel="onClose" @confirm="onConfirmClick">
            <div class="camera-list" slot="content">
                <label>摄像头设备：</label>
                <el-select class="camera-select" @change="onDeviceChange" v-model="selectedDevice">
                  <el-option
                    v-for="item in deviceList"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label">
                  </el-option>
                </el-select>
                <span class="camera-error" v-show="isCameraError">此设备不可用!</span>
            </div>
        </modal>
    </div>
</template>

<script>
// import Modal from '@/components/basic/Modal'
import imgUpload from './imgUpload'

export default {
  name: 'img-camera',
  data () {
    return {
      isPlaying: false,
      shotFinished: false,
      curValue: '',
      deviceArray: [],
      showModal: false,
      isCameraError: false,
      hasOpenCamera: false,
      selectedDevice: ''
    }
  },
  components: {
    // Modal
    // 'app-select': Select
  },
  computed: {
    isFullScreen () {
      return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement
    },
    deviceList () {
      const deviceList = []
      if (this.deviceArray.length > 0) {
        this.deviceArray.forEach((item) => {
          deviceList.push({
            // value: new formUtils.FormItem('摄像头ID', item.deviceId, value => Validator.value(value)),
            value: item.deviceId,
            label: item.label
          })
        })
      }

      return deviceList
    }
    // deviceItem () {
    //   let result
    //   if (this.deviceList.length > 0) {
    //     // result = new formUtils.FormItem('摄像头ID', this.deviceList[0].value, value => Validator.value(value))
    //     result = this.deviceList[0].value
    //   }
    //   return result
    // }
  },
  watch: {
    isPlaying (val) {
      // 拍照后自动关闭摄像头(不仅是隐藏video，要关闭摄像头)
      if (!val && this.mediaStreamTrack) {
        this.mediaStreamTrack.stop()
      }
    },
    hasOpenCamera (val) {
      // 打开摄像头之后自动全屏
      if (val) {
        this.toFullScreen(this.video)
      }
    }
  },
  methods: {
    uploadBigFile (e) {
      imgUpload({
        extendData: {
          upfile: e.target.files[0]
        },
        process: (data) => {
          console.log(data, 'process')
        }
      })
      // let reader = new FileReader()
      // reader.readAsDataURL(e.target.files[0])// 发起异步请求
      // reader.onload = function (data) {
      //   debugger
      //   // 读取完成后，数据保存在对象的result属性中
      //   console.log(data)
      // }
    },
    emitChange (val) {
      this.curValue = Object.assign({}, val || this.curValue)
      // this.$emit('input', this.curValue)
    },
    cameraClick () {
      if (this.deviceArray.length === 0) {
        return
      }
      const localDeviceId = localStorage.getItem('deviceId')
      const deviceCount = this.deviceArray.length
      if (deviceCount === 1) {
        // 只有一个摄像头
        this.myConstraints = {
          video: {
            deviceId: {
              exact: this.deviceArray[0].deviceId
            },
            width: window.screen.width,
            height: window.screen.height
          }
        }
        this.openCamera()
      } else if (deviceCount > 1 && !localDeviceId) {
        // 至少两个摄像头，第一次使用摄像头
        this.showModal = true
      } else if (deviceCount > 1 && localDeviceId) {
        // 至少两个摄像头，非第一次使用摄像头
        const oldDevice = this.deviceArray.filter(item => item.deviceId === localDeviceId)
        if (oldDevice) {
          // 当前设备id列表中包含上次使用的设备id
          this.myConstraints = {
            video: {
              deviceId: {
                exact: localDeviceId
              },
              // deviceID: localDeviceId,
              width: window.screen.width,
              height: window.screen.height
            }
          }
          this.openCamera()
        } else {
          // 当前设备id列表中包含上次使用的设备id
          this.showModal = true
        }
      }
    },
    openCamera () {
      this.isPlaying = false
      this.shotFinished = false
      this.video = document.getElementById('video')
      if (!this.video || this.hasOpenCamera) {
        return
      }
      const setVideo = (stream) => {
        // this.video.src = window.webkitURL.createObjectURL(stream)
        this.video.srcObject = stream
        this.mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[0]
        this.video.play()
        this.isPlaying = true
        // this.timerList.timerOfExitFullScreen = setInterval(() => {
        //   if (!this.isPlaying) {
        //     mediaStreamTrack.stop() // 关闭摄像头
        //     clearInterval(this.timerList.timerOfExitFullScreen)
        //     this.timerList.timerOfExitFullScreen = null
        //   }
        // }, 1000)
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // 新版，Chrome中为版本>=53
        navigator.mediaDevices.getUserMedia(this.myConstraints).then((stream) => {
          setVideo(stream)
          this.showModal = false
          this.hasOpenCamera = true
          this.toFullScreen(this.video)
        }, (error) => {
          debugger
          if (error.name === 'OverconstrainedError') {
            this.isCameraError = true
          } else {
            this.$message(error.name || error)
          }
        })
      } else if (navigator.getUserMedia) {
        // 旧版,Chrome中为21<=版本<=52
        navigator.getUserMedia(this.myConstraints, (stream) => {
          setVideo(stream)
          this.hasOpenCamera = true
          this.toFullScreen(this.video)
          this.showModal = false
        }, (error) => {
          if (error.name === 'OverconstrainedError') {
            this.isCameraError = true
          } else {
            this.$message(error.name || error)
          }
        })
      } else {
        this.$message('当前浏览器不支持拍摄照片，请更换浏览器')
      }
      // this.timerList.timerOfFullScreen = setInterval(() => {
      //   if (this.hasOpenCamera) {
      //     this.toFullScreen(this.video)
      //     clearInterval(this.timerList.timerOfFullScreen)
      //     this.timerList.timerOfFullScreen = null
      //   }
      // }, 1000)
    },
    imgShot () {
      debugger
      const oldUrl = this.curValue
      const canvas = document.getElementById('canvas')
      if (!canvas) {
        return
      }
      const context = canvas.getContext('2d')

      const sourceHeight = this.video.videoHeight
      const sourceWidth = (canvas.width * sourceHeight) / canvas.height
      const sourceX = (this.video.videoWidth - sourceWidth) / 2
      const sourceY = 0
      context.drawImage(this.video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
      this.emitChange({
        errorMsg: '素材正在上传中, 请耐心等待',
        isLoading: true
      })
      const imgData = canvas.toDataURL('image/png')
      const self = this
      imgUpload({
        extendData: {
          upfile: this.dataURLtoFile(imgData)
        },
        process: (data) => {
          console.log(data, 'process')
          this.process = data
        },
        success: (data) => {
          self.isPlaying = false
          self.shotFinished = true
          self.hasOpenCamera = false
          self.emitChange({
            url: data.strContent
          })
        },
        error: (errorMsg) => {
          self.isPlaying = false
          self.hasOpenCamera = false
          self.emitChange({
            errorMsg,
            url: oldUrl || ''
          })
          this.$message(errorMsg)
        }
      })
      if (this.isFullScreen) {
        this.exitFullscreen()
      }
    },
    dataURLtoFile (dataurl, filename = 'file') {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]// 获得文件类型
      const suffix = mime.split('/')[1]
      const bstr = atob(arr[1])// 解码base64，返回文件原本的字符
      let n = bstr.length
      const u8arr = new Uint8Array(n)// 创建一个长度为n的8位无符号整型数组
      while (n) {
        n -= 1
        u8arr[n] = bstr.charCodeAt(n)// 返回Unicode 编码
      }
      return new File([u8arr], `${filename}.${suffix}`, { type: mime })// 以ArrayBuffers格式作为输入，封装为Blob
    },
    modifyImg () {
      this.openCamera()
    },
    deleteImg () {
      this.isPlaying = false
      this.shotFinished = false
      this.emitChange({})
    },
    toFullScreen (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      } else if (element.oRequestFullscreen) {
        element.oRequestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen()
      } else {
        this.$message('当前浏览器不支持全屏')
      }
    },
    exitFullscreen () {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.oRequestFullscreen) {
        document.oCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else {
        this.$message('当前浏览器不支持全屏')
      }
    },
    getDevices (deviceInfos) {
      deviceInfos.forEach((item) => {
        if (item.kind === 'videoinput') {
          this.deviceArray.push(item)
        }
      })
    },
    onDeviceChange (item) {
      // this.deviceItem.value = item.value
      this.selectedDevice = item
      this.isCameraError = false
      this.onConfirmClick()
    },
    onConfirmClick () {
      // const selectedDeviceId = typeof this.deviceItem.value === 'object' ? this.deviceItem.value.getValue() : this.deviceItem.value
      const selectedDeviceId = this.selectedDevice
      this.myConstraints = {
        video: {
          deviceId: {
            exact: selectedDeviceId
          },
          // deviceID: selectedDeviceId,
          width: window.screen.width,
          height: window.screen.height
        }
      }
      try {
        localStorage.setItem('deviceId', selectedDeviceId)
      } catch (oException) {
        if (oException.name === 'QuotaExceededError') {
          console.log('已经超出本地存储限定大小！')
        }
      }
      this.openCamera()
    },
    onClose () {
      this.showModal = false
    }
  },
  created () {
    this.$emit('input', this.curValue)
    // this.timerList = {}
    if (navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(this.getDevices)
    } else {
      this.$message('当前浏览器不支持拍摄照片，请更换浏览器')
    }
  }
}
</script>

<style lang="less">
    // @import "~@gfe/coca-style/style/color.less";
    .saas-member-img-camera{
        position:relative;
        .camera-btn-panel {
            .camera-btn{
                width: 110px;
                height: 155px;
                text-align: center;
                background: #ccc url("../assets/img/logo.png") no-repeat center 52px;
                background-size: 24px 22px;
                font-size: 14px;
                color: #ccc;
                border: 1px dashed #ccc;
                border-radius: 2px;
                position: relative;
                display: inline-block;
            }
            span{
                display: inline-block;
                position:absolute;
                top:84px;
                width:100%;
                text-align: center;
            }
            #video{
                position:fixed;
                top:50%;
                left:50%;
                z-index:1000;
                transform:translate(-50%,-50%);
            }
            #canvas{
                position:absolute;
                top:3px;
                left:3px;
            }
        }
        .btns{
            .modify-btn {
                margin-left: 6px;
            }
            .img-btn {
                padding: 2px 4px;
                margin: 0 2px;
                cursor: pointer;
                display:inline-block;
                vertical-align: bottom;
                &[disabled] {
                    cursor: not-allowed;
                }
            }
        }

    }
    .camera-list{
        text-align: center;
        min-height: 150px;
        padding:20px;
        label{
            display:inline-block;
            margin-right:15px;
            font-size:14px;
            line-height:36px;
        }
        .camera-select{
            display: inline-block;
        }
        .camera-error{
            display: block;
            margin:10px;
            font-size:14px;
            color:red;
        }

    }
    .item-footer {
        position: relative;
        text-align: center;
        .btn-group a{
            width:100px;
        }
    }

</style>
