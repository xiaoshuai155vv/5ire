import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { isValidHttpHRL } from 'utils/validators';
import {
  MenuTrigger,
  MenuButton,
  MenuPopover,
  MenuList,
  Menu,
  MenuItem,
} from '@fluentui/react-components';
import ToolStatusIndicator from 'renderer/components/ToolStatusIndicator';
import { urlJoin } from 'utils/util';
import { IServiceProvider } from 'providers/types';
import useSettingsStore from 'stores/useSettingsStore';

type Item = {
  name: string;
  isEnabled: boolean;
};

const SUPPORT_PROVIDERS = ['ollama', 'lmstudio'];

const makeItems = (providerName: string, data: any): Item[] => {
  if (providerName === 'ollama') {
    return data.models.map((model: any) => {
      return {
        name: model.name,
        isEnabled: model.name.indexOf('embed') < 0, // filter out embedding models
      };
    });
  }
  if (providerName === 'lmstudio') {
    return data.data.map((model: any) => {
      return {
        name: model.id,
        isEnabled: model.id.indexOf('embed') < 0, // filter out embedding models
      };
    });
  }
  return [];
};

export default function RemoteModelPicker({
  provider,
  onConfirm,
}: {
  provider: IServiceProvider;
  onConfirm: (modeName: string) => void;
}) {
  const providerName = useMemo(
    () => provider.name.toLowerCase(),
    [provider.name],
  );
  const baseUrl = useSettingsStore((state) => state.api.base);
  const [items, setItems] = useState<Item[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!provider || SUPPORT_PROVIDERS.indexOf(providerName) < 0) {
      return;
    }
    if (!isValidHttpHRL(baseUrl)) {
      setItems([
        {
          name: t('Common.Error.InvalidAPIBase'),
          isEnabled: false,
        },
      ]);
      return;
    }

    let isMounted = true;
    setItems([
      {
        name: t('Common.Loading'),
        isEnabled: false,
      },
    ]);

    const url = urlJoin(provider.options.modelsEndpoint || '', baseUrl);
    fetch(url)
      .then((res) => {
        if (!isMounted) return;
        if (res.ok) {
          res
            .json()
            .then((data) => {
              if (!isMounted) return;
              setItems(makeItems(providerName, data));
            })
            .catch(() => {
              if (!isMounted) return;
              setItems([
                {
                  name: t('Common.Error.FetchFailed'),
                  isEnabled: false,
                },
              ]);
            });
        } else {
          if (!isMounted) return;
          setItems([
            {
              name: t('Common.Error.FetchFailed'),
              isEnabled: false,
            },
          ]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setItems([
          {
            name: t('Common.Error.FetchFailed'),
            isEnabled: false,
          },
        ]);
      });

    return () => {
      isMounted = false;
      setItems([]);
    };
  }, [provider, baseUrl]);

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton size="small" appearance="primary">
          {t('Common.Action.Choose')}
        </MenuButton>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {items.map((item: Item) => (
            <MenuItem
              key={item.name}
              disabled={!item.isEnabled}
              onClick={() => onConfirm(item.name)}
            >
              <div className="flex justify-start items-center gap-1">
                <ToolStatusIndicator
                  model={item.name}
                  provider={provider.name}
                />{' '}
                <span> {item.name}</span>
              </div>
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
