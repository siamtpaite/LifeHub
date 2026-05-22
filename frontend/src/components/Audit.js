// ── AUDIT ────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";

export function Audit({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [logs, setLogs] = useState([]);

  useEffect(()=>{
    (async()=>{
      try {
        const t=await user.getIdToken();
        const r=await fetch(`${apiBaseUrl}/api/audit`,{headers:{Authorization:`Bearer ${t}`}});
        if(r.ok) setLogs(await r.json());
      } catch(e){}
    })();
  },[apiBaseUrl,user]);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"0 24px 24px"}}>
      <div className="full-panel-head" style={{paddingTop:16}}>
        <div>
          <div className="full-panel-title">Audit Logs</div>
          <div className="full-panel-sub">Immutable event log — every action, timestamped</div>
        </div>
        <span className="badge b-gray">{logs.length} events</span>
      </div>
      <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden",flex:1,overflowY:"auto"}}>
        {logs.map((log,i)=>(
          <div className="log-row" key={log.id||i}>
            <div className="log-ts">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="log-user">{(log.userId||"").split("@")[0]}</div>
            <div className="log-action">{log.action}<div className="log-detail">{log.details||""}</div></div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.25)"}}>{log.tenantId||""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Audit;
