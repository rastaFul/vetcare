export interface UploadResult {
  storageKey: string
  url: string
}

export interface IStorageService {
  upload(file: Buffer, key: string, mimeType: string): Promise<UploadResult>
  getDownloadUrl(storageKey: string): Promise<string>
  delete(storageKey: string): Promise<void>
}
