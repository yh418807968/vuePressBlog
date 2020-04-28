<template>
<div class="loading-wrap">
  <div class="loading-layer">
    <img
      class="loading-img"
      src="~@/assets/img/loading/loading-high.png"
      srcset="~@/assets/img/loading/loading-high.png 640w, ~@/assets/img/loading/loading-middle.png 320w"
      alt="loading"
    >
    <div class="loading-txt">{{ text }}</div>
  </div>
</div>
</template>

<script>
  export default {
    name: 'loading-img',
    props: {
      text: {
        type: String,
        default: '加载中'
      }
    }
  }
</script>

<style lang="less" scoped>
.loading-wrap {
  position: fixed;
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0;
  z-index: 999;
  .loading-layer {
    position: relative;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    margin-left: -50px;
    margin-top: -55px;
    background: rgba(12, 33, 63, .8);
    border-radius: 5px;
    overflow: hidden;
    .loading-img {
      width: 40px;
      height: 40px;
      margin-top: 20px;
      margin-left: 30px;
      margin-right: 30px;
      animation: loading 1s infinite linear;
    }
    .loading-txt {
      font-size: 10px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      color: #fff;
    }
  }
}
@keyframes loading {
  from {
    transform: rotate(0deg)
  }
  to {
    transform: rotate(360deg)
  }
}
</style>
