"use client";

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Copy, Save, Loader2, Search, FolderOpen } from 'lucide-react';
import Analytics from '@/lib/analytics';
import { useTranslations } from 'next-intl';

interface SummaryUpdaterButtonGroupProps {
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => Promise<void>;
  onCopy: () => Promise<void>;
  onFind?: () => void;
  onOpenFolder: () => Promise<void>;
  hasSummary: boolean;
}

export function SummaryUpdaterButtonGroup({
  isSaving,
  isDirty,
  onSave,
  onCopy,
  onFind,
  onOpenFolder,
  hasSummary
}: SummaryUpdaterButtonGroupProps) {
  const t = useTranslations('common');
  const tMeeting = useTranslations('meetingDetails');

  return (
    <ButtonGroup>
      {/* Save button */}
      <Button
        variant="outline"
        size="sm"
        className={`${isDirty ? 'bg-green-200' : ""}`}
        title={isSaving ? t('loading') : t('save')}
        onClick={() => {
          Analytics.trackButtonClick('save_changes', 'meeting_details');
          onSave();
        }}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" />
            <span className="hidden lg:inline">{t('loading')}</span>
          </>
        ) : (
          <>
            <Save />
            <span className="hidden lg:inline">{t('save')}</span>
          </>
        )}
      </Button>

      {/* Copy button */}
      <Button
        variant="outline"
        size="sm"
        title={tMeeting('copySummary')}
        onClick={() => {
          Analytics.trackButtonClick('copy_summary', 'meeting_details');
          onCopy();
        }}
        disabled={!hasSummary}
        className="cursor-pointer"
      >
        <Copy />
        <span className="hidden lg:inline">{t('copy')}</span>
      </Button>

      {/* Recording folder button */}
      <Button
        variant="outline"
        size="sm"
        className="xl:px-4"
        onClick={() => {
          Analytics.trackButtonClick('open_recording_folder', 'meeting_details');
          onOpenFolder();
        }}
        title={tMeeting('openRecordingFolder')}
      >
        <FolderOpen className="xl:mr-2" size={18} />
        <span className="hidden xl:inline">{tMeeting('openRecordingFolder')}</span>
      </Button>

      {/* Find button */}
      {/* {onFind && (
        <Button
          variant="outline"
          size="sm"
          title="Find in Summary"
          onClick={() => {
            Analytics.trackButtonClick('find_in_summary', 'meeting_details');
            onFind();
          }}
          disabled={!hasSummary}
          className="cursor-pointer"
        >
          <Search />
          <span className="hidden lg:inline">Find</span>
        </Button>
      )} */}
    </ButtonGroup>
  );
}
