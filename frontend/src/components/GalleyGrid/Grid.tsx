import { CSSProperties, ReactNode, memo } from 'react';

import { MAX_SIZE_DESKTOP, MIN_IMAGE_SIZE } from './style';

interface GridProps {
  children: ReactNode;
  className?: string;
  col?: number;
  gap?: number;
  max?: number;
  min?: number;
  style?: CSSProperties;
}

const Grid = memo<GridProps>((props) => {
  const {
    children,
    className,
    col = 3,
    gap = 4,
    max = MAX_SIZE_DESKTOP,
    min = MIN_IMAGE_SIZE,
    style,
  } = props;

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'grid',
        gap,
        gridTemplateColumns: `repeat(${col}, 1fr)`,
        maxWidth: max,
        minWidth: min,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
});

export default Grid;
