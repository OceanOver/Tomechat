import { ReactNode, memo, useMemo } from 'react';

import { useResponsive } from '@/hooks/useResponsive';

import ImageGrid from './Grid';
import { MAX_SIZE_DESKTOP, MAX_SIZE_MOBILE } from './style';

interface GalleyGridProps<T = any> {
  items: T[];
  renderItem: (props: T) => ReactNode;
}

// Split items into at most two rows: exactly 4 items go 2/2, otherwise
// the first row takes up to 3 and the remainder lands in the second.
function splitRows<T>(items: T[]): [T[], T[]] {
  if (items.length === 4) return [items.slice(0, 2), items.slice(2)];

  const headCount = items.length % 3 === 0 ? 3 : items.length % 3;
  return [items.slice(0, headCount), items.slice(headCount)];
}

const GalleyGrid = memo<GalleyGridProps>(({ items, renderItem }) => {
  const { isMobile } = useResponsive();

  const [topRow, bottomRow] = useMemo(() => splitRows(items), [items]);

  const spacing = isMobile ? 4 : 6;
  const widthCap = isMobile ? MAX_SIZE_MOBILE : MAX_SIZE_DESKTOP;

  return (
    <div className="flex flex-col" style={{ gap: spacing }}>
      {[topRow, bottomRow].map((row, rowIndex) =>
        row.length === 0 ? null : (
          <ImageGrid col={Math.min(row.length, 3)} gap={spacing} key={rowIndex} max={widthCap}>
            {row.map((item, itemIndex) => (
              <div key={itemIndex}>{renderItem(item)}</div>
            ))}
          </ImageGrid>
        ),
      )}
    </div>
  );
});

export default GalleyGrid;
