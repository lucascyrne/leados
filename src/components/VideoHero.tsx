export function VideoHero() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        className="h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/leados-landing-video.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
