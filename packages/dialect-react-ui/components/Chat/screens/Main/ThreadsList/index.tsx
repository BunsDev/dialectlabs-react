import { useDialectSdk, useThreads } from '@dialectlabs/react-sdk';
import type { Thread, ThreadId } from '@dialectlabs/sdk';
import clsx from 'clsx';
import { useMemo } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Centered } from '../../../../common';
import { useTheme } from '../../../../common/providers/DialectThemeProvider';
import { useRoute } from '../../../../common/providers/Router';
import MessagePreview from './MessagePreview';

interface ThreadsListProps {
  onThreadClick?: (dialectAccount: Thread) => void;
}

const isEqual = (threadIdA?: ThreadId, threadIdB?: ThreadId) => {
  if (!threadIdA || !threadIdB) {
    return false;
  }
  if (threadIdA.address.toBase58() !== threadIdB.address.toBase58()) {
    return false;
  }
  if (threadIdA?.backend !== threadIdB?.backend) {
    return false;
  }
  return true;
};

const ThreadsList = ({ onThreadClick }: ThreadsListProps) => {
  const {
    params: { threadId },
  } = useRoute<{ threadId?: ThreadId }>();
  const { threads } = useThreads();
  const {
    info: { apiAvailability },
  } = useDialectSdk();
  const hasEncryptedMessages = useMemo(
    () => threads.some((thread) => thread.encryptionEnabled),
    [threads]
  );

  const { colors, highlighted, textStyles, scrollbar } = useTheme();

  return (
    <div
      className={clsx(
        'dt-flex dt-flex-1 dt-flex-col dt-overflow-y-auto',
        scrollbar
      )}
    >
      {!apiAvailability.canEncrypt && hasEncryptedMessages && (
        <div
          className={clsx(
            colors.highlight,
            highlighted,
            textStyles.small,
            'dt-px-4 dt-py-2 dt-mx-2 dt-my-2'
          )}
        >
          ⚠ You have encrypted messages in your inbox. Connect the Sollet.io
          wallet to read them.
        </div>
      )}
      {!threads.length ? (
        <Centered>
          <span className="dt-opacity-60">No messages yet</span>
        </Centered>
      ) : null}
      <TransitionGroup component={null}>
        {/* FIXME: enter animation isn't working */}
        {threads.map((thread) => (
          <CSSTransition
            key={thread.id.address.toBase58()}
            timeout={400}
            classNames="dt-thread"
          >
            <div className="dt-overflow-hidden">
              <MessagePreview
                dialectId={thread.id}
                disabled={
                  !apiAvailability.canEncrypt && thread.encryptionEnabled
                }
                onClick={() => {
                  // Do not trigger open if this thread already opened
                  if (isEqual(threadId, thread.id)) return;
                  onThreadClick?.(thread);
                }}
                selected={isEqual(threadId, thread.id)}
              />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default ThreadsList;
