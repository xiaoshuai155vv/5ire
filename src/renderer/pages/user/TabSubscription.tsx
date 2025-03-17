import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from 'stores/useAuthStore';
import supabase from 'vendors/supa';
import Debug from 'debug';
import useToast from 'hooks/useToast';
import Spinner from 'renderer/components/Spinner';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@fluentui/react-components';
import { fmtDateTime } from 'utils/util';
import { captureException } from '../../logging';

const debug = Debug('5ire:pages:user:TabSubscription');

export default function TabSubscription() {
  const { notifyError, notifyInfo, notifySuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string>('');
  const [subscription, setSubscription] = useState<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [usage, setUsage] = useState<string>('-');
  const user = useAuthStore((state) => state.user);

  const isSubscribed = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      subscription &&
      subscription.deadline &&
      new Date(subscription.deadline).getTime() >= today.getTime()
    );
  }, [subscription]);

  const loadUsage = async (userId: string) => {
    try {
      const resp = await fetch('https://skyfire.agisurge.com/v1/usage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`,
        },
      });
      const data = await resp.json();
      setUsage(data.usage);
    } catch (error) {
      debug(error);
      captureException(error);
    }
  };

  const loadOrders = async (userId: string) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, num_of_month, currency, amount, created_at')
        .order('created_at', { ascending: false })
        .eq('user_id', userId);
      if (error) {
        notifyError(error.message);
      } else {
        setOrders(orders);
      }
    } catch (error) {
      debug(error);
      captureException(error);
    }
  };

  const onRedeem = useCallback(
    async (userId: string | undefined) => {
      if (!userId) {
        notifyError('User not found');
        return;
      }
      if (redeemCode.length != 20) {
        notifyInfo(t('Subscription.Notification.InvalidRedeemCode'));
        return;
      }
      try {
        setRedeeming(true);
        const { data, error } = await supabase
          .from('coupons')
          .update({
            user_id: userId,
          })
          .eq('id', redeemCode)
          .is('user_id', null)
          .is('redeemed_at', null)
          .select('id')
          .maybeSingle();
        if (error || !data) {
          notifyError(
            error?.message || t('Subscription.Notification.RedeemFailed'),
          );
        } else {
          notifySuccess(t('Subscription.Notification.RedeemSuccess'));
          loadSubscription(userId);
          loadOrders(userId);
          setRedeemOpen(false);
        }
      } catch (error) {
        debug(error);
        captureException(error);
      } finally {
        setRedeeming(false);
      }
    },
    [redeemCode],
  );

  const loadSubscription = async (userId: string) => {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('id, quota_per_day, deadline')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        notifyError(error.message);
      } else {
        setSubscription(subscription);
      }
    } catch (error) {
      debug(error);
      captureException(error);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    Promise.all([
      loadSubscription(user.id),
      loadOrders(user.id),
      loadUsage(user.id),
    ]).finally(() => setLoading(false));
  }, [user]);

  const { t } = useTranslation();
  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner />
            <div className="tips text-xs mt-2">{t('Common.Loading')}</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 w-full min-h-96">
          <div>
            {isSubscribed ? (
              <div className="flex justify-between items-start bg-brand-surface-2 p-3 rounded">
                <div className="flex justify-start items-start gap-4">
                  <div className="border-r border-base pr-6">
                    <div className="text-xs mb-1 tips">
                      {t('Subscription.ExpiresOn')}
                    </div>
                    <div className="text-xl">{subscription.deadline}</div>
                  </div>
                  <div>
                    <div className="text-xs pl-2">
                      <div className="text-xs mb-1 tips">
                        {t('Subscription.QuotaPerDay')}
                      </div>
                      <div className="text-xl">
                        {usage || '0'} /{' '}
                        {isSubscribed ? subscription.quota_per_day : '0'}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  appearance="primary"
                  size="small"
                  onClick={() => setRedeemOpen(true)}
                >
                  {t('Subscription.Redeem')}
                </Button>
              </div>
            ) : (
              <div className="bg-brand-surface-2 p-3 rounded flex justify-between items-start flex-warp">
                <div>
                  <div className="text-base flex justify-start items-start gap-2">
                    {t('Subscription.NoActive')}
                  </div>
                  <div className="text-xs mt-2">{t('Subscription.CIA')}</div>
                </div>
                <Button
                  appearance="primary"
                  onClick={() => setRedeemOpen(true)}
                >
                  {t('Subscription.Redeem')}
                </Button>
              </div>
            )}
          </div>
          <div>
            <div className="text border-b border-base pb-2">
              {t('Common.Orders')}
            </div>
            <div className="flex flex-col gap-1 pt-2">
              {orders.length ? (
                orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-3">
                    <div>
                      <span className="inline-block w-3 number">
                        {order.num_of_month}
                      </span>
                      {t('Subscription.Month')}
                    </div>
                    <div className="text-right mr-4 number">
                      {order.amount / 100} {order.currency}
                    </div>
                    <div className="text-right min-w-28 number">
                      {fmtDateTime(new Date(order.created_at))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs tips py-2">
                  {t('Subscription.NoOrder')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Dialog
        modalType="non-modal"
        open={redeemOpen}
        onOpenChange={(open) => setRedeemOpen(!open)}
      >
        <DialogSurface aria-describedby={undefined}>
          <DialogBody>
            <DialogTitle>{t('Subscription.Redeem')}</DialogTitle>
            <DialogContent>
              <button
                className="underline p-0"
                onClick={() =>
                  window.electron.openExternal('https://5ire.app/redeem-code')
                }
              >
                {t('Subscription.HowToGetRedeemCode')}
              </button>
              <Input
                className="w-full my-4"
                onChange={(e) => setRedeemCode(e.currentTarget.value)}
                placeholder={t('Subscription.Placeholder.RedeemCode')}
              />
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="subtle"
                  onClick={() => setRedeemOpen(false)}
                >
                  {t('Common.Cancel')}
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                appearance="primary"
                disabled={redeeming}
                onClick={() => onRedeem(user?.id)}
              >
                {redeeming ? t('Common.Waiting') : t('Common.Submit')}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
