import { Library, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Item from './TabItem';

export enum KnowledgeTabs {
  Base = 'base',
  Config = 'config',
}

export interface KnowledgeTabsProps {
  activeTab?: KnowledgeTabs;
  params: Record<string, string>;
}

const KnowledgeTabsBox = memo<KnowledgeTabsProps>(({ params }) => {
  const { t } = useTranslation('knowledge');
  const [activeTab, setActiveTab] = useState<KnowledgeTabs>(KnowledgeTabs.Base);
  const items = [
    { icon: Library, label: t('tab.base'), value: KnowledgeTabs.Base },
    { icon: Settings2, label: t('tab.config'), value: KnowledgeTabs.Config },
  ];
  const router = useRouter();
  const handleTabClick = (value: KnowledgeTabs) => {
    setActiveTab(value);
    router.push(`/knowledge/${params.id}/${value}`);
  };
  return (
    <>
      {items.map(({ value, icon, label }) => (
        <Fragment key={value}>
          <button
            className="w-full rounded-md text-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => handleTabClick(value)}
            type="button"
          >
            <Item active={activeTab === value} hoverable icon={icon} label={label} />
          </button>
        </Fragment>
      ))}
    </>
  );
});

export default KnowledgeTabsBox;
