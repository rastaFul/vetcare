import fs from 'fs'
import path from 'path'
import { IStorageService, UploadResult } from '../../application/ports/IStorageService'

export class LocalStorageAdapter implements IStorageService {
  private readonly baseDir: string

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.join(process.cwd(), 'public', 'uploads')
  }

  async upload(file: Buffer, key: string, _mimeType: string): Promise<UploadResult> {
    const filePath = path.join(this.baseDir, key)
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, file)
    return {
      storageKey: key,
      url: `/uploads/${key}`,
    }
  }

  async getDownloadUrl(storageKey: string): Promise<string> {
    return `/uploads/${storageKey}`
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.baseDir, storageKey)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}
