import { useState } from 'react'

type VideoSlideVideoProps = {
  slideId: string
  src: string
  poster?: string
}

/** Vídeo por slide: `key` no pai reinicia o estado quando o cenário muda; `onError` oculta MP4 em falta. */
export function VideoSlideVideo({ slideId, src, poster }: VideoSlideVideoProps) {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      autoPlay
      onError={() => setShow(false)}
      aria-label={`Vídeo: ${slideId}`}
    />
  )
}
