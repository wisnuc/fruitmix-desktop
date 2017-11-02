import React from 'react'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import {
  TXTIcon, WORDIcon, EXCELIcon, PPTIcon, PDFIcon, VideoIcon, AudioIcon, JPGIcon, PNGIcon, GIFIcon, MOVIcon, MP4Icon
} from '../common/Svg'

const renderFileIcon = (name, metadata, setSize, dark, white) => {
  /* PDF, TXT, Word, Excel, PPT */
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = 'OTHER'

  const iconArray = {
    PDF: { Icon: PDFIcon, color: '#db4437' },
    TXT: { Icon: TXTIcon, color: dark ? '#FFFFFF' : 'rgba(0,0,0,0.54)' },
    DOCX: { Icon: WORDIcon, color: '#4285f4' },
    DOC: { Icon: WORDIcon, color: '#4285f4' },
    XLS: { Icon: EXCELIcon, color: '#0f9d58' },
    XLSX: { Icon: EXCELIcon, color: '#0f9d58' },
    PPT: { Icon: PPTIcon, color: '#db4437' },
    PPTX: { Icon: PPTIcon, color: '#db4437' },
    MP3: { Icon: AudioIcon, color: '#00bcd4' },
    APE: { Icon: AudioIcon, color: '#00bcd4' },
    FLAC: { Icon: AudioIcon, color: '#00bcd4' },
    WMA: { Icon: AudioIcon, color: '#00bcd4' },
    MP4: { Icon: VideoIcon, color: '#f44336' },
    MOV: { Icon: VideoIcon, color: '#f44336' },
    AVI: { Icon: VideoIcon, color: '#f44336' },
    MKV: { Icon: VideoIcon, color: '#f44336' },
    FLV: { Icon: VideoIcon, color: '#f44336' },
    JPG: { Icon: PhotoIcon, color: '#ea4335' },
    PNG: { Icon: PhotoIcon, color: '#ea4335' },
    GIF: { Icon: PhotoIcon, color: '#ea4335' },
    OTHER: { Icon: EditorInsertDriveFile, color: dark ? '#FFFFFF' : 'rgba(0,0,0,0.54)' }
  }

  let type = extension.toUpperCase()
  // debug('renderFileIcon', name, metadata, extension, iconArray, type)
  if (!iconArray[type]) type = 'OTHER'

  let { Icon, color } = iconArray[type]
  const size = setSize || 24

  /* media */

  if (metadata && metadata.m) {
    switch (metadata.m) {
      case 'JPEG':
        Icon = JPGIcon
        color = '#ea4335'
        break
      case 'PNG':
        Icon = PNGIcon
        color = '#ea4335'
        break
      case 'GIF':
        Icon = GIFIcon
        color = '#ea4335'
        break
      case 'MOV':
        Icon = MOVIcon
        color = '#f44336'
        break
      case 'MP4':
        Icon = MP4Icon
        color = '#f44336'
        break
      case '3GP':
        Icon = MP4Icon
        color = '#f44336'
        break
      default:
    }
  }

  /* when background is dark, icon color should adjust to white */
  if (white) color = '#FFFFFF'

  return (<Icon style={{ color, width: size, height: size }} />)
}

export default renderFileIcon
