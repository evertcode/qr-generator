import { ShapeIconProps } from '../types/ui'

const CELL = 8
// Three modules in an L, enough to show how a dot style joins its neighbours
const L_MODULES: readonly [number, number][] = [[4, 4], [12, 4], [4, 12]]

// Rounds the top left and bottom right corners, the "classy" leaf look
const leafPath = (x: number, y: number, r: number) =>
  `M${x + r} ${y}H${x + CELL}V${y + CELL - r}A${r} ${r} 0 0 1 ${x + CELL - r} ${y + CELL}H${x}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`

function DotModule ({ x, y, shape }: { x: number; y: number; shape: ShapeIconProps['shape'] }) {
  switch (shape) {
    case 'dots':
      return <circle cx={x + CELL / 2} cy={y + CELL / 2} r={CELL / 2 - 0.5} />
    case 'rounded':
      return <rect x={x} y={y} width={CELL} height={CELL} rx={2} />
    case 'extra-rounded':
      return <rect x={x} y={y} width={CELL} height={CELL} rx={3.5} />
    case 'classy':
      return <path d={leafPath(x, y, 4)} />
    case 'classy-rounded':
      return <path d={leafPath(x, y, 4)} strokeLinejoin='round' stroke='currentColor' strokeWidth={1} />
    default:
      return <rect x={x} y={y} width={CELL} height={CELL} />
  }
}

function ShapeIcon (props: ShapeIconProps) {
  return (
    <svg viewBox='0 0 24 24' width='28' height='28' fill='currentColor' aria-hidden='true'>
      {props.target === 'dots' && L_MODULES.map(([x, y]) => (
        <DotModule key={`${x}-${y}`} x={x} y={y} shape={props.shape} />
      ))}
      {props.target === 'cornersSquare' && (props.shape === 'dot'
        ? <circle cx={12} cy={12} r={9} fill='none' stroke='currentColor' strokeWidth={3} />
        : <rect x={3} y={3} width={18} height={18} rx={props.shape === 'extra-rounded' ? 6 : 0} fill='none' stroke='currentColor' strokeWidth={3} />
      )}
      {props.target === 'cornersDot' && (props.shape === 'dot'
        ? <circle cx={12} cy={12} r={5} />
        : <rect x={7} y={7} width={10} height={10} />
      )}
    </svg>
  )
}

export default ShapeIcon
