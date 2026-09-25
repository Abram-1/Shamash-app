/* SHAMASH — Construction Management Orchestrator v0.1
   Safe first module: does not alter the existing safety application.
   Data is local to the browser for this prototype.
*/
const {useState,useEffect}=React;

const KEY="shamash-management-v01";
const initial={
  project:null,
  progress:0,
  tasks:[],
  risks:[],
  decisions:[],
  memory:[],
  work:[],
  materials:[],
  events:[]
};

function loadDB(){
  try{return JSON.parse(localStorage.getItem(KEY))||initial}catch(e){return initial}
}
function saveDB(db){localStorage.setItem(KEY,JSON.stringify(db))}
function esc(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}

function App(){
 const [db,setDB]=useState(loadDB);
 const [page,setPage]=useState("dashboard");
 const [memoryTitle,setMemoryTitle]=useState("");
 const [memoryType,setMemoryType]=useState("Решение");
 const [memoryText,setMemoryText]=useState("");

 useEffect(()=>saveDB(db),[db]);

 const update=(fn)=>setDB(prev=>{const next=fn(JSON.parse(JSON.stringify(prev)));return next});
 const addMemory=()=>{
   if(!memoryTitle.trim()||!memoryText.trim()){alert("Заполните название и содержание.");return}
   update(d=>{d.memory.push({id:Date.now(),title:memoryTitle,type:memoryType,text:memoryText,date:new Date().toISOString()});d.events.push({title:"Запись добавлена в память",text:memoryTitle});return d});
   setMemoryTitle("");setMemoryText("");
 };
 const newProject=()=>{
   const name=prompt("Название строительного объекта:");
   if(!name)return;
   const location=prompt("Адрес / город:")||"";
   update(d=>{d.project={name,location};d.events.push({title:"Создан объект",text:name+(location?" · "+location:"")});return d});
 };
 const nav=[
  ["dashboard","Обзор"],
  ["memory","Память проекта"],
  ["planning","Календарное планирование"],
  ["work","Работы"],
  ["materials","Материалы"],
  ["money","Деньги"],
  ["quality","Качество"],
  ["safety","Безопасность"]
 ];
 return React.createElement("div",{style:S.app},
  React.createElement("aside",{style:S.side},
   React.createElement("div",{style:S.logo},"SHAMASH"),
   React.createElement("div",{style:S.sub},"Строительный оркестратор"),
   React.createElement("div",{style:S.nav},nav.map(([id,label])=>React.createElement("button",{key:id,onClick:()=>setPage(id),style:{...S.navBtn,...(page===id?S.navActive:{})}},label)))
  ),
  React.createElement("main",{style:S.main},
   React.createElement("header",{style:S.header},
    React.createElement("div",null,
      React.createElement("h1",{style:S.h1},nav.find(x=>x[0]===page)?.[1]||"SHAMASH"),
      React.createElement("div",{style:S.project},db.project?db.project.name+" · "+(db.project.location||""):"Объект не выбран")
    ),
    React.createElement("button",{style:S.primary,onClick:newProject},"+ Новый объект")
   ),
   page==="dashboard"&&React.createElement(Dashboard,{db,setPage}),
   page==="memory"&&React.createElement(Memory,{db,title:memoryTitle,setTitle:setMemoryTitle,type:memoryType,setType:setMemoryType,text:memoryText,setText:setMemoryText,add:addMemory}),
   page==="planning"&&React.createElement(Planning,{db}),
   page==="work"&&React.createElement(Work,{db}),
   page==="materials"&&React.createElement(Materials,{db}),
   page==="money"&&React.createElement(Money,{db}),
   page==="quality"&&React.createElement(Quality,{db}),
   page==="safety"&&React.createElement(Safety,{})
  )
 );
}

function Card({title,children}){return React.createElement("section",{style:S.card},React.createElement("h2",{style:S.h2},title),children)}
function Dashboard({db,setPage}){
 const active=db.tasks.filter(x=>x.status!=="done").length;
 const decisions=db.decisions.filter(x=>!x.controlled).length;
 return React.createElement(React.Fragment,null,
  React.createElement("div",{style:S.metrics},
   metric("Прогресс",(db.progress||0)+"%"),
   metric("Активные задачи",active),
   metric("Открытые риски",db.risks.length),
   metric("Решения без контроля",decisions)
  ),
  React.createElement("div",{style:S.two},
   React.createElement(Card,{title:"Центр внимания"},
    React.createElement("div",{style:S.list},
     ...db.risks.map(r=>item("⚠ Риск",r.title,"risk")),
     ...db.decisions.filter(d=>!d.controlled).map(d=>item("Решение",d.title)),
     ...db.tasks.filter(t=>t.status!=="done").slice(0,5).map(t=>item("Задача",t.title)),
     (!db.risks.length&&!decisions&&!active)&&React.createElement("div",{style:S.empty},"Пока нет элементов контроля.")
    )
   ),
   React.createElement(Card,{title:"Последние события"},
    React.createElement("div",{style:S.list},db.events.slice(-8).reverse().map(e=>item(e.title,e.text)),!db.events.length&&React.createElement("div",{style:S.empty},"События появятся здесь."))
   )
  )
 )
}
function metric(label,value){return React.createElement("div",{style:S.metric},React.createElement("div",{style:S.muted},label),React.createElement("div",{style:S.number},value))}
function item(label,title,kind){return React.createElement("div",{style:S.item},React.createElement("span",{style:{...S.tag,...(kind==="risk"?S.badTag:{})}},label),React.createElement("b",null,title))}
function Memory(p){
 return React.createElement("div",{style:S.two},
  React.createElement(Card,{title:"Добавить запись"},
   React.createElement("input",{style:S.input,placeholder:"Название / факт",value:p.title,onChange:e=>p.setTitle(e.target.value)}),
   React.createElement("select",{style:S.input,value:p.type,onChange:e=>p.setType(e.target.value)},["Решение","Договорённость","Выполненная работа","Наблюдение","Документ"].map(x=>React.createElement("option",{key:x},x))),
   React.createElement("textarea",{style:{...S.input,minHeight:150},placeholder:"Что произошло, кто отвечает, источник, важные детали...",value:p.text,onChange:e=>p.setText(e.target.value)}),
   React.createElement("button",{style:S.primary,onClick:p.add},"Сохранить в память проекта")
  ),
  React.createElement(Card,{title:"Память проекта"},
   React.createElement("div",{style:S.list},p.db.memory.slice().reverse().map(m=>React.createElement("div",{key:m.id,style:S.item},React.createElement("span",{style:S.tag},m.type),React.createElement("h3",{style:{margin:"8px 0 4px"}},m.title),React.createElement("div",{style:S.muted},m.text))))
  )
 )
}
function Planning(){return React.createElement(Card,{title:"Календарное планирование"},React.createElement("table",{style:S.table},React.createElement("thead",null,React.createElement("tr",null,...["Этап / работа","План","Факт","Отклонение","Ответственный"].map(h=>React.createElement("th",{key:h},h)))),React.createElement("tbody",null,React.createElement("tr",null,React.createElement("td",null,"Структура проекта"),React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"SHAMASH")),React.createElement("tr",null,React.createElement("td",null,"Основные строительные работы"),React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"—")))))}
function Work(){return React.createElement(Card,{title:"Работы"},React.createElement("div",{style:S.empty},"Работы будут связаны с календарём, объёмом, ресурсами, исполнителем, фото и контролем результата."))}
function Materials(){return React.createElement(Card,{title:"Материалы"},React.createElement("table",{style:S.table},React.createElement("thead",null,React.createElement("tr",null,...["Материал","Заказано","Получено","Израсходовано","Остаток"].map(h=>React.createElement("th",{key:h},h)))),React.createElement("tbody",null,React.createElement("tr",null,React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"—"),React.createElement("td",null,"—")))))}
function Money(){return React.createElement(React.Fragment,null,React.createElement("div",{style:S.metrics},metric("Бюджет","₪0"),metric("Обязательства","₪0"),metric("Оплачено","₪0"),metric("Отклонение","₪0")),React.createElement(Card,{title:"Финансовое ядро"},React.createElement("div",{style:S.empty},"Следующий слой: смета → обязательство → счёт → оплата → прогноз.")))}
function Quality(){return React.createElement(Card,{title:"Контроль качества"},React.createElement("div",{style:S.flow},"Наблюдение → анализ → предупреждение → решение человека → контроль результата"))}
function Safety(){return React.createElement(Card,{title:"Безопасность"},React.createElement("div",{style:S.empty},"Модуль безопасности остаётся отдельным действующим приложением. Здесь будет связь оркестратора с ним."))}
const S={
 app:{display:"flex",minHeight:"100vh",background:"#f3f5f7",color:"#1f2937",fontFamily:"Segoe UI,Arial,sans-serif"},
 side:{width:245,background:"#111827",color:"#fff",padding:20,boxSizing:"border-box"},
 logo:{fontSize:27,fontWeight:900,letterSpacing:1},sub:{fontSize:12,color:"#cbd5e1",marginTop:3},
 nav:{display:"grid",gap:7,marginTop:30},navBtn:{border:0;background:"transparent",color:"#d1d5db",textAlign:"left",padding:"11px 12px",borderRadius:10,cursor:"pointer",fontSize:14},navActive:{background:"#374151",color:"#fff"},
 main:{flex:1,padding:"25px 28px",maxWidth:1400},header:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:15,marginBottom:20},h1:{margin:"0 0 5px",fontSize:28},project:{color:"#6b7280",fontSize:13},primary:{border:0,borderRadius:10,padding:"11px 15px",background:"#f59e0b",fontWeight:800,cursor:"pointer"},
 metrics:{display:"grid",gridTemplateColumns:"repeat(4,minmax(150px,1fr))",gap:13,marginBottom:16},metric:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:15},number:{fontSize:29,fontWeight:900,marginTop:5},muted:{fontSize:13,color:"#6b7280"},
 two:{display:"grid",gridTemplateColumns:"1.25fr 1fr",gap:15},card:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:17,marginBottom:15},h2:{fontSize:18,margin:"0 0 14px"},list:{display:"grid",gap:9},item:{border:"1px solid #e5e7eb",borderRadius:10,padding:11},tag:{display:"inline-block",padding:"3px 7px",borderRadius:99,background:"#fef3c7",color:"#92400e",fontSize:11,fontWeight:800},badTag:{background:"#fee2e2",color:"#991b1b"},empty:{padding:28,textAlign:"center",color:"#6b7280",border:"1px dashed #cbd5e1",borderRadius:10},input:{width:"100%",boxSizing:"border-box",padding:10,border:"1px solid #d1d5db",borderRadius:9,marginBottom:10,font: "inherit"},table:{width:"100%",borderCollapse:"collapse",fontSize:13},flow:{padding:18,fontWeight:800,background:"#f8fafc",borderRadius:10}
};
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
