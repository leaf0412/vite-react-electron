function Window() {
  const handleNewWindow = async () => {
    await window.ipcRenderer.newWindow({
      route: '/',
      width: 600,
      height: 400,
      show: true,
      isMultiWindow: true,
    });
  };

  const handleWindowControls = async (action: string) => {
    const winId = await window.ipcRenderer.getWindowId();
    switch (action) {
      case 'minimize':
        await window.ipcRenderer.minimizeWindow(winId);
        break;
      case 'maximize':
        await window.ipcRenderer.toggleMaximize(winId);
        break;
      case 'close':
        await window.ipcRenderer.closeWindow(winId);
        break;
    }
  };

  return (
    <div className="container">
      {/* 返回首页 */}
      <a href="/">返回首页</a>
      <h2>窗口控制</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => handleWindowControls('minimize')}>
          最小化
        </button>
        <button onClick={() => handleWindowControls('maximize')}>
          最大化/还原
        </button>
        <button onClick={() => handleWindowControls('close')}>关闭</button>
        <button onClick={handleNewWindow}>创建新窗口</button>
      </div>
    </div>
  );
}

export default Window;
