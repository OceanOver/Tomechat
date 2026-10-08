import { ReactNode, memo, useMemo } from 'react';

import { ActionKeys, actionMap, getLeftActionList, getRightActionList } from './config';

const RenderActionList = ({ dataSource }: { dataSource: ActionKeys[] }) => (
  <>
    {dataSource.map((key) => {
      const Render = actionMap[key];
      return <Render key={key} />;
    })}
  </>
);

export interface ActionBarProps {
  leftAreaEndRender?: ReactNode;
  leftAreaStartRender?: ReactNode;
  mobile?: boolean;
  padding?: number | string;
  rightAreaEndRender?: ReactNode;
  rightAreaStartRender?: ReactNode;
}

const ActionBar = memo<ActionBarProps>(
  ({
    padding = '0 16px',
    mobile,
    rightAreaStartRender,
    rightAreaEndRender,
    leftAreaStartRender,
    leftAreaEndRender,
  }) => {
    const leftActionList = useMemo(() => getLeftActionList(mobile), [mobile]);
    const rightActionList = useMemo(() => getRightActionList(mobile), [mobile]);

    return (
      <div className="flex items-center justify-between" style={{ padding }}>
        <div className="flex items-center gap-1">
          {leftAreaStartRender}
          <RenderActionList dataSource={leftActionList} />
          {leftAreaEndRender}
        </div>
        <div className="flex items-center gap-1">
          {rightAreaStartRender}
          <RenderActionList dataSource={rightActionList} />
          {rightAreaEndRender}
        </div>
      </div>
    );
  },
);

export default ActionBar;
