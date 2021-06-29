// injected by valto (dev server stuff)

(() => {
  const socket = new WebSocket('ws://localhost:7500');

  socket.addEventListener('message', (msg) => {
    if (msg.data === 'reload') {
      return location.reload();
    }
    console.log(msg.data);
  });
})();
