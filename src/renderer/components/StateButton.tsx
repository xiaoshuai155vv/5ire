import { Button, Spinner } from '@fluentui/react-components';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

function StateButton(props: { loading: boolean } & any, ref: any) {
  const { t } = useTranslation();
  const { loading, icon, ...rest } = props;
  return (
    <Button
      {...rest}
      disabled={loading}
      icon={loading ? <Spinner size="tiny" /> : icon}
    >
      {loading ? t('Common.Waiting') : props.children}
    </Button>
  );
}

export default forwardRef(StateButton);
