import { useEffect } from "react"
import { config } from "tsslib/config";

export default function useClock({refDate, refTime, refCode}) {
  useEffect(()=>{
    setInterval(()=>{
      const now = new Date();
      const strDate = now.toLocaleDateString('en-US',{year: 'numeric', month:'2-digit', day:'2-digit', weekday:'long'}).replace(',', '');
      refDate.current.textContent = strDate;
      const strTime = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      refTime.current.textContent = strTime;

      refCode.current.focus();
    }, config.ui.refreshTimeout);
  }, []);
}
