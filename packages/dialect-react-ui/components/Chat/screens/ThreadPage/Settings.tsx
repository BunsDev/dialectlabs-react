import { display } from '@dialectlabs/web3';
import { useApi } from '@dialectlabs/react';
import clsx from 'clsx';
import { getExplorerAddress } from '../../../../utils/getExplorerAddress';
import { A, P } from '../../../common/preflighted';
import { useTheme } from '../../../common/providers/DialectThemeProvider';
import { Button, ValueRow } from '../../../common';
import useThread from '../../../../hooks/useThread';
import { useRoute } from '../../../common/providers/Router';
import { MainRouteName, RouteName } from '../../constants';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface SettingsProps {
  threadId: string;
}

const Settings = ({ threadId }: SettingsProps) => {
  const { network } = useApi();
  const {
    thread,
    delete: deleteDialect,
    isAdminable,
    isDeletingThread,
    errorDeletingThread,
  } = useThread(threadId);
  const { navigate } = useRoute();

  const { textStyles, secondaryDangerButton, secondaryDangerButtonLoading } =
    useTheme();

  return (
    <>
      <div className="dt-pt-1">
        {thread ? (
          <ValueRow
            label={
              <>
                <P className={clsx(textStyles.small, 'dt-opacity-60')}>
                  Messages account address
                </P>
                <P>
                  <A
                    target="_blank"
                    href={getExplorerAddress(
                      thread.address.toBase58(),
                      network
                    )}
                    rel="noreferrer"
                  >
                    {display(thread.address)}↗
                  </A>
                </P>
              </>
            }
            className="dt-mt-1 dt-mb-4"
          >
            <div className="dt-text-right">
              <P className={clsx(textStyles.small, 'dt-opacity-60')}>
                Deposited Rent
              </P>
              <P>0.058 SOL</P>
            </div>
          </ValueRow>
        ) : null}
        {isAdminable && (
          <Button
            className="dt-w-full"
            defaultStyle={secondaryDangerButton}
            loadingStyle={secondaryDangerButtonLoading}
            onClick={async () => {
              await deleteDialect().catch(noop);
              navigate(RouteName.Main, {
                sub: { name: MainRouteName.Thread },
              });
            }}
            loading={isDeletingThread}
          >
            Withdraw rent & delete history
          </Button>
        )}
        {errorDeletingThread &&
          errorDeletingThread.type !== 'DISCONNECTED_FROM_CHAIN' && (
            <P
              className={clsx(
                textStyles.small,
                'dt-text-red-500 dt-text-center dt-mt-2'
              )}
            >
              {errorDeletingThread.message}
            </P>
          )}
      </div>
    </>
  );
};

export default Settings;
