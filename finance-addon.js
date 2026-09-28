/* RepairFlow Finance Add-on: additive module. Existing app.js remains unchanged. */
(()=>{
  const defaults={cash:0,debts:[],receivables:[],settings:{dark:false,compact:false,confirmDelete:true,warnParts:true}};
  data.finance={...defaults,...(data.finance||{}),settings:{...defaults.settings,...(data.finance?.settings||{})}};
  const id=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
  const persist=()=>save();
  const total=a=>(a||[]).filter(x=>!x.settled).reduce((s,x)=>s+(+x.amount||0),0);
  const allItems=()=>data.repairs.flatMap(r=>items(r).map(x=>({repair:r,...x})));
  const unpaidPartCost=()=>allItems().filter(x=>x.paid===false).reduce((s,x)=>s+(+x.qty||0)*(+x.unitCost||0),0);
  const pendingRepairs=()=>data.repairs.filter(r=>!r.paid).reduce((s,r)=>s+(+r.price||0),0);
  function ensurePaidFlags(){data.repairs.forEach(r=>{if(Array.isArray(r.items))r.items.forEach(x=>{if(typeof x.paid!=='boolean')x.paid=true})})}
  ensurePaidFlags();
  function financeStats(){const debts=total(data.finance.debts),extra=total(data.finance.receivables),cash=+data.finance.cash||0,receivable=extra+pendingRepairs(),partsDue=unpaidPartCost();return{cash,debts,receivable,partsDue,virtual:cash+receivable-debts-partsDue}}
  function row(x,type){return `<div class="financeListItem"><div><b>${safe(x.name)}</b><small>${safe(x.concept)}${x.date?' · '+safe(x.date):''}${x.notes?' · '+safe(x.notes):''}</small></div><span class="amount">${money(x.amount)}</span><div><button onclick="RF_SETTLE('${type}','${x.id}')">${x.settled?'Reabrir':'Saldar'}</button><button onclick="RF_DELETE('${type}','${x.id}')">×</button></div></div>`}
  function renderFinance(){const s=financeStats();$('#finCash').textContent=money(s.cash);$('#finReceivable').textContent=money(s.receivable);$('#finDebt').textContent=money(s.debts+s.partsDue);$('#finVirtual').textContent=money(s.virtual);$('#cashInput').value=data.finance.cash||0;$('#debtList').innerHTML=data.finance.debts.length?data.finance.debts.map(x=>row(x,'debts')).join(''):'<div class="emptyFinance">No hay deudas registradas.</div>';$('#receivableList').innerHTML=data.finance.receivables.length?data.finance.receivables.map(x=>row(x,'receivables')).join(''):'<div class="emptyFinance">No hay importes registrados.</div>';let up=allItems().filter(x=>x.paid===false);$('#unpaidParts').innerHTML=up.length?up.map(x=>`<div class="financeListItem"><div><b>${safe(x.description)}</b><small>${safe(x.repair.device)} · ${safe(x.repair.client)}</small></div><span class="amount">${money((+x.qty||0)*(+x.unitCost||0))}</span><span></span></div>`).join(''):'<div class="emptyFinance">Todas las piezas están pagadas.</div>';applySettings()}
  function applySettings(){let s=data.finance.settings;document.body.classList.toggle('dark',!!s.dark);document.body.classList.toggle('compact',!!s.compact);$('#darkToggle').checked=!!s.dark;$('#compactToggle').checked=!!s.compact;$('#confirmToggle').checked=!!s.confirmDelete;$('#warnPartsToggle').checked=!!s.warnParts}
  const originalAddPart=window.addPart||addPart;
  addPart=function(x={description:'',qty:1,unitCost:0,unitPrice:0,paid:true}){originalAddPart(x);let part=$('#parts .part:last-child');if(!part||part.querySelector('.partPaid'))return;let label=document.createElement('label');label.className='partPaidWrap';label.title='Marca si ya has pagado esta pieza';label.innerHTML=`<input class="partPaid" type="checkbox" ${x.paid===false?'':'checked'}>`;let remove=part.querySelector('.remove');part.insertBefore(label,remove);label.querySelector('input').onchange=()=>{part.classList.toggle('unpaidPart',!label.querySelector('input').checked);calc()};part.classList.toggle('unpaidPart',x.paid===false)};
  const originalGetParts=window.getParts||getParts;
  getParts=function(){let list=originalGetParts();let rows=$$('#parts .part');return list.map((x,i)=>({...x,paid:rows[i]?.querySelector('.partPaid')?.checked!==false}))};
  const originalRender=render;
  render=function(){originalRender();renderFinance()};
  const oldNav=$$('aside button');oldNav.forEach(b=>{b.onclick=()=>{$$('.view').forEach(v=>v.classList.remove('active'));$('#'+b.dataset.v).classList.add('active');$('#title').textContent={home:'Resumen',repairs:'Reparaciones',finance:'Finanzas',settings:'Configuración'}[b.dataset.v]||b.dataset.v;renderFinance()}});
  window.RF_SETTLE=(type,key)=>{let x=data.finance[type].find(v=>v.id===key);if(x){x.settled=!x.settled;persist();renderFinance()}};
  window.RF_DELETE=(type,key)=>{if(data.finance.settings.confirmDelete&&!confirm('¿Eliminar este registro?'))return;data.finance[type]=data.finance[type].filter(v=>v.id!==key);persist();renderFinance()};
  function setupForm(modalId,formId,type){let modal=$(modalId),form=$(formId);form.onsubmit=e=>{e.preventDefault();let x=Object.fromEntries(new FormData(form));data.finance[type].push({...x,id:id(),amount:+x.amount||0,settled:false});persist();form.reset();modal.close();renderFinance()};modal.querySelectorAll('.closeFinance').forEach(x=>x.onclick=()=>modal.close())}
  setupForm('#debtModal','#debtForm','debts');setupForm('#receivableModal','#receivableForm','receivables');
  $('#addDebt').onclick=()=>$('#debtModal').showModal();$('#addReceivable').onclick=()=>$('#receivableModal').showModal();$('#saveCash').onclick=()=>{data.finance.cash=+$('#cashInput').value||0;persist();renderFinance()};
  [['#darkToggle','dark'],['#compactToggle','compact'],['#confirmToggle','confirmDelete'],['#warnPartsToggle','warnParts']].forEach(([sel,key])=>$(sel).onchange=e=>{data.finance.settings[key]=e.target.checked;persist();applySettings()});
  $('#exportFinance').onclick=()=>{let s=financeStats(),blob=new Blob([JSON.stringify({fecha:new Date().toISOString(),resumen:s,finanzas:data.finance},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='repairflow-finanzas.json';a.click();URL.revokeObjectURL(a.href)};
  // Re-render after cloud imports data so additive defaults are retained.
  if(typeof pullCloud==='function'){const cloudPull=pullCloud;pullCloud=async function(){await cloudPull();data.finance={...defaults,...(data.finance||{}),settings:{...defaults.settings,...(data.finance?.settings||{})}};ensurePaidFlags();renderFinance()}}
  renderFinance();
})();