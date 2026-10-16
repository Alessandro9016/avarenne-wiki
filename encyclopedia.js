(() => {
  const field=document.querySelector('#directory-filter');
  if(field){
    const entries=[...document.querySelectorAll('.filter-entry')];
    const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    field.addEventListener('input',()=>{
      const terms=normalize(field.value.trim()).split(/\s+/);let visible=0;
      for(const entry of entries){entry.hidden=!terms.every(t=>normalize(entry.dataset.filter).includes(t));if(!entry.hidden)visible++;}
      document.querySelector('.directory-count').textContent=visible+' voci';
    });
  }
})();
