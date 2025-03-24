export function convertToBase64(file: File): Promise<{
    base64: string,
    mimeType: string,
}> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        resolve({
            base64: reader.result?.toString() ?? "",
            mimeType: file.type,
        })
      }
      
      reader.onerror = error => reject(error)
      
      // 开始读取文件
      reader.readAsDataURL(file)
    })
  }