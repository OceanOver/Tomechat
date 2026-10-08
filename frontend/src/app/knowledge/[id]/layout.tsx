'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { SidebarTabKey } from '@/store/global/initialState';

import KnowledgeTabs from './tabs';

interface LayoutProps extends PropsWithChildren {
  params: Record<string, string>;
}
export default memo<LayoutProps>(({ children }) => {
  const { t } = useTranslation('knowledge');
  const router = useRouter();
  const params = useParams<Record<string, string>>();
  const kbName = decodeURIComponent(params.id ?? '');
  function goBack() {
    router.push('/knowledge')
  }
  function goRootBack() {
    router.push('/knowledge')
  }
  function goToFileList() {
    router.push(`/knowledge/${params.id}/base`)
  }
  return (
    <AppLayoutDesktop sidebarKey={SidebarTabKey.Knowledge}>
      <div className="flex h-full flex-1 gap-10">
        <div className="flex w-56 shrink-0 flex-col gap-3 border-e border-border p-5">
          <div className="flex">
            <Button className="h-8 w-full justify-start px-1" onClick={goBack} variant="ghost">
              <ChevronLeft className="size-5 shrink-0" />
              <span className="truncate">{kbName}</span>
            </Button>
          </div>

          <KnowledgeTabs params={params} />
        </div>
        <div className="flex h-full min-h-0 w-full flex-col p-10">
          <div className="py-3">
            {params.id && (
              <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <button
                    className="rounded px-1 py-0.5 transition-colors hover:text-foreground"
                    onClick={goRootBack}
                  >
                    {t('breadcrumb.knowledgeBase')}
                  </button>
                </li>
                <li aria-hidden className="text-muted-foreground/60">/</li>
                <li>
                  <button
                    className="rounded px-1 py-0.5 transition-colors hover:text-foreground"
                    onClick={goToFileList}
                  >
                    {kbName}
                  </button>
                </li>
                {params.fileId && (
                  <>
                    <li aria-hidden className="text-muted-foreground/60">/</li>
                    <li className="px-1 py-0.5 text-foreground">{decodeURIComponent(params.fileId)}</li>
                  </>
                )}
              </ol>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="flex h-full items-start justify-center">{children}</div>
          </div>
        </div>
      </div>
    </AppLayoutDesktop>
  );
});
