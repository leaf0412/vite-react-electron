import {
  createWindow,
  getWindowInfo,
  minimizeWindow,
  toggleMaximizeWindow,
  closeWindow,
} from '@/renderer/bridge';

function Window() {
  const handleNewWindow = async () => {
    await createWindow({
      route: '/#/file-manager',
      width: 600,
      height: 400,
      show: true,
      isMultiWindow: true,
    });
  };

  const handleWindowControls = async (action: string) => {
    const winInfo = await getWindowInfo();
    switch (action) {
      case 'minimize':
        await minimizeWindow(winInfo.id);
        break;
      case 'maximize':
        await toggleMaximizeWindow(winInfo.id);
        break;
      case 'close':
        await closeWindow(winInfo.id);
        break;
    }
  };

  return (
    <div className='container'>
      {/* 返回首页 */}
      <a href='/'>返回首页</a>
      <h2>窗口控制</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => handleWindowControls('minimize')}>最小化</button>
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
