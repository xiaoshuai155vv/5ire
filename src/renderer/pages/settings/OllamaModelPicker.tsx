import { useTranslation } from 'react-i18next';
import {  useEffect } from 'react';
import React from 'react';
import { isValidHttpHRL } from 'utils/validators';
import {
  MenuTrigger,
  MenuButton,
  MenuPopover,
  MenuList,
  Menu,
  MenuItem,
} from '@fluentui/react-components';

type Item = {
  name: string;
  isEnabled: boolean;
};

export default function OllamaModelPicker(args: {
  baseUrl: string;
  onConfirm: (modeName: string) => void;
}) {
  const { baseUrl, onConfirm } = args;
  const [items, setItems] = React.useState<Item[]>([]);
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
      const url = new URL('/api/tags', baseUrl);
      fetch(url.toString()).then((res) => {
        if (res.ok) {
          res
            .json()
            .then((data) => {
              setItems(
                data.models.map((model: any) => {
                  return {
                    name: model.name,
                    isEnabled: model.name.indexOf('embed') < 0, // filter out embedding models
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
      });
    }
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
              {item.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
