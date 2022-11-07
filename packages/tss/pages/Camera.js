import { useEffect } from "react"

function convertImageToCanvas(image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);
	return canvas;
}

function convertCanvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/jpeg");
	return image;
}

export const freeze = (refVideo, refCanvas)=>{
  if(refCanvas.current && refVideo.current){
    //when scan the code, 
    //1. copy the camera to canvas
    const context = refCanvas.current.getContext('2d');
    context.drawImage(refVideo.current, 0, 0, refVideo.current.videoWidth, refVideo.current.videoHeight);
    //2. hide the video and show the canvas, meaning the picture will freeze
    refVideo.current.style.zIndex = "10";
    refCanvas.current.style.zIndex = "20";
    //3. return the image 
    return refCanvas.current.toDataURL("image/jpeg")
  }
}

export const unfreeze = (refVideo, refCanvas)=>{
  if(refCanvas.current && refVideo.current){
    refVideo.current.style.zIndex = "20";
    refCanvas.current.style.zIndex = "10";
  }
}

export default function Camera({refVideo, refCanvas}) {
  const setupCamera = async ()=>{
    console.log("setting up camera");
    
    refVideo.current.onplay = function() {
    }

    refVideo.current.onresize = function(){
      refCanvas.current.width = refVideo.current.videoWidth;
      refCanvas.current.height = refVideo.current.videoHeight;
    }

    if( navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try{
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false });
        refVideo.current.srcObject = stream;
        await refVideo.current.play();
      }
      catch(ex){
        console.log(ex.toString());
      }
    }
  }

  useEffect(()=>{
    setupCamera();
  }, []);

  return (
    <>
      <video ref={refVideo} className="z-20 absolute" controls autoPlay></video>
      <canvas ref={refCanvas} className="z-10 absolute"></canvas>
    </>
  )
}
