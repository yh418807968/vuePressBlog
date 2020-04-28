import { extend } from '@/entrys/qing/libs/object'
import ApiChecker from './api-checker'
import './simulate'

const qing = window.qing

// 触发document事件
const dispatchEvent = function (name, params) {
  var event = document.createEvent('HTMLEvents')
  extend(event, params)
  event.initEvent(name)
  document.dispatchEvent(event)
}

// 解析命名空间
var methodParse = function (method) {
  var obj = method.match(/(.+)\.([^.]+)/);

  if (obj && obj.length === 3) {
    return {
      name: obj[2],
      ns: obj[1]
    }
  };

  return {
    ns: '',
    name: method
  };
}

var clientVersion = (function () {
  var qingUA = navigator.userAgent.split(';')[0];
  var qingVersion = qingUA.slice(qingUA.indexOf('Qing/') + 5);
  return parseFloat(qingVersion.slice(2));
}())

// 回调管理
const callbacks = {
  // 集合
  map: {},
  // 序号（奇数）
  index: 1,
  indexStep: 2,
  // 注册一个 callback 并返回它的 id
  register: function (callback) {
    this.index += this.indexStep;
    var id = '' + this.index;

    if (typeof callback == 'function') {
      this.map[id] = function (message) {
        this.cb.call(null, message)
      }.bind({
        map: this.map,
        id: id,
        cb: callback
      });
    };

    return id;
  },
  // 根据 id 触发 callback
  invoke: function (id, message) {
    var cb = this.map[id + ''];

    if (typeof cb === 'function') {
      cb(message);
    }
  }
};

var events = {};

const CHBridge = {
  // js 调用 native 方法
  invoke: function (method, message, callback) {
    var v9bridgeProtocol = (window.ClientInfo || {}).v9bridge || 'cloudhub'
    return XTBridge.call(method, message, callback, v9bridgeProtocol)
  },
  // native 回调 js
  // loadUrl("javascript:CloudHubJSBridge.callback(port,resultData)");
  callback: function (callbackid, message) {
    return XTBridge.handleMessageFromXT(callbackid, message)
  },
  // 绑定事件
  on: function (eventName, callback) {
    if (!events[eventName]) {
      events[eventName] = [];
    };
    events[eventName].push(callback);
  },
  // 触发事件
  trigger: function (eventName, params) {
    (events[eventName] || []).forEach(function (callback) {
      if (typeof callback === 'function') {
        callback(params);
      }
    });
  }
};

// 讯通桥（走xuntong://协议）
const XTBridge = {
  // js 调用 native 方法
  call: function (method, message, callback, protocol) {
    var cid = callbacks.register(callback);
    var url;

    if (typeof message === 'undefined') {
      message = '';
    } else {
      message = encodeURIComponent(JSON.stringify(message));
    }

    if (protocol) {
      // cloudhub 或 v9bridge
      method = methodParse(method);
      url = protocol + '://' + method.ns + ':' + cid + '/' + method.name +'?' + message;
    } else {
      // 默认讯通协议
      url = 'xuntong:' + method + ':' + cid + ':' + message;
    }

    if (qing.isAndroid) {
      if (window.AndroidInterface) {
        // 最新版本的android，使用注入api通信
        window.AndroidInterface.call(url)
        return cid
      } else if (clientVersion >= 9.59) {
        // 次新版本的android，使用prompt通信
        window.prompt(url)
        return cid
      }
    } else {
      // 新版本的ios，使用注入api通信
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.wkbridge2) {
        window.webkit.messageHandlers.wkbridge2.postMessage({
          url: url
        })
        return cid
      } else if (window.kdUIWebViewBridge) {
        window.kdUIWebViewBridge(url)
        return cid
      }
    }

    // 旧版本ios和andorid， 使用iframe进行通信
    var iframes = window.XTBridgeIframes = window.XTBridgeIframes || (function () {
      var fs = [],
        iframe, i;
      for (i = 0; i < 9; i++) {
        iframe = document.createElement('IFRAME');
        iframe.setAttribute('height', '1px');
        iframe.setAttribute('width', '1px');
        iframe.style.display = 'none';
        document.documentElement.appendChild(iframe);
        fs.push(iframe)
      }
      return fs;
    }());

    XTBridge.callbackIndex = XTBridge.callbackIndex || 0;
    var index = XTBridge.callbackIndex;
    XTBridge.callbackIndex += 1;
    var iframeIndex = index % 9;
    var iframe = iframes[iframeIndex];
    iframe.setAttribute('src', url);

    // 指定时间后移除iframe的src属性，暂时解决分享桥会出现多次弹出的问题
    // 可能是图片太大的问题，导致分享桥多次调用
    setTimeout(function () {
      iframe.removeAttribute('src');
    }, 10)

    return cid
  },
  // native 回调 js
  // loadUrl("javascript:CloudHubJSBridge.callback(port,resultData)");
  handleMessageFromXT: function (callbackid, message) {
    if (typeof message === 'string' && message.match(/^\s*\{/)) {
      try {
        message = JSON.parse(message);

        // 把"true"或者"false"转成布尔值
        if (message && typeof message.success === 'string') {
          message.success = message.success === 'true';
        }
      } catch (e) {
        console.error(e)
      }
    };
    callbacks.invoke(callbackid, message)
  }
};

// ===============================================

// 工作台api（走cloudhub://协议）
const cloudofficeMethodList = [
  'runtime.auth',
  'runtime.jsReady', // desktop不用实现
  'cloudoffice.request',
  'cloudoffice.showCardNotify',
  'cloudoffice.clearCardNotify',
  'cloudoffice.getRoleType', // desktop不用实现
  'cloudoffice.checkAppAuth',
  'cloudoffice.shareText', // desktop不用实现
  'cloudoffice.downloadPic', // desktop不用实现
  'cloudoffice.checkWorkbenchUpdate', // desktop不用实现
  'cloudoffice.textShareClosed', // desktop不用实现
  'cloudoffice.dataReport', // desktop不用实现
  'cloudoffice.setScrollEnable', // desktop不用实现
  'ui.changeNavBarStyle', // desktop不用实现
  'ui.changeNavStyle', // desktop不用实现
  'ui.toast',
  'ui.webViewScrollTo', // desktop不用实现
  'ui.webViewPaddingTop',
  'ui.navigate',
  'storage.getItem',
  'storage.setItem',
  'storage.removeItem',
  'storage.clear',
  'bluetooth.openBluetoothAdapter',
  'bluetooth.closeBluetoothAdapter',
  'bluetooth.getBluetoothAdapterState',
  'bluetooth.onBluetoothAdapterStateChange',
  'bluetooth.startBluetoothDevicesDiscovery',
  'bluetooth.stopBluetoothDevicesDiscovery',
  'bluetooth.getBluetoothDevices',
  'bluetooth.onBluetoothDeviceFound',
  'bluetooth.getConnectedBluetoothDevices',
  'bluetooth.createBLEConnection',
  'bluetooth.closeBLEConnection',
  'bluetooth.getBLEDeviceServices',
  'bluetooth.getBLEDeviceCharacteristic',
  'bluetooth.readBLECharacteristicValue',
  'bluetooth.writeBLECharacteristicValue',
  'bluetooth.notifyBLECharacteristicValueChange',
  'bluetooth.onBLEConnectionStateChange',
  'bluetooth.onBLECharacteristicValueChange',
  'bluetooth.getBLEDeviceCharacteristics',
  'bluetooth.BLEPrint',
  'bluetooth.getBondDevice',
  'bluetooth.connectBluetoothDevice',
  'bluetooth.writeBluetoothDevice',
  'bluetooth.closeBluetoothConnection',
  'video.startRecord',
  'video.upload',
  'video.download',
  'video.play',
  'video.select'
]

// 创建 window.CloudHubJSBridge 并防止被老版本客户端内置的 cloudhub-bridge.js 覆盖
Object.defineProperty(window, 'CloudHubJSBridge', {
  set: function () {},
  get: function () {
    return CHBridge
  }
})

// 复合 window.XuntongJSBridge 桥
const bridge = {
  // 会根据method名来选择：走xuntong协议还cloudhub协议
  call: function (method) {
    if (cloudofficeMethodList.some(n => n === method)) {
      CHBridge.invoke.apply(null, arguments);
    } else {
      XTBridge.call.apply(null, arguments);
    }
  },
  // 客户端调用CloudHubJSBridge.trigger触发的事件，包括appear等
  on: CHBridge.on,
  handleMessageFromXT: XTBridge.handleMessageFromXT
};
bridge.invoke = bridge.call
window.XuntongJSBridge = bridge

const eventPrefix = 'eventPrefix_'
const rigistedEvent = {}

const registerEvent = function (name) {
  if (!rigistedEvent[name]) {
    rigistedEvent[name] = true
    bridge.on(name, function (data) {
      dispatchEvent(eventPrefix + name, {
        eventData: data
      });
    })
  }
}

export function call(name, params) {
  params = params || {}
  // 其它api
  let success = params.success
  delete params.success
  delete params.error


  bridge.call(name, params, function (ret) {
    success && success(ret)
  })
}

// 因为CloudHubJSBridge上只有on没有off
// 所次此处通过document来接收
// 注：所以name只能是config({jsEventList})里声明了的事件
export function on (name, handler) {
  if (!handler) return

  registerEvent(name)

  // handler参数如果是函数，转成对象
  if (typeof handler === 'function') {
    handler = {
      success: handler
    }
  }

  document.addEventListener(eventPrefix + name, e => {
    // 成功回调函数
    if (typeof handler.success === 'function') {
      handler.success(e.eventData)
    }
  })
}

export function off (name, handler) {
  document.removeEventListener(eventPrefix + name, handler)
}

export function checkJsApi (params) {
  let jsApiList = params.jsApiList
  let map = {}
  if (qing.checkVersion('0.9.80')) {
    // 通过客户端桥判断
    qing.call('checkJsApi', params)
  } else {
    // 通过QING版本的方式判断
    let checker = ApiChecker();
    (jsApiList || []).forEach((name) => {
      var api = checker[name]
      var platform = qing.isAndroid ? 'android' : (qing.isIos ? 'ios' : 'other')

      if (api && api[platform] && qing.checkVersion(api.version)) {
        map[name] = true
      } else {
        map[name] = false
      }
    })

    if (typeof params.success === 'function') {
      params.success({
        success: true,
        data: map
      })
    }
  }
}

export function trigger (name, params) {
  CHBridge.trigger(name, params)
}