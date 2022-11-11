import { useState, useEffect, useRef } from "react"
//both require and import works
//const { config } = require("tsslib/config");
import { config } from "tsslib/config";
import Camera, { freeze, unfreeze } from "./Camera";
import useClock from "./Clock";

export function useCheckServer() {
  const [status, setStatus] = useState();
  const [ips, setIps] = useState();
  const [version, setVersion] = useState();
  const [db, setDb] = useState();

  let lastConnectedAt = new Date();
  useEffect(()=>{
    setInterval(async ()=>{
      try{
        const result = await fetch('api/status', {
          method: 'GET', // or 'PUT'
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json'
          },
        })
  
        if (result.ok){
          const res = await result.json();
          setStatus(res.status);
          setIps(res.ips);
          setVersion(res.version);
          setDb(res.db);
          lastConnectedAt = new Date();
          //console.log("res=", res);
        }
        else{
          setStatus(`Disconnected since ${lastConnectedAt.toLocaleString()}`);
        }
      }
      catch(ex){
        setStatus(`Failed since ${lastConnectedAt.toLocaleString()}`);
      }
    }, config.ui.checkServerTimeout);
  }, []);
  return { ips, version, db, status };
}

export function Action({tp, action}) {
  if (action.action=="wait") return null;
  if (action.action=="checkin") {
    if (tp=="checkin") return (
      <>
        <img width="200" src="images/enter.jpg" />
        <h1 className="text-3xl"></h1>
      </>
    )
    if (tp=="checkout") return (
      <>
        <img width="200" src={"photos/"+action.eid+".jpg"} />
        <h1 className="text-3xl">{action.name}</h1>
      </>
    )
  }

  if (action.action=="checkout") {
    if (tp=="checkin") return (
      <>
        <img width="200" src={"photos/"+action.eid+".jpg"} />
        <h1 className="text-3xl">{action.name}</h1>
      </>
    )
    if (tp=="checkout") return (
      <>
        <img width="200" src="images/exit.jpg" />
        <h1 className="text-3xl"></h1>
      </>
    )
  }
}

export default function App() {
  const refDate = useRef(null);
  const refTime = useRef(null);
  const refCode = useRef(null);

  const refVideo = useRef(null);
  const refCanvas = useRef(null);

  useClock({refDate, refTime, refCode});

  const [warning, setWarning]  = useState(false);
  const [action, setAction]  = useState({
    action: "wait"
  });
  
  const { ips, version, db, status } = useCheckServer();

  const submit = async (code) => {
    const image = freeze(refVideo, refCanvas);

    const data = {
      id: config.storeId,
      employee: {
        barcode: code,
        canvas: image
      }
    };

    const result = await fetch('api/punch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const employee = await result.json();

    if (employee) {
      let timeOut = config.ui.canvasTimeout;
      if (employee.active == 0){
        setWarning(true);
        timeOut = config.ui.warningCanvasTimeout;
      }

      setAction({
        action: employee.action,
        eid: employee.id,
        name: employee.name,
      });

      setTimeout(()=>{
        setAction({
          action: "wait",
        });
        setWarning(false);
        unfreeze(refVideo, refCanvas);
      }, timeOut);
    }
  }
  const grid = config.ui.grid ? "border-2" : "";
  
  return (
    <div className="flex flex-col w-full h-full font-mono">
      <div className={"flex grow-0 h-16 " + grid}>
        <div className={"flex grow-0 justify-center items-center text-3xl " + grid}>
          {config.store}
        </div>
        <div className={"flex grow " + grid}></div>
        <div ref={refDate} className={"flex grow-0 justify-center items-center text-3xl " + grid} />
      </div>
      
      {warning ? (
        <div ref={refTime} className={"flex grow-0 h-32 justify-center items-center text-8xl font-bold text-red-600 " + grid}>
          Account Disabled 此卡无效
        </div>
      )  : (
        <div ref={refTime} className={"flex grow-0 h-32 justify-center items-center text-8xl font-bold text-red-600 " + grid}>
        </div>
      )}

      <div className={"flex grow w-full " + grid}>
        <div name="left" className={"flex flex-col grow-0 justify-center items-center w-1/4 " + grid}>
          <Action tp="checkin" action={action} />
        </div>
        <div name="middle" className={"flex grow justify-center items-center " + grid}>
          {config.camera.enabled && <Camera refVideo={refVideo} refCanvas={refCanvas}/>}
        </div>
        <div name="right" className={"flex flex-col grow-0 justify-center items-center w-1/4 " + grid}>
          <Action tp="checkout" action={action} />
        </div>
      </div>
      <div className={"flex grow-0 h-16 " + grid}>
        <div className={"flex grow-0 justify-center items-center text-3xl " + grid}>
          <form>
            <input ref={refCode} type="password" autoComplete="new-password" className="border-2 rounded-xl" 
              onKeyPress={(e)=>{
                if (e.key === 'Enter') {
                  let code = refCode.current.value;
                  
                  if (process.env.NODE_ENV=="development") code = 'EMP08226';
                  console.log(code);
                  
                  const ms = code.match(/EMP\d+/);
                  if (ms && ms[0]) {
                    submit(ms[0]);
                  }
            
                  refCode.current.value = "";

                  e.preventDefault();
                  return false;
                }
              }
            } 
          />
          </form>
        </div>
        <div className={"flex grow " + grid}></div>
        <div className={"flex grow-0 justify-center items-center text-md " + grid}>
          <span className="mx-4">{status}</span>
          <span className="mx-4">{db}</span>
          <span className="mx-4">{ips}</span>
          <span className="mx-4">{version}</span>
        </div>
      </div>
    </div>
  )
}
