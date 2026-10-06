import { HistoryControlsProps } from '../types/ui'
import { textAction } from '../styles/textAction'

const historyAction = `${textAction} text-muted hover:text-ink disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted`

function HistoryControls ({ canUndo, canRedo, onUndo, onRedo }: HistoryControlsProps) {
  return (
    <div className='flex gap-4'>
      <button type='button' onClick={onUndo} disabled={!canUndo} aria-keyshortcuts='Control+Z Meta+Z' className={historyAction}>
        Undo
      </button>
      <button type='button' onClick={onRedo} disabled={!canRedo} aria-keyshortcuts='Control+Shift+Z Meta+Shift+Z' className={historyAction}>
        Redo
      </button>
    </div>
  )
}

export default HistoryControls
