import { Link } from 'react-router-dom';
import {
  showMessageDialog,
  showErrorDialog,
  showQuestionDialog,
  showWarningDialog,
  openDialog,
  saveDialog,
} from '@/renderer/bridge';

function Dialog() {
  const handleDialogs = async (type: string) => {
    switch (type) {
      case 'open': {
        const openResult = await openDialog({
          properties: ['openFile', 'multiSelections'],
          filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        });
        if (!openResult.canceled) {
          await showMessageDialog({
            title: '选中文件',
            message: openResult.filePaths.join('\n'),
          });
        }
        break;
      }

      case 'save': {
        const saveResult = await saveDialog({
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        });
        if (!saveResult.canceled) {
          await showMessageDialog({
            title: '保存位置',
            message: saveResult.filePath || '',
          });
        }
        break;
      }

      case 'message': {
        const msgResult = await showQuestionDialog({
          title: '确认操作',
          message: '您确定要继续吗？',
          buttons: ['是', '否', '取消'],
          defaultId: 0,
        });

        const buttonText = ['是', '否', '取消'][msgResult.response];
        await showMessageDialog({
          title: '您的选择',
          message: `您点击了: ${buttonText}`,
        });
        break;
      }

      case 'error': {
        await showErrorDialog({
          title: '错误示例',
          message: '这是一个错误示例消息',
          buttons: ['确定'],
        });
        break;
      }

      case 'warning': {
        await showWarningDialog({
          title: '警告示例',
          message: '这是一个警告示例消息',
          buttons: ['确定'],
        });
        break;
      }
    }
  };

  return (
    <div className='container'>
      {/* 返回首页 */}
      <Link to='/'>返回首页</Link>
      <h2>对话框示例</h2>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => handleDialogs('open')}>打开文件</button>
        <button onClick={() => handleDialogs('save')}>保存文件</button>
        <button onClick={() => handleDialogs('message')}>询问对话框</button>
        <button onClick={() => handleDialogs('error')}>错误对话框</button>
        <button onClick={() => handleDialogs('warning')}>警告对话框</button>
      </div>
    </div>
  );
}

export default Dialog;
