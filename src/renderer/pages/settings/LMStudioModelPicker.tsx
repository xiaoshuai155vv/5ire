import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
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

type Item = {
  name: string;
  isEnabled: boolean;
};

export default function LMStudioModelPicker({
  baseUrl,
  onConfirm,
}: {
  baseUrl: string;
  onConfirm: (modeName: string) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isValidHttpHRL(baseUrl)) {
      setItems([
        {
          name: t('Common.Error.InvalidAPIBase'),
          isEnabled: false,
        },
      ]);
    } else {
      setItems([
        {
          name: t('Common.Loading'),
          isEnabled: false,
        },
      ]);
      const url = new URL('/v1/models', baseUrl);
      fetch(url.toString())
        .then((res) => {
          if (res.ok) {
            res
              .json()
              .then((data) => {
                setItems(
                  data.data.map((model: any) => {
                    return {
                      name: model.id,
                      isEnabled: model.id.indexOf('embed') < 0, // filter out embedding models
                    };
                  }),
                );
              })
              .catch(() => {
                setItems([
                  {
                    name: t('Common.Error.FetchFailed'),
                    isEnabled: false,
                  },
                ]);
              });
          } else {
            setItems([
              {
                name: t('Common.Error.FetchFailed'),
                isEnabled: false,
              },
            ]);
          }
        })
        .catch(() => {
          setItems([
            {
              name: t('Common.Error.FetchFailed'),
              isEnabled: false,
            },
          ]);
        });
    }
    return () => setItems([]);
  }, [baseUrl]);

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
                <ToolStatusIndicator model={item.name} provider="LMStudio" />{' '}
                <span> {item.name}</span>
              </div>
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
