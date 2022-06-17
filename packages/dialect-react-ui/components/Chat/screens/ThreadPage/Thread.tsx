import { KeyboardEvent, FormEvent, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useApi } from '@dialectlabs/react';
import type { ParsedErrorData } from '@dialectlabs/react';
import { useThreadMessages } from '@dialectlabs/react-sdk';
import { ThreadMemberScope } from '@dialectlabs/sdk';
import clsx from 'clsx';
import { PublicKey } from '@solana/web3.js';
import MessageInput from './MessageInput';
import { useTheme } from '../../../common/providers/DialectThemeProvider';
import MessageBubble from '../../MessageBubble';
import useMemoThread from '../../../../hooks/useMemoThread';

type ThreadProps = {
  threadId: string;
};

export default function Thread({ threadId }: ThreadProps) {
  const { thread, isFetchingThread } = useMemoThread(threadId);
  const { messages, send, cancel } = useThreadMessages({
    address: thread?.address,
  });

  const { wallet } = useApi();
  const { scrollbar } = useTheme();

  const [text, setText] = useState<string>('');
  const [error, setError] = useState<ParsedErrorData | null | undefined>();

  if (!thread) return null;

  // TODO: replace with optimistic UI data from react-sdk
  const isMessagesReady = true;
  const cancelSendingMessage = (id: number) => {
    cancel({ id });
  };

  const isWritable = thread.me.scopes.find(
    (scope) => scope === ThreadMemberScope.WRITE
  ); // is not admin but does have write privilages

  const handleError = (err: ParsedErrorData) => {
    setError(err);
  };

  const handleSendMessage = async (messageText: string, id?: number) => {
    if (!id) id = messages.length;
    send({ text: messageText, id }).catch(handleError);
    setText('');
  };

  const onMessageSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage(text);
  };

  const onEnterPress = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey == false) {
      e.preventDefault();
      handleSendMessage(text);
    }
  };

  const disableSendButton =
    text.length <= 0 || text.length > 280 || isFetchingThread;

  const inputDisabled = isFetchingThread;

  return (
    <div className="dt-flex dt-flex-col dt-h-full dt-justify-between">
      {/* TODO: fix messages which stretch the entire messaging col */}
      <div
        className={clsx(
          'dt-flex dt-flex-auto dt-flex-col-reverse dt-overflow-y-auto dt-py-2 dt-space-y-2 dt-space-y-reverse',
          scrollbar
        )}
      >
        {isMessagesReady ? (
          <TransitionGroup component={null}>
            {messages.map((message, idx) => {
              const isYou = message.author.publicKey.equals(
                wallet?.publicKey || PublicKey.default
              );
              // Use reversed idx to avoid changing keys every time new meesage added, since we render messages in reverse order
              const reverseIdx = messages.length - idx - 1;
              const isLast = idx === 0;

              // TODO: fix transition after message is sent (e.g. key/props shouldn't change)
              return (
                <CSSTransition
                  key={reverseIdx}
                  timeout={{
                    enter: 400,
                    exit: 200,
                  }}
                  classNames={{
                    // TODO: move transition settings to theme
                    enter: 'dt-message-enter',
                    enterActive: 'dt-message-enter-active',
                    exit: 'dt-message-exit',
                    exitActive: 'dt-message-exit-active',
                  }}
                >
                  {/* additional div wrapper is needed to avoid paddings /margins interfere with animation */}
                  <div data-key={reverseIdx}>
                    <MessageBubble
                      id={reverseIdx}
                      {...message}
                      isYou={isYou}
                      showStatus={isYou && isLast}
                      onSendMessage={handleSendMessage}
                      onCancelMessage={cancelSendingMessage}
                    />
                  </div>
                </CSSTransition>
              );
            })}
          </TransitionGroup>
        ) : null}
      </div>

      {isWritable && (
        <MessageInput
          text={text}
          setText={setText}
          onSubmit={onMessageSubmit}
          onEnterPress={onEnterPress}
          disableSendButton={disableSendButton}
          inputDisabled={inputDisabled}
          error={error}
          setError={setError}
        />
      )}
    </div>
  );
}
