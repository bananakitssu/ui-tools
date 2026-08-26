import { useState, useEffect, useRef } from "react";

export default function Video({url}: {url: string}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <div id="video-container" style={{
      background: "black",
      borderRadius: "20px",
      width: "265px",
      height: "150px",
      overflow: "hidden"
    }}>
      <video id="video" src={url} style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px"
      }} key={url} controls ref={videoRef} />
    </div>
  )
}