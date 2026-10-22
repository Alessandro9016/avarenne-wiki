(() => {
  'use strict';
  const form = document.querySelector('#full-search-form'); if (!form) return;
  const input = document.querySelector('#full-search-query'), category = document.querySelector('#full-search-kind');
  const list = document.querySelector('#full-search-results'), count = document.querySelector('#full-search-count'), more = document.querySelector('#full-search-more');
  const items = window.WIKI_SEARCH || []; let matches = [], shown = 0;
  for (const kind of [...new Set(items.map(i => i.kind))].sort((a,b) => a.localeCompare(b,'it'))) { const o=document.createElement('option');o.value=kind;o.textContent=kind;category.append(o); }
  const params = new URLSearchParams(location.search); input.value = params.get('q') || '';category.value = params.get('categoria') || '';
  function append() {
    for (const item of matches.slice(shown, shown + 30)) {
      const li=document.createElement('li'), a=document.createElement('a'), kind=document.createElement('small'), excerpt=document.createElement('p');
      a.href=item.url;a.textContent=item.title;kind.textContent=' — '+item.kind;
      excerpt.textContent=(item.keywords || '').slice(0,240)+'…';li.append(a,kind,excerpt);list.append(li);
    }
    shown = Math.min(shown + 30, matches.length);more.hidden = shown >= matches.length;
    count.textContent = input.value.trim() ? matches.length+' risultati · '+shown+' mostrati' : 'Inserisci una parola, un nome o un’abilità.';
  }
  function run(update) {
    matches=window.AVARENNE_SEARCH.rank(items,input.value,category.value);shown=0;list.replaceChildren();append();
    if(update) { const p=new URLSearchParams();if(input.value.trim())p.set('q',input.value.trim());if(category.value)p.set('categoria',category.value);history.replaceState(null,'','ricerca.html'+(p.size?'?'+p.toString():'')); }
  }
  form.addEventListener('submit',e=>{e.preventDefault();run(true);});category.addEventListener('change',()=>run(true));more.addEventListener('click',append);run(false);
})();
