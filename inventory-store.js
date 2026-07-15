(function(global){
  'use strict';
  const KEY = 'veilfarers.inventory.v1';
  const listeners = new Set();

  function empty(){ return { schema:'veilfarers.inventory/1', updatedAt:null, entries:{} }; }
  function read(){
    try{
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if(parsed && parsed.entries && typeof parsed.entries === 'object') return parsed;
    }catch(_){ }
    return empty();
  }
  function write(state){
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
    listeners.forEach(fn => fn(state));
    return state;
  }
  function add(item, amount=1){
    const state = read();
    const current = state.entries[item.id] || { id:item.id, type:item.type, name:item.name, pack:item.pack, credits:item?.cost?.credits ?? null, quantity:0 };
    current.name=item.name; current.type=item.type; current.pack=item.pack; current.credits=item?.cost?.credits ?? current.credits ?? null;
    current.quantity = Math.max(0, Number(current.quantity || 0) + Number(amount || 0));
    if(current.quantity) state.entries[item.id] = current;
    else delete state.entries[item.id];
    return write(state);
  }
  function setQuantity(id, quantity){
    const state = read();
    if(!state.entries[id]) return state;
    const next = Math.max(0, Math.floor(Number(quantity) || 0));
    if(next) state.entries[id].quantity = next;
    else delete state.entries[id];
    return write(state);
  }
  function remove(id){
    const state = read();
    delete state.entries[id];
    return write(state);
  }
  function clear(){ return write(empty()); }
  function subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); }
  function exportFile(){
    const payload = JSON.stringify(read(), null, 2);
    const blob = new Blob([payload], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `veilfarers-inventory-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  async function importFile(file){
    const parsed = JSON.parse(await file.text());
    if(!parsed || parsed.schema !== 'veilfarers.inventory/1' || !parsed.entries) throw new Error('This is not a VeilFarers inventory file.');
    return write(parsed);
  }
  global.VeilFarersInventory = Object.freeze({ KEY, read, add, setQuantity, remove, clear, subscribe, exportFile, importFile });
})(window);
