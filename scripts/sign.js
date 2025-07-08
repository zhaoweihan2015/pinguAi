module.exports = async function (configuration) {
    const path = require('path')
    const fs = require('fs')
  
    // 跳过 elevate.exe
    if (configuration.path && configuration.path.endsWith('elevate.exe')) {
      console.log('Skipping signing for elevate.exe')
      return
    }
  
    // 继续用默认签名方式
    const sign = require('electron-builder-lib/out/windowsCodeSign/sign').sign
    await sign(configuration)
  }
  