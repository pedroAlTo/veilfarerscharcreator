(function(){
  const host=String(location.hostname||'').toLowerCase();
  const privateHost=host==='localhost'||host==='127.0.0.1'||host==='::1'||host.startsWith('10.')||host.startsWith('192.168.')||/^172\.(1[6-9]|2\d|3[01])\./.test(host);
  window.VF_LOCAL_TEST=false;
  window.VF_IS_LOCAL_TEST=false && privateHost;
})();
