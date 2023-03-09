import { useEffect, useState } from "react"
import Head from 'next/head'
import App from './App'

export default function Home() {
  const [msg, setMsg] = useState();
  const [config, setConfig] = useState();
  useEffect(()=>{
    const readConfig = async ()=>{
      const result = await fetch('api/config', {
        method: 'GET', // or 'PUT'
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json'
        },
      });
      if (result.ok){
        const config = await result.json();
        console.log(config);
        setConfig(config);
      }
    }

    readConfig();
  }, []);

  const saveConfig = async ()=>{
    const result = await fetch('api/config', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (result.ok){
      const res = await result.json();
      if (res.msg == "OK") {
        setMsg("Updated");
      }
    }
  }

  if (config) return (
    <div className="w-full h-screen">
      <div className="py-12">
        <h2 className="text-2xl font-bold">Config</h2>
          <div className="mt-8 max-w-md">
            <div className="grid grid-cols-1 gap-6">
              <label className="block">
                <span className="text-gray-700">Store ID</span>
                <input type="text" className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " 
                  value={config.storeId}
                  onChange={(e)=>setConfig({
                    ...config,
                    storeId: e.target.value
                  })}/>
              </label>

              <label className="block">
                <span className="text-gray-700">Store name</span>
                <input type="text" className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " 
                  value={config.store} 
                  onChange={(e)=>setConfig({
                    ...config,
                    store: e.target.value
                  })}/>
              </label>

              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/4" onClick={saveConfig} disabled={msg}>
                {msg ? "Updated successfully" : "Save"}
              </button>
            </div>
          </div>
        </div>
    </div>
  )
  else return null;
}
