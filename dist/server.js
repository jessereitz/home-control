!function(e){var s={};function r(n){if(s[n])return s[n].exports;var t=s[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,r),t.l=!0,t.exports}r.m=e,r.c=s,r.d=function(e,s,n){r.o(e,s)||Object.defineProperty(e,s,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,s){if(1&s&&(e=r(e)),8&s)return e;if(4&s&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&s&&"string"!=typeof e)for(var t in e)r.d(n,t,function(s){return e[s]}.bind(null,t));return n},r.n=function(e){var s=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(s,"a",s),s},r.o=function(e,s){return Object.prototype.hasOwnProperty.call(e,s)},r.p="",r(r.s=2)}([function(e,s){e.exports=require("path")},function(e,s){e.exports=require("chalk")},function(e,s,r){e.exports=r(3)},function(e,s,r){const n=r(4),t=r(0),o=r(5),i=r(6),a=r(7),u=r(1),c=r(8),d=r(12),p=o();p.use(a.urlencoded({extended:!1})),p.use(a.json()),p.use(i({name:"session",keys:["9LB0CTiwXxMUtu+eFRfmcw09vSg="],maxAge:288e5})),p.use((e,s,r)=>{if(e.session&&e.session.user)return r();return e.path.match(/api/)&&"/api/user/login"!==e.path?s.send({status:"error",msg:"Please authenticate before continuing"}):r(),null});let l=null;try{l=JSON.parse(n.readFileSync("./server-config.json","utf-8"))}catch(e){console.error(u.bold.red("ERORR: No server data."),"Please run 'npm run initialize' before starting the server."),process.exit(1)}const f=l.servers.map(e=>{const s=Object.create(c);return s.init(e),s});p.use(o.static(t.join(__dirname,"static"))),p.get("/",(e,s)=>s.sendFile(t.join(__dirname,"static/build/index.html"))),p.get("/api/user",(e,s)=>{const r={};e.session.user?d.init(e.session.user,(e,n)=>{e?(r.status="error",r.msg=e.message):(r.name=n.name,r.username=n.username,r.uid=n.id),s.send(r)}):(r.status="error",r.msg="No user.",s.send(r))}),p.post("/api/user/login",(e,s)=>{let r={};return e.body.username&&e.body.password?(d.init(e.body.username,n=>n?(r={status:"error",msg:n},s.send(r)):(d.checkPassword(e.body.password).then(n=>(n?(r={status:"success",msg:"Successfully logged in.",user:{uid:d.info.id,name:d.info.name,username:d.info.username}},e.session.user=d.info.id):r={status:"error",msg:"Invalid password"},s.send(r))).catch(e=>(r={status:"error",msg:e.message},s.send(r))),null)),null):(r={status:"error",msg:"Invalid username or password"},s.send(r))}),p.get("/api/user/logout",(e,s)=>{e.session&&e.session.user?(e.session=null,s.send({status:"success",msg:"Logged out successfully."})):s.send({status:"error",msg:"No user."})}),p.get("/api/servers",(e,s)=>e.session.user?s.send(f):{status:"error"}),p.get("/api/ping/:ip",(e,s)=>{const{ip:r}=e.params;f.find(e=>e.ip===r).ping(e=>{s.send(e)})}),p.get("/api/start/:mac",(e,s)=>{const{mac:r}=e.params,n=f.find(e=>e.mac===r);n?n.start(e=>{s.send(e)}):s.send({status:"error",msg:"No server found",online:!1})}),p.post("/api/shutdown/:ip",(e,s)=>{const{ip:r}=e.params;return r&&e.body.username&&e.body.password?f.find(e=>e.ip===r).shutdown(e.body.username,e.body.password,e=>s.send(e)):{status:"error",msg:"Please provide a username and password."}}),p.post("/api/restart/:ip",(e,s)=>{const{ip:r}=e.params;return r&&e.body.username&&e.body.password?f.find(e=>e.ip===r).restart(e.body.username,e.body.password,e=>s.send(e)):{status:"error",msg:"Incorrect authentication information."}}),p.listen(8e3,()=>console.log("Listening on port 8000"))},function(e,s){e.exports=require("fs")},function(e,s){e.exports=require("express")},function(e,s){e.exports=require("cookie-session")},function(e,s){e.exports=require("body-parser")},function(e,s,r){const n=r(9),t=r(10),o=r(11),i={init(e){return Object.assign(this,e),this.status="Offline",this.online=!1,this},ping(e){n.sys.probe(this.ip,s=>{const r={};return s?(r.status="Online",r.msg="Server is online and responding to pings.",r.online=!0):(r.status="Offline",r.msg="Server is currently unavailable.",r.online=!1),this.status=r.status,this.online=r.online,e&&"function"==typeof e?e(r):r})},start(e){t.wake(this.mac,s=>{const r={};return s?(r.packetSent=!1,r.msg="Unable to send magic packet"):(r.packetSent=!0,r.msg="Magic packet sent successfully."),e(r)})},shutdown(e,s,r){o.post(`http://${this.ip}:9980/shutdown`,{username:e,password:s}).then(e=>r(e.data)).catch(e=>(console.log(e),r({status:"error",msg:"Unable to shutdown server."})))},restart(e,s,r){o.post(`http://${this.ip}:9980/restart`,{username:e,password:s}).then(e=>r(e.data)).catch(e=>(console.log(e),r({status:"error",msg:"Unable to restart server."})))}};e.exports=i},function(e,s){e.exports=require("ping")},function(e,s){e.exports=require("wake_on_lan")},function(e,s){e.exports=require("axios")},function(e,s,r){const n=r(0),t=r(13),o=r(14),i=r(1),a="production"===String("production").toLowerCase()?"./hc-info.db":n.join(__dirname,"..","hc-info.db"),u="SELECT * FROM users WHERE ID=$val;",c="SELECT * FROM users WHERE USERNAME=$val;",d=new t.Database(a,t.OPEN_READONLY,e=>{e&&(console.error(i.bold.red("ERORR: No user database."),"Please run 'npm run initialize' before starting the server."),process.exit(1)),d.close()});const p={init(e,s){this.info={},function(e){const s=new t.Database(a,t.OPEN_READONLY);return new Promise((r,n)=>{s.serialize(()=>{let t;const o=e;t=isNaN(e)?c:u;const i=s.prepare(t);i.get([o],(e,s)=>{e||!s?n(Error("Unable to find user.")):r(s)}),i.finalize(),s.close()})})}(e).then(e=>{this.info.id=e.ID,this.info.name=e.NAME,this.info.username=e.USERNAME,this.info.password=e.PASSWORD,s(null,this.info)}).catch(e=>{console.error(e),s("No user found.",null)})},checkPassword(e){return new Promise((s,r)=>{o.compare(String(e),this.info.password,(e,n)=>e?(console.error(e),r(Error("An error occured checking password"))):s(n))})}};e.exports=p},function(e,s){e.exports=require("sqlite3")},function(e,s){e.exports=require("bcrypt")}]);