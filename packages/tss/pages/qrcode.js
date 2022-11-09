import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsQR from "jsqr";

export default function Home() {
  const [name, setName] = useState("");
  const [empno, setEmpno] = useState("");
  const [code, setCode] = useState("");
  const [qrcode, setQRCode] = useState("");

  const refVideo = useRef();
  const refSvg = useRef();
  const refCanvas = useRef();

  const setupCamera = async ()=>{
    console.log("setting up camera");
    
    refVideo.current.onplay = function() {
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

  const decode = ()=>{
    const context = refCanvas.current.getContext('2d');

    const myInterval = setInterval(()=>{
      context.drawImage(refVideo.current, 0, 0, refVideo.current.videoWidth, refVideo.current.videoHeight);
      const imageData = context.getImageData(0, 0, refVideo.current.videoWidth, refVideo.current.videoHeight);
      
      const code = jsQR(imageData.data, 640, 480);
      if (code) {
        setQRCode(code);
        console.log(code);
        clearInterval(myInterval);
      }
    }, 100);

  }

  return (
    <div className='flex flex-col' ref={refSvg}>
      <div className='m-4'>
        <QRCodeSVG value={JSON.stringify({
          name, empno
        })} size={128}/>
      </div>

      <div className='m-4'>
        <QRCodeCanvas ref={refCanvas} value={JSON.stringify({
          name, empno
        })} size={128}/>
      </div>

      <div>
        <label>name</label>
        <input className="border-2" required type="text" value={name} onChange={(e)=>setName(e.target.value)}/>
      </div>
      
      <div>
      <label>emp no</label>
        <input className="border-2" required type="text" value={empno} onChange={(e)=>setEmpno(e.target.value)}/>
      </div>

      <div>
        <button className="border-2" onClick={decode}>decode</button>
      </div>

      <div>
        {qrcode.data}
      </div>

      <div>
        <video ref={refVideo} width="960" height="540" autoPlay></video>
        <canvas ref={refCanvas} width="960" height="540"></canvas>
      </div>

    </div>
  )
}

