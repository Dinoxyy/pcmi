"use strict";

const ACCOUNTS=[
 {id:"u_2001",login:"ivanov",password:"1234",name:"А.И. Иванов",role:"junior"},
 {id:"u_2002",login:"petrova",password:"1234",name:"М.С. Петрова",role:"senior"},
 {id:"u_2003",login:"sidorov",password:"admin",name:"Д.В. Сидоров",role:"teamlead"}
];
const ROLES={junior:"Junior Developer",senior:"Senior Developer",teamlead:"Team Lead / Admin"};
const MENU={
 junior:[["overview","Обзор"],["onboarding","Онбординг"],["kb","База знаний"],["journal","Журнал"],["profile","Профиль"]],
 senior:[["overview","Обзор"],["myarticles","Мои статьи"],["questions","Вопросы"],["kb","База знаний"],["journal","Журнал"],["profile","Профиль"]],
 teamlead:[["overview","Обзор"],["moderation","Модерация"],["analytics","Аналитика"],["team","Команда"],["journal","Журнал"],["profile","Профиль"]]
};
const SCREENS={
 junior:["overview","onboarding","kb","article","journal","profile"],
 senior:["overview","myarticles","editor","questions","kb","article","journal","profile"],
 teamlead:["overview","moderation","analytics","team","kb","article","journal","profile"]
};
const PARENT={article:"kb",editor:"myarticles"};
const SCREEN_LOG={
 overview:()=>["open_overview","screen","overview"],
 onboarding:()=>["open_onboarding","screen","onboarding"],
 kb:()=>["open_kb","screen","kb"],
 article:()=>["open_article","article",S.articleId||"unknown"],
 myarticles:()=>["open_my_articles","screen","myarticles"],
 editor:()=>S.editorMode==="edit"?["open_editor","article",S.editArticleId]:["create_article","article","new"],
 questions:()=>["open_questions","screen","questions"],
 moderation:()=>["open_moderation","screen","moderation"],
 analytics:()=>["open_analytics","screen","analytics"],
 team:()=>["open_team","screen","team"],
 journal:()=>["open_journal","screen","journal"],
 profile:()=>["open_profile","screen","profile"]
};
const SCENARIOS=[
 {id:1,name:"Прохождение шага онбординга с песочницей",steps:["open_onboarding","open_article",{action:"run_sandbox",outcome:"success"},"complete_step"]},
 {id:2,name:"Обработка ошибки в песочнице",steps:[{action:"run_sandbox",outcome:"failure"},{action:"run_sandbox",outcome:"success"},"complete_step"]},
 {id:3,name:"Создание статьи с привязкой к репозиторию",steps:["create_article","link_repo","add_task","save_draft","send_moderation"]},
 {id:4,name:"Ответ на вопрос и актуализация статьи",steps:["open_question","answer_question","update_article"]},
 {id:5,name:"Модерация статьи и назначение наставника",steps:["open_moderation","publish_article","open_analytics","assign_mentor"]}
];
const REPO_FILES=["docker-compose.yml",".env.example","services.yaml",".gitlab-ci.yml","README.md","Dockerfile"];
const KEY="devdocs_prototype_lr5";
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=p=>p+"_"+Math.random().toString(36).slice(2,7);
const stamp=()=>new Date().toISOString();
const FRESH={green:["g","Актуально"],yellow:["a","Обновляется"],red:["r","Устарело"]};

function seedData(){return{
 articles:[
  {id:"art_001",icon:"🐳",title:"Настройка локального окружения (Docker)",desc:"Пошаговая инструкция с интерактивной песочницей",tags:["docker","setup"],freshness:"green",rating:4.9,author:"М.С. Петрова",status:"published",repo:["docker-compose.yml",".env.example"],content:"## Установка Docker\nУстановите Docker Desktop и убедитесь, что демон запущен. Склонируйте репозиторий и поднимите сервисы командой docker-compose up -d. Проверьте корректность установки командой docker --version.",snippet:"docker-compose up -d",task:{command:"docker --version",hint:"Используйте флаг --version для проверки установки Docker"},updated:"2026-11-01"},
  {id:"art_002",icon:"🏗️",title:"Архитектура микросервисов",desc:"Обзор взаимодействия сервисов проекта",tags:["architecture","backend"],freshness:"green",rating:4.8,author:"М.С. Петрова",status:"published",repo:["services.yaml"],content:"## Обзор\nСистема состоит из API-шлюза, сервиса аутентификации и сервиса данных. Взаимодействие построено на асинхронных сообщениях через брокер. Каждый сервис имеет собственную схему БД.",snippet:"kubectl get services",task:null,updated:"2026-10-20"},
  {id:"art_003",icon:"🔀",title:"Git-воркфлоу команды",desc:"Ветвление, коммиты и Pull Request",tags:["git","workflow"],freshness:"yellow",rating:4.7,author:"М.С. Петрова",status:"published",repo:[".gitlab-ci.yml"],content:"## Ветвление\nОсновная ветка — main. Feature-ветки именуются по шаблону feature/TASK-123-описание. Перед слиянием обязателен code review и зелёный CI.",snippet:"git checkout -b feature/TASK-123-auth",task:null,updated:"2026-11-08"},
  {id:"art_004",icon:"🔍",title:"Code Review: стандарты",desc:"Как проходить ревью в нашей команде",tags:["review","standards"],freshness:"red",rating:4.6,author:"Д.В. Сидоров",status:"published",repo:[],content:"## Стандарты ревью\nКаждый PR проверяется минимум одним senior-разработчиком. Обращайте внимание на читаемость, покрытие тестами и отсутствие дублирования. Комментарии должны быть конструктивными.",snippet:"",task:null,updated:"2026-09-15"},
  {id:"art_005",icon:"🐳",title:"Настройка локального окружения",desc:"Черновик статьи для новых сотрудников",tags:["docker","setup"],freshness:"green",rating:0,author:"М.С. Петрова",status:"moderation",repo:["docker-compose.yml",".env.example"],content:"## Быстрый старт\nПошаговая инструкция по развёртыванию окружения нового разработчика с интерактивной проверкой команд в песочнице.",snippet:"docker-compose up -d",task:{command:"docker --version",hint:"Используйте флаг --version"},updated:"2026-11-10"}
 ],
 checklist:[
  {id:"step_1",title:"Знакомство с командой и процессами",done:true},
  {id:"step_2",title:"Доступы к репозиториям и сервисам",done:true},
  {id:"step_3",title:"Настройка IDE и линтеров",done:true},
  {id:"step_4",title:"Первый коммит и Pull Request",done:true},
  {id:"step_5",title:"Настройка локального окружения (Docker)",done:false,articleId:"art_001",current:true},
  {id:"step_6",title:"Архитектура микросервисов",done:false,articleId:"art_002"},
  {id:"step_7",title:"Git-воркфлоу команды",done:false,articleId:"art_003"},
  {id:"step_8",title:"Code Review: стандарты",done:false,articleId:"art_004"},
  {id:"step_9",title:"Работа с CI/CD",done:false},
  {id:"step_10",title:"Первая задача в спринте",done:false}
 ],
 questions:[
  {id:"q_001",articleId:"art_003",author:"А.И. Иванов",text:"Как правильно именовать feature-ветки для задач без номера в трекере?",status:"open",answer:null},
  {id:"q_002",articleId:"art_001",author:"А.И. Иванов",text:"Что делать, если docker-compose падает с ошибкой занятого порта?",status:"open",answer:null}
 ],
 team:[
  {id:"u_2001",name:"А.И. Иванов",role:"junior",progress:40,mentor:null},
  {id:"u_2002",name:"М.С. Петрова",role:"senior",progress:100,mentor:null},
  {id:"u_2003",name:"Д.В. Сидоров",role:"teamlead",progress:100,mentor:null}
 ]
};}

function load(){try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}}
let S=load()||{session:null,sessionId:null,screen:null,articleId:null,editArticleId:null,editorMode:"create",questionId:null,kbFilters:{},data:seedData(),log:[]};
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function me(){return ACCOUNTS.find(a=>a.id===S.session)||null;}
function actorName(id){const a=ACCOUNTS.find(x=>x.id===id);return a?a.name:id;}
function artById(id){return S.data.articles.find(a=>a.id===id);}
function progress(){const d=S.data.checklist.filter(s=>s.done).length;return Math.round(d/S.data.checklist.length*100);}

(function buildGrid(){
 const inner=$("#gridInner");
 for(let i=1;i<=12;i++){const c=document.createElement("div");c.className="grid-col";c.innerHTML=`<span>${i}</span>`;inner.appendChild(c);}
 let on=true;
 $("#gridToggle").addEventListener("click",()=>{on=!on;$("#gridOverlay").classList.toggle("off",!on);$("#gridToggle").textContent=on?"Скрыть сетку":"Показать сетку";});
})();

function logEvent(action,objectType,objectId,outcome,changes){
 const u=me();
 S.log.push({timestamp:stamp(),actor_id:u?u.id:"guest",actor_role:u?u.role:"guest",action,object_type:objectType,object_id:objectId,outcome:outcome||"success",changes:changes||{},context:{correlation_id:S.sessionId||"auth",user_agent:navigator.userAgent.slice(0,48)}});
 save();
}
function toast(text,kind){
 const el=document.createElement("div");el.className="toast "+(kind||"");
 el.innerHTML=`<span>${kind==="g"?"✓":kind==="r"?"✕":kind==="a"?"!":"•"}</span><span>${esc(text)}</span>`;
 $("#toasts").appendChild(el);
 setTimeout(()=>{el.style.transition="opacity .3s";el.style.opacity="0";setTimeout(()=>el.remove(),320);},3400);
}
function openModal(html){const m=$("#modal");m.innerHTML=`<div class="modal-box">${html}</div>`;m.hidden=false;}
function closeModal(){const m=$("#modal");m.hidden=true;m.innerHTML="";}
function freshBadge(f){const v=FRESH[f]||FRESH.green;return `<span class="fresh"><span class="dot ${v[0]}"></span>${v[1]}</span>`;}
function statusTag(s){const m={published:["g","Опубликована"],moderation:["a","На модерации"],draft:["b","Черновик"],rejected:["r","Отклонена"],open:["a","Открыт"],answered:["g","Отвечен"]};const v=m[s]||["",s];return `<span class="tag ${v[0]}">${v[1]}</span>`;}
function artCard(a){return `<div class="card art">
 <div class="ico">${a.icon||"📄"}</div>
 <h4>${esc(a.title)}</h4>
 <div class="desc">${esc(a.desc||"")}</div>
 <div class="foot"><span class="rating">⭐ ${a.rating||"—"}</span>${freshBadge(a.freshness)}</div>
 <div class="tags">${a.tags.map(t=>`<span class="tag v">#${esc(t)}</span>`).join("")}</div>
 <div class="row" style="margin-top:8px"><button class="btn btn-s btn-p" data-act="open-article" data-id="${a.id}">Открыть</button></div>
</div>`;}

function go(screen){
 const u=me();if(!u)return;
 if(!SCREENS[u.role].includes(screen))screen=MENU[u.role][0][0];
 S.screen=screen;
 document.querySelectorAll("main > section").forEach(s=>{s.hidden=true;});
 const sec=$("#s-"+screen);if(sec)sec.hidden=false;
 const active=PARENT[screen]||screen;
 $("#nav").innerHTML=MENU[u.role].map(([id,name])=>`<button data-act="go" data-id="${id}" class="${id===active?"on":""}">${name}</button>`).join("");
 const lg=SCREEN_LOG[screen];if(lg){const[a,t,id]=lg();logEvent(a,t,id);}
 const r={overview:renderOverview,onboarding:renderOnboarding,kb:renderKB,article:renderArticle,myarticles:renderMyArticles,editor:renderEditor,questions:renderQuestions,moderation:renderModeration,analytics:renderAnalytics,team:renderTeam,journal:renderJournal,profile:renderProfile}[screen];
 if(r)r();
 save();window.scrollTo({top:0,behavior:"smooth"});
}

function renderOverview(){
 const u=me();
 const published=S.data.articles.filter(a=>a.status==="published");
 const freshPct=published.length?Math.round(published.filter(a=>a.freshness==="green").length/published.length*100):0;
 let feature="",stats="";
 if(u.role==="junior"){
  const cur=S.data.checklist.find(s=>s.current&&!s.done)||S.data.checklist.find(s=>!s.done);
  feature=`<div class="card feature m6"><h3>🔥 Текущий шаг онбординга</h3><div class="big">${esc(cur?cur.title:"Все шаги выполнены")}</div><p class="muted">Интерактивная инструкция с песочницей. Запускайте команды и получайте автоматическую проверку результата.</p><div class="meta"><span>👤 М. Петрова</span><span>⏱️ 10 мин</span>${freshBadge("green")}</div><div class="row mt"><button class="btn btn-p" data-act="go" data-id="onboarding">Перейти к онбордингу</button>${cur&&cur.articleId?`<button class="btn btn-o" data-act="open-article" data-id="${cur.articleId}">Открыть статью</button>`:""}</div></div>`;
  stats=`<div class="card stat m3"><div class="ico">📊</div><span>Прогресс онбординга</span><b>${progress()}%</b><div class="bar"><i style="width:${progress()}%"></i></div><span style="margin-top:8px">${S.data.checklist.filter(s=>s.done).length} из ${S.data.checklist.length} шагов выполнено</span></div>
  <div class="card stat m3"><div class="ico">📚</div><span>Всего статей</span><b>${published.length}</b><span style="margin-top:8px">${freshPct}% актуальны</span></div>`;
 }else if(u.role==="senior"){
  const openQ=S.data.questions.filter(q=>q.status==="open"&&artById(q.articleId)&&artById(q.articleId).author===u.name).length;
  const mine=S.data.articles.filter(a=>a.author===u.name).length;
  feature=`<div class="card feature m6"><h3>💬 Вопросы к вашим статьям</h3><div class="big">${openQ} вопрос(ов) ожидают ответа</div><p class="muted">Отвечайте на вопросы читателей и актуализируйте документацию при изменении кода в репозитории.</p><div class="row mt"><button class="btn btn-p" data-act="go" data-id="questions">Перейти к вопросам</button><button class="btn btn-o" data-act="art-new">Создать статью</button></div></div>`;
  stats=`<div class="card stat m3"><div class="ico">📝</div><span>Моих статей</span><b>${mine}</b><span style="margin-top:8px">включая черновики</span></div>
  <div class="card stat m3"><div class="ico">📚</div><span>Всего статей</span><b>${published.length}</b><span style="margin-top:8px">${freshPct}% актуальны</span></div>`;
 }else{
  const mod=S.data.articles.filter(a=>a.status==="moderation").length;
  const avg=Math.round(S.data.team.reduce((s,t)=>s+t.progress,0)/S.data.team.length);
  feature=`<div class="card feature m6"><h3>🛡️ Статьи на модерации</h3><div class="big">${mod} статья(й) ожидают проверки</div><p class="muted">Проверяйте соответствие стандартам компании и публикуйте материалы. Контролируйте прогресс адаптации команды.</p><div class="row mt"><button class="btn btn-p" data-act="go" data-id="moderation">Перейти к модерации</button><button class="btn btn-o" data-act="go" data-id="analytics">Аналитика</button></div></div>`;
  stats=`<div class="card stat m3"><div class="ico">📈</div><span>Средний прогресс</span><b>${avg}%</b><div class="bar"><i style="width:${avg}%"></i></div><span style="margin-top:8px">по команде</span></div>
  <div class="card stat m3"><div class="ico">📚</div><span>Всего статей</span><b>${published.length}</b><span style="margin-top:8px">${freshPct}% актуальны</span></div>`;
 }
 const cards=published.slice(0,3).map(a=>`<div class="m4">${artCard(a)}</div>`).join("");
 $("#overview-body").innerHTML=feature+stats+cards;
}

function renderOnboarding(){
 $("#onb-progress").textContent=`Выполнено ${S.data.checklist.filter(s=>s.done).length} из ${S.data.checklist.length} · ${progress()}%`;
 $("#onboarding-list").innerHTML=S.data.checklist.map((s,i)=>`
 <div class="step ${s.done?"done":""} ${s.current&&!s.done?"current":""}">
  <div class="step-n">${s.done?"✓":i+1}</div>
  <div class="step-b"><b>${esc(s.title)}</b><p>${s.done?"Шаг выполнен":s.current?"Текущий шаг":"Ожидает выполнения"}</p></div>
  <div class="row">${s.articleId?`<button class="btn btn-s btn-o" data-act="open-article" data-id="${s.articleId}">Статья</button>`:""}${!s.done?`<button class="btn btn-s btn-g" data-act="complete-step" data-id="${s.id}">Отметить</button>`:""}</div>
 </div>`).join("");
}

function renderKB(){
 $("#kb-q").value=S.kbFilters.q||"";$("#kb-fresh").value=S.kbFilters.fresh||"";$("#kb-sort").value=S.kbFilters.sort||"rating";
 let list=S.data.articles.filter(a=>a.status==="published");
 if(S.kbFilters.q){const q=S.kbFilters.q.toLowerCase();list=list.filter(a=>(a.title+a.tags.join(" ")).toLowerCase().includes(q));}
 if(S.kbFilters.fresh)list=list.filter(a=>a.freshness===S.kbFilters.fresh);
 const s=S.kbFilters.sort||"rating";
 list.sort((a,b)=>s==="title"?a.title.localeCompare(b.title):s==="updated"?b.updated.localeCompare(a.updated):b.rating-a.rating);
 $("#kb-count").textContent="Найдено: "+list.length;
 $("#kb-list").innerHTML=list.map(artCard).join("")||`<div class="card empty" style="grid-column:1/-1">Статьи не найдены.<br><button class="btn btn-o" data-act="kb-reset">Сбросить фильтры</button></div>`;
}

function renderArticle(){
 const a=artById(S.articleId);if(!a){go("kb");return;}
 const u=me();
 $("#article-title").textContent=a.title;
 $("#article-meta").innerHTML=`${esc(a.author)} · обновлено ${a.updated} · ${freshBadge(a.freshness)}`;
 const qs=S.data.questions.filter(q=>q.articleId===a.id);
 const canEdit=u.role==="senior"&&a.author===u.name;
 $("#article-body").innerHTML=`
 <div class="grid g2">
  <div class="card">
   <div class="row" style="justify-content:space-between"><div class="tags">${a.tags.map(t=>`<span class="tag v">#${esc(t)}</span>`).join("")}</div><span class="rating">⭐ ${a.rating||"—"}</span></div>
   <div class="doc mt">${a.content.split("\n").map(l=>l.startsWith("## ")?`<h4>${esc(l.slice(3))}</h4>`:`<p>${esc(l)}</p>`).join("")}</div>
   ${a.snippet?`<div class="snippet"><span class="c"># сниппет</span>\n${esc(a.snippet)}</div>`:""}
   ${a.repo.length?`<div class="muted mt">🔗 Привязано к файлам: ${a.repo.map(r=>`<code>${esc(r)}</code>`).join(", ")}</div>`:""}
   <div class="row mt"><button class="btn btn-s btn-o" data-act="rate" data-id="${a.id}">👍 Полезно</button><button class="btn btn-s btn-o" data-act="ask" data-id="${a.id}">Задать вопрос</button>${canEdit?`<button class="btn btn-s btn-c" data-act="art-edit" data-id="${a.id}">Редактировать</button>`:""}</div>
  </div>
  <div class="card">
   ${a.task?`<h3>🧪 Интерактивное задание</h3><p class="muted">Выполните команду в песочнице — система проверит результат автоматически.</p>
   <div class="sandbox"><div class="sandbox-h"><span class="dots"><i style="background:var(--red)"></i><i style="background:var(--amber)"></i><i style="background:var(--green)"></i></span> sandbox · bash</div>
   <div class="sandbox-b"><textarea id="sandbox-cmd" placeholder="Введите команду, например: docker --version"></textarea>
   <div class="row mt"><button class="btn btn-g" data-act="run-sandbox" data-id="${a.id}">▶ Запустить</button><span class="muted mono">Ctrl+Enter</span></div>
   <div id="sandbox-out" class="sandbox-out"></div><div id="sandbox-hint" class="sandbox-hint"></div></div></div>`:`<h3>🧪 Интерактивное задание</h3><p class="muted">Для этой статьи интерактивное задание не предусмотрено.</p>`}
   <h3 style="margin-top:19px">💬 Вопросы и комментарии</h3>
   <div>${qs.length?qs.map(q=>`<div class="comment"><b>${esc(q.author)}</b><p>${esc(q.text)}</p>${q.answer?`<div class="ans"><b>Ответ автора:</b> ${esc(q.answer)}</div>`:`<p class="muted" style="margin-top:7px">Ожидает ответа автора</p>`}</div>`).join(""):`<p class="muted">Вопросов пока нет.</p>`}</div>
  </div>
 </div>`;
}

function renderMyArticles(){
 const list=S.data.articles.filter(a=>a.author===me().name);
 $("#myarticles-list").innerHTML=list.map(a=>`
 <div class="card art"><div class="row" style="justify-content:space-between"><div class="ico">${a.icon||"📄"}</div>${statusTag(a.status)}</div>
 <h4>${esc(a.title)}</h4><div class="desc">обновлено ${a.updated} · ⭐ ${a.rating||"—"}</div>
 <div class="tags">${a.tags.map(t=>`<span class="tag v">#${esc(t)}</span>`).join("")}</div>
 <div class="row" style="margin-top:auto"><button class="btn btn-s btn-o" data-act="open-article" data-id="${a.id}">Открыть</button><button class="btn btn-s btn-c" data-act="art-edit" data-id="${a.id}">Изменить</button><button class="btn btn-s btn-r" data-act="art-delete" data-id="${a.id}">Удалить</button></div></div>`).join("")||`<div class="card empty" style="grid-column:1/-1">Статей пока нет.<br><button class="btn btn-p" data-act="art-new">Создать первую статью</button></div>`;
}

function renderEditor(){
 const f=$("#f-article");const a=S.editorMode==="edit"?artById(S.editArticleId):null;
 $("#editor-title").textContent=a?"Редактирование статьи":"Новая статья";
 f.id.value=a?a.id:"";f.title.value=a?a.title:"";f.content.value=a?a.content:"";f.tags.value=a?a.tags.join(", "):"";f.snippet.value=a?a.snippet:"";f.taskcmd.value=a&&a.task?a.task.command:"";f.taskhint.value=a&&a.task?a.task.hint:"";
 $("#task-block").hidden=!(a&&a.task);
 $("#repo-checks").innerHTML=REPO_FILES.map(r=>`<label class="check"><input type="checkbox" name="repo" value="${r}" ${a&&a.repo.includes(r)?"checked":""}> <code>${r}</code></label>`).join("");
}

function renderQuestions(){
 const u=me();const list=S.data.questions.filter(q=>{const a=artById(q.articleId);return a&&a.author===u.name;});
 $("#q-count").textContent="Открытых: "+list.filter(q=>q.status==="open").length;
 $("#questions-list").innerHTML=list.map(q=>{const a=artById(q.articleId);return `<div class="card">
 <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(a.title)}</h3>${statusTag(q.status)}</div>
 <p class="muted">${freshBadge(a.freshness)} · вопрос от ${esc(q.author)}</p>
 <div class="comment mt"><b>${esc(q.author)}</b><p>${esc(q.text)}</p>${q.answer?`<div class="ans"><b>Ваш ответ:</b> ${esc(q.answer)}</div>`:""}</div>
 <div class="row mt"><button class="btn btn-s btn-o" data-act="open-question" data-id="${q.id}">Открыть вопрос</button>${q.status==="open"?`<button class="btn btn-s btn-g" data-act="answer" data-id="${q.id}">Ответить</button>`:""}<button class="btn btn-s btn-c" data-act="update-article" data-id="${a.id}">Актуализировать статью</button></div></div>`;}).join("")||`<div class="card empty">Вопросов к вашим статьям пока нет.</div>`;
}

function renderModeration(){
 const list=S.data.articles.filter(a=>a.status==="moderation");
 $("#mod-count").textContent="На модерации: "+list.length;
 $("#moderation-list").innerHTML=list.map(a=>`<div class="card">
 <div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(a.title)}</h3>${statusTag(a.status)}</div>
 <p class="muted">Автор: ${esc(a.author)} · отправлено ${a.updated}</p>
 <div class="doc mt">${a.content.split("\n").slice(0,3).map(l=>l.startsWith("## ")?`<h4>${esc(l.slice(3))}</h4>`:`<p>${esc(l)}</p>`).join("")}</div>
 <div class="kv mt"><span>Примеры кода</span><b style="color:${a.snippet?"var(--green)":"var(--red)"}">${a.snippet?"Есть":"Нет"}</b><span>Корректность тегов</span><b style="color:${a.tags.length?"var(--green)":"var(--red)"}">${a.tags.length?"Есть":"Нет"}</b><span>Привязка к репозиторию</span><b style="color:${a.repo.length?"var(--green)":"var(--red)"}">${a.repo.length?a.repo.join(", "):"Нет"}</b><span>Интерактивное задание</span><b style="color:${a.task?"var(--green)":"var(--muted)"}">${a.task?"Есть":"Нет"}</b></div>
 <div class="row"><button class="btn btn-s btn-o" data-act="open-article" data-id="${a.id}">Просмотреть</button><button class="btn btn-s btn-g" data-act="publish" data-id="${a.id}">Опубликовать</button><button class="btn btn-s btn-r" data-act="reject-art" data-id="${a.id}">Отклонить</button></div></div>`).join("")||`<div class="card empty">Статей на модерации нет.<br><button class="btn btn-o" data-act="go" data-id="analytics">Перейти к аналитике</button></div>`;
}

function renderAnalytics(){
 const published=S.data.articles.filter(a=>a.status==="published");
 const avg=Math.round(S.data.team.reduce((s,t)=>s+t.progress,0)/S.data.team.length);
 const freshPct=published.length?Math.round(published.filter(a=>a.freshness==="green").length/published.length*100):0;
 $("#analytics-stats").innerHTML=`
 <div class="card stat"><div class="ico">📈</div><span>Средний прогресс</span><b>${avg}%</b><div class="bar"><i style="width:${avg}%"></i></div></div>
 <div class="card stat"><div class="ico">📚</div><span>Опубликовано статей</span><b>${published.length}</b><span style="margin-top:8px">${freshPct}% актуальны</span></div>
 <div class="card stat"><div class="ico">👥</div><span>Сотрудников</span><b>${S.data.team.length}</b><span style="margin-top:8px">${S.data.team.filter(t=>t.mentor).length} с наставником</span></div>`;
 $("#analytics-team").innerHTML=S.data.team.map(t=>`
 <div class="step"><div class="step-n">${t.name.split(" ").pop()[0]}</div>
 <div class="step-b"><b>${esc(t.name)}</b><p>${ROLES[t.role]} · ${t.mentor?"наставник: "+esc(t.mentor):"наставник не назначен"}</p><div class="bar"><i style="width:${t.progress}%"></i></div></div>
 <div class="row"><span class="tag b">${t.progress}%</span>${t.role==="junior"&&!t.mentor?`<button class="btn btn-s btn-p" data-act="assign-mentor" data-id="${t.id}">Назначить наставника</button>`:""}</div></div>`).join("");
}

function renderTeam(){
 $("#team-body").innerHTML=S.data.team.map(t=>`<tr>
 <td>${esc(t.name)}</td><td>${ROLES[t.role]}</td>
 <td><div class="bar" style="min-width:110px"><i style="width:${t.progress}%"></i></div><span class="muted">${t.progress}%</span></td>
 <td>${t.mentor?esc(t.mentor):'<span class="muted">—</span>'}</td>
 <td>${t.role==="junior"?`<button class="btn btn-s btn-p" data-act="assign-mentor" data-id="${t.id}">${t.mentor?"Сменить наставника":"Назначить наставника"}</button>`:'<span class="muted">—</span>'}</td></tr>`).join("");
}

function matchScenarios(events){
 const rows=[];
 SCENARIOS.forEach(sc=>{let i=0,first=null,last=null;
  const match=(e,step)=>typeof step==="string"?e.action===step:(e.action===step.action&&e.outcome===step.outcome);
  events.forEach(e=>{if(match(e,sc.steps[i])){if(i===0)first=e;last=e;i++;if(i===sc.steps.length){rows.push({scenario:sc,actor:first.actor_id,steps:i,ms:new Date(last.timestamp)-new Date(first.timestamp)});i=0;first=null;last=null;}}});
 });
 return rows;
}
function analyze(){
 const sessions={};
 S.log.forEach(e=>{const sid=e.context.correlation_id;if(!sessions[sid])sessions[sid]={id:sid,events:[]};sessions[sid].events.push(e);});
 const rows=[];Object.values(sessions).forEach(s=>matchScenarios(s.events).forEach(r=>rows.push({...r,session:s.id})));
 return{sessions:Object.values(sessions),rows};
}

function renderJournal(){
 const bar=document.querySelector("#s-journal .head .row");
 if(bar&&!bar.querySelector('[data-act="reset-demo"]')){const b=document.createElement("button");b.className="btn btn-s btn-o";b.dataset.act="reset-demo";b.textContent="Сбросить демо-данные";bar.appendChild(b);}
 const a=analyze();const total=a.rows.reduce((s,r)=>s+r.ms,0);
 $("#journal-stats").innerHTML=`
 <div class="card stat"><div class="ico">🧾</div><b>${S.log.length}</b><span>Записей в журнале</span></div>
 <div class="card stat"><div class="ico">🖥️</div><b>${a.sessions.length}</b><span>Сеансов работы</span></div>
 <div class="card stat"><div class="ico">✅</div><b>${a.rows.length}</b><span>Завершённых сценариев</span></div>`;
 $("#scenario-body").innerHTML=a.rows.map(r=>`<tr><td><b>Сценарий ${r.scenario.id}.</b> ${esc(r.scenario.name)}</td><td class="mono">${esc(r.session)}</td><td>${esc(actorName(r.actor))}</td><td>${r.steps}</td><td><b style="color:var(--cyan)">${(r.ms/1000).toFixed(2)} с</b></td></tr>`).join("")||`<tr><td colspan="5" class="empty">Завершённых сценариев пока нет — выполните последовательность действий в рабочем пространстве.</td></tr>`;
 $("#journal-body").innerHTML=S.log.slice(-140).reverse().map(e=>`<tr><td class="mono">${e.timestamp.slice(11,23)}</td><td>${esc(actorName(e.actor_id))}</td><td>${esc(ROLES[e.actor_role]||e.actor_role)}</td><td class="mono" style="color:var(--blue)">${esc(e.action)}</td><td class="mono">${esc(e.object_type)}:${esc(e.object_id)}</td><td>${e.outcome==="success"?'<span class="tag g">Успешно</span>':'<span class="tag r">Ошибка</span>'}</td></tr>`).join("")||`<tr><td colspan="6" class="empty">Журнал пуст</td></tr>`;
 if(total)$("#journal-stats").innerHTML+=`<div class="card stat" style="grid-column:1/-1"><b>${(total/1000).toFixed(2)} с</b><span>Суммарное время выполнения распознанных сценариев</span></div>`;
}

function renderProfile(){
 const u=me();const mine=S.log.filter(e=>e.actor_id===u.id);const t=S.data.team.find(x=>x.id===u.id);
 const extra=u.role==="junior"?`<p class="muted" style="margin-top:13px">Прогресс онбординга: <b style="color:var(--cyan)">${progress()}%</b></p><div class="bar" style="margin-top:8px"><i style="width:${progress()}%"></i></div><p class="muted" style="margin-top:10px">Наставник: ${t&&t.mentor?esc(t.mentor):"не назначен"}</p>`
 :u.role==="senior"?`<p class="muted" style="margin-top:13px">Авторских статей: <b>${S.data.articles.filter(a=>a.author===u.name).length}</b> · вопросов к ответу: <b>${S.data.questions.filter(q=>q.status==="open"&&artById(q.articleId)&&artById(q.articleId).author===u.name).length}</b></p>`
 :`<p class="muted" style="margin-top:13px">Статей на модерации: <b>${S.data.articles.filter(a=>a.status==="moderation").length}</b> · сотрудников: <b>${S.data.team.length}</b></p>`;
 $("#profile-body").innerHTML=`<div class="grid g2">
 <div class="card"><h3>${esc(u.name)}</h3><p class="muted">Роль: ${ROLES[u.role]}</p><p class="muted">Учётная запись: <span class="mono">${u.login}</span> · <span class="mono">${u.id}</span></p>${extra}<div class="row mt"><button class="btn btn-o" data-act="logout">Выйти из системы</button></div></div>
 <div class="card"><h3>История действий</h3>${mine.slice(-9).reverse().map(e=>`<p class="muted" style="padding:8px 0;border-bottom:1px dashed var(--line)"><span class="mono">${e.timestamp.slice(11,19)}</span> · ${esc(e.action)}</p>`).join("")||'<p class="muted">Действий пока нет</p>'}</div></div>`;
}

function csvCell(v){return '"'+String(typeof v==="string"?v:JSON.stringify(v??{})).replace(/"/g,'""')+'"';}
function toCSV(){return "timestamp,actor_id,actor_role,action,object_type,object_id,outcome,changes,context\n"+S.log.map(e=>[e.timestamp,e.actor_id,e.actor_role,e.action,e.object_type,e.object_id,e.outcome,csvCell(e.changes),csvCell(e.context)].join(",")).join("\n");}
function toJSONL(){return S.log.map(e=>JSON.stringify({timestamp:e.timestamp,actor:{id:e.actor_id,role:e.actor_role},action:e.action,object:{type:e.object_type,id:e.object_id},outcome:e.outcome,changes:e.changes,context:e.context})).join("\n");}
function toTXT(){return S.log.map(e=>`${e.timestamp} actor=${e.actor_id} role=${e.actor_role} action=${e.action} object=${e.object_type}:${e.object_id} outcome=${e.outcome} corr=${e.context.correlation_id}`+(Object.keys(e.changes).length?" change="+JSON.stringify(e.changes):"")).join("\n");}
function download(name,text){const b=new Blob([text],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);}

function render(){
 const u=me();
 if(!u){$("#s-login").hidden=false;$("#shell").hidden=true;return;}
 $("#s-login").hidden=true;$("#shell").hidden=false;
 $("#who-name").textContent=u.name;$("#who-role").textContent=ROLES[u.role];
 go(S.screen||MENU[u.role][0][0]);
}

$("#f-login").addEventListener("submit",e=>{
 e.preventDefault();const fd=new FormData(e.target);
 const acc=ACCOUNTS.find(a=>a.login===String(fd.get("login")).trim()&&a.password===String(fd.get("password")));
 if(!acc){$("#login-err").hidden=false;$("#login-err").textContent="Неверный логин или пароль";logEvent("login","account",String(fd.get("login")),"failure",{reason:"invalid_credentials"});return;}
 $("#login-err").hidden=true;e.target.reset();
 S.session=acc.id;S.sessionId=uid("sess");S.screen=MENU[acc.role][0][0];S.articleId=null;S.editArticleId=null;S.editorMode="create";S.kbFilters={};
 logEvent("login","account",acc.id,"success",{role:acc.role});render();toast("Вы вошли как "+acc.name,"g");
});

$("#f-article").addEventListener("submit",e=>{
 e.preventDefault();const fd=new FormData(e.target);const id=String(fd.get("id")||"");const toModeration=e.submitter&&e.submitter.name==="moderation";
 const title=String(fd.get("title")).trim();const content=String(fd.get("content")).trim();
 if(!title||!content){toast("Заполните заголовок и содержимое","r");return;}
 const repo=fd.getAll("repo");const taskcmd=String(fd.get("taskcmd")||"").trim();
 const vals={title,content,desc:content.replace(/##\s*/g,"").split("\n")[0].slice(0,70),tags:String(fd.get("tags")||"").split(",").map(t=>t.trim()).filter(Boolean),snippet:String(fd.get("snippet")||"").trim(),repo,task:taskcmd?{command:taskcmd,hint:String(fd.get("taskhint")||"").trim()}:null,updated:new Date().toISOString().slice(0,10)};
 if(id){const a=artById(id);Object.assign(a,vals);a.freshness="green";logEvent("update_article","article",id,"success",{title});if(toModeration){a.status="moderation";logEvent("send_moderation","article",id);}toast(toModeration?"Статья обновлена и отправлена на модерацию":"Статья обновлена, индикатор свежести — зелёный","g");}
 else{const a={id:uid("art"),icon:"📄",...vals,rating:0,author:me().name,status:toModeration?"moderation":"draft",freshness:"green"};S.data.articles.push(a);logEvent("save_draft","article",a.id,"success",{title});if(toModeration)logEvent("send_moderation","article",a.id);toast(toModeration?"Черновик сохранён и отправлен на модерацию":"Черновик сохранён","g");}
 S.editorMode="create";S.editArticleId=null;save();go("myarticles");
});

document.addEventListener("click",e=>{
 if(e.target.id==="modal"){closeModal();return;}
 const el=e.target.closest("[data-act]");if(!el)return;
 const act=el.dataset.act,id=el.dataset.id;
 if(act==="go"){go(id);return;}
 if(act==="logout"){logEvent("logout","account",S.session);S.session=null;S.sessionId=null;S.screen=null;save();closeModal();render();return;}
 if(act==="modal-close"){closeModal();return;}
 if(act==="open-article"){S.articleId=id;save();go("article");return;}
 if(act==="kb-find"){S.kbFilters={q:$("#kb-q").value,fresh:$("#kb-fresh").value,sort:$("#kb-sort").value};logEvent("search_kb","search","kb","success",S.kbFilters);save();renderKB();toast("Поиск выполнен","g");return;}
 if(act==="kb-reset"){S.kbFilters={};logEvent("reset_search","search","kb");save();renderKB();return;}
 if(act==="complete-step"){const s=S.data.checklist.find(x=>x.id===id);s.done=true;s.current=false;const next=S.data.checklist.find(x=>!x.done);if(next)next.current=true;const t=S.data.team.find(x=>x.id===me().id);if(t)t.progress=progress();logEvent("complete_step","step",id,"success",{progress:progress()});save();renderOnboarding();toast(`Шаг выполнен. Прогресс онбординга: ${progress()}%`,"g");return;}
 if(act==="run-sandbox"){const a=artById(id);const cmd=($("#sandbox-cmd").value||"").trim();const out=$("#sandbox-out"),hint=$("#sandbox-hint");
  if(a.task&&cmd===a.task.command){out.className="sandbox-out ok";out.textContent=`$ ${cmd}\nDocker version 24.0.6, build ed223bc\n✓ Команда выполнена успешно. Результат соответствует ожидаемому.`;hint.style.display="none";logEvent("run_sandbox","sandbox",id,"success",{command:cmd});toast("Задание выполнено успешно","g");}
  else{out.className="sandbox-out err";out.textContent=`$ ${cmd}\n✗ Результат не соответствует ожидаемому. Проверьте команду и попробуйте снова.`;hint.style.display="block";hint.textContent="💡 Подсказка: "+(a.task?a.task.hint:"Проверьте синтаксис команды");logEvent("run_sandbox","sandbox",id,"failure",{command:cmd});toast("Ошибка выполнения. Прочитайте подсказку","r");}
  save();return;}
 if(act==="rate"){const a=artById(id);a.rating=Math.min(5,+(a.rating+0.1).toFixed(1));logEvent("rate_article","article",id,"success",{rating:a.rating});save();renderArticle();toast("Спасибо за оценку!","g");return;}
 if(act==="ask"){openModal(`<h3>Задать вопрос к статье</h3><p class="lead">${esc(artById(id).title)}</p><div class="field"><label>Ваш вопрос</label><textarea id="ask-text" placeholder="Опишите, что осталось непонятным..."></textarea></div><div class="row"><button class="btn btn-p" data-act="ask-send" data-id="${id}">Отправить вопрос</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);return;}
 if(act==="ask-send"){const text=($("#ask-text").value||"").trim();if(!text){toast("Введите текст вопроса","r");return;}const q={id:uid("q"),articleId:id,author:me().name,text,status:"open",answer:null};S.data.questions.push(q);logEvent("ask_question","question",q.id,"success",{article_id:id});save();closeModal();renderArticle();toast("Вопрос отправлен автору статьи","g");return;}
 if(act==="art-new"){S.editorMode="create";S.editArticleId=null;save();go("editor");return;}
 if(act==="art-edit"){S.editorMode="edit";S.editArticleId=id;save();go("editor");return;}
 if(act==="update-article"){S.editorMode="edit";S.editArticleId=id;logEvent("open_editor","article",id);save();go("editor");return;}
 if(act==="add-task"){$("#task-block").hidden=false;logEvent("add_task","article",S.editArticleId||"new");save();toast("Блок интерактивного задания добавлен","g");return;}
 if(act==="art-delete"){const a=artById(id);openModal(`<h3>Удаление статьи</h3><p class="lead">Статья «${esc(a.title)}» будет удалена. Действие нельзя отменить.</p><div class="row"><button class="btn btn-r" data-act="art-delete-confirm" data-id="${id}">Удалить</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);return;}
 if(act==="art-delete-confirm"){S.data.articles=S.data.articles.filter(a=>a.id!==id);logEvent("delete_article","article",id);save();closeModal();renderMyArticles();toast("Статья удалена","a");return;}
 if(act==="open-question"){S.questionId=id;logEvent("open_question","question",id);save();const q=S.data.questions.find(x=>x.id===id);S.articleId=q.articleId;go("article");return;}
 if(act==="answer"){const q=S.data.questions.find(x=>x.id===id);openModal(`<h3>Ответ на вопрос</h3><p class="lead">${esc(q.author)}: ${esc(q.text)}</p><div class="field"><label>Ваш ответ</label><textarea id="ans-text" placeholder="Введите ответ..."></textarea></div><div class="row"><button class="btn btn-g" data-act="answer-send" data-id="${id}">Отправить ответ</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);return;}
 if(act==="answer-send"){const q=S.data.questions.find(x=>x.id===id);const text=($("#ans-text").value||"").trim();if(!text){toast("Введите текст ответа","r");return;}q.answer=text;q.status="answered";logEvent("answer_question","question",id,"success",{article_id:q.articleId});save();closeModal();renderQuestions();toast("Ответ отправлен. Не забудьте актуализировать статью","g");return;}
 if(act==="publish"){const a=artById(id);logEvent("check_standards","article",id,"success",{snippet:!!a.snippet,tags:a.tags.length,repo:a.repo.length});a.status="published";logEvent("publish_article","article",id);save();renderModeration();toast("Статья опубликована","g");return;}
 if(act==="reject-art"){const a=artById(id);a.status="rejected";logEvent("reject_article","article",id);save();renderModeration();toast("Статья отклонена и возвращена автору","a");return;}
 if(act==="assign-mentor"){const t=S.data.team.find(x=>x.id===id);const seniors=S.data.team.filter(x=>x.role==="senior"||x.role==="teamlead");openModal(`<h3>Назначение наставника</h3><p class="lead">Сотрудник: ${esc(t.name)} · прогресс ${t.progress}%</p><div class="field"><label>Наставник</label><select id="mentor-sel">${seniors.map(s=>`<option value="${esc(s.name)}">${esc(s.name)} · ${ROLES[s.role]}</option>`).join("")}</select></div><div class="row"><button class="btn btn-p" data-act="assign-mentor-confirm" data-id="${id}">Назначить</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);return;}
 if(act==="assign-mentor-confirm"){const t=S.data.team.find(x=>x.id===id);t.mentor=$("#mentor-sel").value;logEvent("assign_mentor","team",id,"success",{mentor:t.mentor});save();closeModal();if(S.screen==="analytics")renderAnalytics();else renderTeam();toast(`Наставник назначен: ${t.mentor}`,"g");return;}
 if(act==="report"){logEvent("generate_report","report",uid("rep"));save();toast("Отчёт по онбордингу сформирован","g");return;}
 if(act==="export"){const content=id==="csv"?toCSV():id==="jsonl"?toJSONL():toTXT();download("devdocs_log."+(id==="jsonl"?"jsonl":id==="csv"?"csv":"txt"),content);logEvent("export_log","log",id,"success",{format:id,records:S.log.length});renderJournal();toast("Журнал выгружен: "+id.toUpperCase(),"g");return;}
 if(act==="journal-clear"){S.log=[];save();renderJournal();toast("Журнал очищен","a");return;}
 if(act==="reset-demo"){openModal(`<h3>Сброс демо-данных</h3><p class="lead">Все статьи, чеклист, вопросы и журнал вернутся к исходному состоянию. Учётная запись останется активной.</p><div class="row"><button class="btn btn-r" data-act="reset-demo-confirm">Сбросить</button><button class="btn btn-o" data-act="modal-close">Отмена</button></div>`);return;}
 if(act==="reset-demo-confirm"){S.data=seedData();S.log=[];S.articleId=null;S.editArticleId=null;S.editorMode="create";S.kbFilters={};save();closeModal();go(S.screen);toast("Демо-данные сброшены","g");return;}
});

document.addEventListener("change",e=>{
 if(e.target.name==="repo"&&e.target.closest("#f-article"))logEvent("link_repo","article",S.editArticleId||"new","success",{file:e.target.value,checked:e.target.checked});
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape")closeModal();
 if((e.ctrlKey||e.metaKey)&&e.key==="Enter"&&$("#sandbox-cmd")&&document.activeElement===$("#sandbox-cmd")){const btn=document.querySelector('[data-act="run-sandbox"]');if(btn)btn.click();}
});
render();