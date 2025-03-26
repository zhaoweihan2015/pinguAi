import fs from "fs"
import path from "path"

// Global variable to store file names
let publicFiles: string[] = []
let isInitialized = false

// Function to recursively get all files in a directory
function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], basePath = ""): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    const relativePath = path.join(basePath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, relativePath)
    } else {
      arrayOfFiles.push(relativePath.replace(/\\/g, "/"))
    }
  })

  return arrayOfFiles
}

// Initialize the file list if not already initialized
export function getPublicFiles(): string[] {
  if (!isInitialized) {
    try {
      const publicDir = path.join(process.cwd(), "public","image")
      if (fs.existsSync(publicDir)) {
        publicFiles = getAllFiles(publicDir)
        console.log("Public files initialized:", publicFiles)
      } else {
        console.warn("Public directory does not exist")
        publicFiles = []
      }
    } catch (error) {
      console.error("Error initializing public files:", error)
      publicFiles = []
    }
    isInitialized = true
  }
  return publicFiles
}

// Force reinitialization if needed
export function refreshPublicFiles(): string[] {
  isInitialized = false
  return getPublicFiles()
}

