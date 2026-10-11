
(()=>{
'use strict';

const KEY='autonova_portfolio_bookings_v1';

const TIMES=[
'08:00','08:30','09:00','09:30',
'10:00','10:30','11:00','11:30',
'12:00','12:30','13:00','13:30',
'14:00','14:30','15:00','15:30'
];

const pad=n=>String(n).padStart(2,'0');

const isoLocal=d=>
`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

const parseDay=s=>{
const [y,m,d]=s.split('-').map(Number);
return new Date(y,m-1,d);
};

const fmtDay=s=>
parseDay(s).toLocaleDateString('sr-RS',{
weekday:'long',
day:'numeric',
month:'long',
year:'numeric'
});

const read=()=>{
try{
const data=JSON.parse(localStorage.getItem(KEY)||'[]');
return Array.isArray(data)?data:[];
}catch{
return [];
}
};

const write=items=>
localStorage.setItem(KEY,JSON.stringify(items));

const active=b=>b.status!=='Otkazano';

const occupied=(date,time,items=read())=>
items.some(b=>
b.date===date&&
b.time===time&&
active(b)
);

const available=(date,time,items=read())=>{
const d=parseDay(date);
const now=new Date();
const max=new Date(
now.getFullYear(),
now.getMonth(),
now.getDate()+60
);

const slot=new Date(
d.getFullYear(),
d.getMonth(),
d.getDate(),
...time.split(':').map(Number)
);

return d.getDay()!==0&&
d<=max&&
slot>now&&
!occupied(date,time,items);
};

const generateId=()=>
`AN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

const el=id=>document.getElementById(id);

const calendar=el('booking-calendar');

if(calendar){

let shown=new Date();
shown.setDate(1);

let selectedDate='';
let selectedTime='';

const monthTitle=el('booking-month');
const times=el('booking-times');

const updateSummary=()=>{
el('booking-summary-date').textContent=
selectedDate?fmtDay(selectedDate):'Datum nije izabran';

el('booking-summary-time').textContent=
selectedTime||'—';

el('booking-selected-date').textContent=
selectedDate?fmtDay(selectedDate):'Izaberite datum';
};

const renderTimes=()=>{
times.replaceChildren();

if(!selectedDate){
const p=document.createElement('p');
p.className='booking-empty';
p.textContent='Prvo izaberite datum u kalendaru.';
times.append(p);
return;
}

let count=0;

for(const time of TIMES){
const btn=document.createElement('button');
btn.type='button';
btn.className='booking-time';
btn.textContent=time;
btn.disabled=!available(selectedDate,time);

if(!btn.disabled)count++;

if(selectedTime===time){
btn.classList.add('is-selected');
}

btn.addEventListener('click',()=>{
selectedTime=time;
renderTimes();
updateSummary();
});

times.append(btn);
}

if(!count){
const p=document.createElement('p');
p.className='booking-empty';
p.textContent='Nema slobodnih termina za izabrani datum.';
times.append(p);
}
};

const renderCalendar=()=>{
calendar.replaceChildren();

monthTitle.textContent=
shown.toLocaleDateString('sr-RS',{
month:'long',
year:'numeric'
});

const first=(shown.getDay()+6)%7;

const count=new Date(
shown.getFullYear(),
shown.getMonth()+1,
0
).getDate();

for(let i=0;i<first;i++){
calendar.append(document.createElement('span'));
}

for(let n=1;n<=count;n++){
const date=isoLocal(new Date(
shown.getFullYear(),
shown.getMonth(),
n
));

const btn=document.createElement('button');
btn.type='button';
btn.className='booking-day';
btn.textContent=n;
btn.setAttribute('aria-label',fmtDay(date));

btn.disabled=!TIMES.some(t=>available(date,t));

if(selectedDate===date){
btn.classList.add('is-selected');
}

btn.addEventListener('click',()=>{
selectedDate=date;
selectedTime='';
renderCalendar();
renderTimes();
updateSummary();
});

calendar.append(btn);
}

renderTimes();
updateSummary();
};

el('booking-prev').addEventListener('click',()=>{
const today=new Date();

if(
shown.getFullYear()===today.getFullYear()&&
shown.getMonth()===today.getMonth()
)return;

shown.setMonth(shown.getMonth()-1);
renderCalendar();
});

el('booking-next').addEventListener('click',()=>{
const limit=new Date();
limit.setDate(limit.getDate()+60);

if(
shown.getFullYear()===limit.getFullYear()&&
shown.getMonth()===limit.getMonth()
)return;

shown.setMonth(shown.getMonth()+1);
renderCalendar();
});

el('booking-form').addEventListener('submit',e=>{
e.preventDefault();

const feedback=el('booking-feedback');
feedback.textContent='';

if(!selectedDate||!selectedTime){
feedback.textContent='Izaberite datum i slobodan termin.';
return;
}

if(!available(selectedDate,selectedTime)){
feedback.textContent='Termin više nije dostupan. Izaberite drugi.';
selectedTime='';
renderCalendar();
return;
}

const name=el('booking-name').value.trim();
const phone=el('booking-phone').value.trim();
const email=el('booking-email').value.trim();
const plate=el('booking-plate').value.trim().toUpperCase();
const note=el('booking-note').value.trim();

if(
name.length<3||
phone.replace(/\D/g,'').length<8||
plate.length<3
){
feedback.textContent=
'Proverite ime, broj telefona i registarsku oznaku.';
return;
}

if(!el('booking-form').reportValidity())return;

const b={
id:generateId(),
date:selectedDate,
time:selectedTime,
service:el('booking-service').value,
name,
phone,
email,
plate,
note,
status:'Na čekanju',
createdAt:new Date().toISOString()
};

const items=read();

if(occupied(b.date,b.time,items)){
feedback.textContent=
'Termin je upravo zauzet. Izaberite drugi.';
renderCalendar();
return;
}

items.push(b);

try{
write(items);
}catch{
feedback.textContent=
'Nije moguće sačuvati rezervaciju u ovom browseru.';
return;
}

el('booking-confirmation-id').textContent=b.id;

el('booking-confirmation-details').textContent=
`${fmtDay(b.date)} u ${b.time} — ${b.service}. Status: na čekanju. Ovo je lokalna demo rezervacija.`;

el('booking-confirmation').hidden=false;

el('booking-confirmation').scrollIntoView({
behavior:'smooth',
block:'center'
});

el('booking-form').reset();

selectedTime='';
selectedDate='';

renderCalendar();
});

el('booking-new').addEventListener('click',()=>{
el('booking-confirmation').hidden=true;
el('zakazivanje').scrollIntoView({
behavior:'smooth'
});
});

window.addEventListener('storage',()=>renderCalendar());

renderCalendar();
}

const tbody=el('admin-bookings');

if(tbody){

const search=el('admin-search');
const filter=el('admin-filter');

const render=()=>{
const items=read().sort((a,b)=>
(b.date+' '+b.time).localeCompare(a.date+' '+a.time)
);

el('admin-total').textContent=items.length;

el('admin-pending').textContent=
items.filter(b=>b.status==='Na čekanju').length;

el('admin-confirmed').textContent=
items.filter(b=>b.status==='Potvrđeno').length;

el('admin-cancelled').textContent=
items.filter(b=>b.status==='Otkazano').length;

const q=search.value.trim().toLocaleLowerCase('sr');

const visible=items.filter(b=>
(filter.value==='Svi'||b.status===filter.value)&&
[b.id,b.name,b.plate,b.phone,b.service,b.date]
.some(v=>String(v||'').toLocaleLowerCase('sr').includes(q))
);

tbody.replaceChildren();

if(!visible.length){
const tr=document.createElement('tr');
const td=document.createElement('td');

td.colSpan=7;
td.className='admin-empty';
td.textContent='Nema rezervacija za prikazane kriterijume.';

tr.append(td);
tbody.append(tr);
}

for(const b of visible){
const tr=document.createElement('tr');

for(const value of [
b.id,
`${b.date} · ${b.time}`,
b.name,
`${b.plate} / ${b.phone}`,
b.service,
b.status
]){
const td=document.createElement('td');
td.textContent=value||'—';
tr.append(td);
}

const actions=document.createElement('td');
actions.className='admin-actions';

for(const [label,status] of [
['POTVRDI','Potvrđeno'],
['OTKAŽI','Otkazano']
]){
const btn=document.createElement('button');
btn.type='button';
btn.textContent=label;
btn.disabled=b.status===status;

btn.addEventListener('click',()=>{
const all=read();
const target=all.find(x=>x.id===b.id);

if(!target)return;

if(
status==='Potvrđeno'&&
all.some(x=>
x.id!==b.id&&
x.date===b.date&&
x.time===b.time&&
active(x)
)
){
alert('Termin je već zauzet.');
return;
}

target.status=status;
write(all);
render();
});

actions.append(btn);
}

tr.append(actions);
tbody.append(tr);
}
};

search.addEventListener('input',render);
filter.addEventListener('change',render);

el('admin-clear').addEventListener('click',()=>{
if(!confirm('Obrisati SVE lokalne demo rezervacije?'))return;
localStorage.removeItem(KEY);
render();
});

window.addEventListener('storage',render);

render();
}

})();
