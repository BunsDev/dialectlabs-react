import { DialectSdkError, SendMessageCommand, Thread } from '@dialectlabs/sdk';
import type { PublicKey } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import useSWR from 'swr';
import useDialectSdk from './useDialectSdk';

const CACHE_KEY = 'THREAD';

// TODO
type ThreadSearchParams =
  | { address: PublicKey }
  | { otherMembers: PublicKey[] };
// | { twitterHandle: string }
// | { sns: string };

type UseThreadParams = {
  findParams: ThreadSearchParams;
  refreshInterval?: number;
};

interface UseThreadValue {
  // sdk
  thread: Omit<Thread, 'messages' | 'send' | 'delete'> | null;

  send(command: SendMessageCommand): Promise<void>;
  delete(): Promise<void>;

  // react-lib
  isFetchingThread: boolean;
  errorFetchingThread: DialectSdkError | null;
  isSendingMessage: boolean;
  errorSendingMessage: DialectSdkError | null;
  isDeletingThread: boolean;
  errorDeletingThread: DialectSdkError | null;
}

const useThread = ({
  findParams,
  refreshInterval,
}: UseThreadParams): UseThreadValue => {
  const { threads: threadsApi } = useDialectSdk();

  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [errorSendingMessage, setErrorSendingMessage] =
    useState<DialectSdkError | null>(null);
  const [isDeletingThread, setIsDeletingThread] = useState<boolean>(false);
  const [errorDeletingThread, setErrorDeletingThread] =
    useState<DialectSdkError | null>(null);

  const {
    data: thread = null,
    isValidating: isFetchingThread,
    error: errorFetchingThread,
  } = useSWR(
    [CACHE_KEY, findParams],
    (_, findParams) => threadsApi.find(findParams),
    {
      refreshInterval,
    }
  );

  const deleteThread = useCallback(async () => {
    if (!thread) return;
    setIsDeletingThread(true);
    setErrorDeletingThread(null);
    try {
      return await thread.delete();
    } catch (e) {
      if (e instanceof DialectSdkError) {
        setErrorDeletingThread(e);
      }
      throw e;
    } finally {
      setIsDeletingThread(false);
    }
  }, [thread]);

  const sendMessage = useCallback(
    async (cmd: SendMessageCommand) => {
      if (!thread) return;
      setIsSendingMessage(true);
      setErrorSendingMessage(null);
      try {
        return await thread.send(cmd);
      } catch (e) {
        if (e instanceof DialectSdkError) {
          setErrorSendingMessage(e);
        }
        throw e;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [thread]
  );

  return {
    // sdk
    thread,
    send: sendMessage,
    delete: deleteThread,

    // react-lib
    isFetchingThread,
    errorFetchingThread,
    isSendingMessage,
    errorSendingMessage,
    isDeletingThread,
    errorDeletingThread,
  };
};

export default useThread;
