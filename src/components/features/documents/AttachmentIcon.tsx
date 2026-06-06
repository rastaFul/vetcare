import { FileText, Image, FileSearch, ClipboardList, File } from 'lucide-react'

interface Props {
  type: string
  mimeType?: string
  className?: string
}

export function AttachmentIcon({ type, mimeType, className = 'w-5 h-5' }: Props) {
  if (mimeType?.startsWith('image/')) {
    return <Image className={className} />
  }

  switch (type) {
    case 'EXAM':
      return <FileSearch className={className} />
    case 'PHOTO':
      return <Image className={className} />
    case 'REPORT':
      return <FileText className={className} />
    case 'EXTERNAL_PRESCRIPTION':
      return <ClipboardList className={className} />
    default:
      return <File className={className} />
  }
}
