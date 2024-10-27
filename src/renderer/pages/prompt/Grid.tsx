/* eslint-disable react/no-danger */
import {
  DataGridBody,
  DataGrid,
  DataGridRow,
  DataGridHeader,
  DataGridCell,
  DataGridHeaderCell,
  RowRenderer,
} from '@fluentui-contrib/react-data-grid-react-window';
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  TableCell,
  TableCellActions,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  useFluent,
  useScrollbarWidth,
} from '@fluentui/react-components';
import {
  bundleIcon,
  PinFilled,
  PinRegular,
  PinOffFilled,
  PinOffRegular,
  DeleteFilled,
  DeleteRegular,
  EditFilled,
  EditRegular,
  MoreHorizontalFilled,
  MoreHorizontalRegular,
  OptionsFilled,
  OptionsRegular,
} from '@fluentui/react-icons';
import ConfirmDialog from 'renderer/components/ConfirmDialog';
import useNav from 'hooks/useNav';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IPromptDef } from '../../../intellichat/types';
import { fmtDateTime, unix2date, highlight, date2unix } from 'utils/util';
import usePromptStore from 'stores/usePromptStore';
import useToast from 'hooks/useToast';

const EditIcon = bundleIcon(EditFilled, EditRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);
const PinIcon = bundleIcon(PinFilled, PinRegular);
const PinOffIcon = bundleIcon(PinOffFilled, PinOffRegular);

const OptionsIcon = bundleIcon(
  OptionsFilled,
  OptionsRegular
);

export default function Grid({
  prompts,
  keyword = '',
}: {
  prompts: IPromptDef[];
  keyword: string;
}) {
  const { t } = useTranslation();
  const [delConfirmDialogOpen, setDelConfirmDialogOpen] =
    useState<boolean>(false);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const deletePrompt = usePromptStore((state) => state.deletePrompt);
  const updatePrompt = usePromptStore((state) => state.updatePrompt);
  const { notifySuccess } = useToast();
  const navigate = useNav();
  const pinPrompt = (id: string) => {
    updatePrompt({ id, pinedAt: date2unix(new Date()) });
  };
  const unpinPrompt = (id: string) => {
    updatePrompt({ id, pinedAt: null });
  };

  const items = useMemo(
    () =>
      prompts.map((prompt) => {
        const models = prompt.models || [];
        return {
          id: prompt.id,
          name: { value: prompt.name },
          models: {
            value:
              models.length > 2
                ? models.slice(0, 2).concat(`and ${models.length - 2} more...`)
                : models,
          },
          updatedAt: {
            value: fmtDateTime(unix2date(prompt.updatedAt as number)),
            timestamp: prompt.updatedAt,
          },
          pined: !!prompt.pinedAt,
        };
      }),
    [prompts]
  );

  type NameCell = {
    value: string;
  };
  type ModelsCell = {
    value: string[];
  };
  type UpdatedCell = {
    value: string;
    timestamp: number;
  };
  type Item = {
    id: string;
    name: NameCell;
    models: ModelsCell;
    updatedAt: UpdatedCell;
    pined: boolean;
  };

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: 'name',
      compare: (a: Item, b: Item) => {
        return a.name.value.localeCompare(b.name.value);
      },
      renderHeaderCell: () => {
        return t('Common.Name');
      },
      renderCell: (item) => {
        return (
          <TableCell>
            <TableCellLayout>
              <div className="flex flex-start items-center">
                <div
                  dangerouslySetInnerHTML={{
                    __html: highlight(item.name.value, keyword),
                  }}
                />
                {item.pined ? <PinFilled className="ml-1" /> : null}
              </div>
            </TableCellLayout>
            <TableCellActions>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button icon={<OptionsIcon />} appearance="subtle" />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<EditIcon />}
                      onClick={() => navigate(`/prompts/form/${item.id}`)}
                    >
                      {t('Common.Edit')}
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={() => {
                        setActivePromptId(item.id);
                        setDelConfirmDialogOpen(true);
                      }}
                    >
                      {t('Common.Delete')}{' '}
                    </MenuItem>
                    {item.pined ? (
                      <MenuItem
                        icon={<PinOffIcon />}
                        onClick={() => unpinPrompt(item.id)}
                      >
                        {t('Common.Unpin')}{' '}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        icon={<PinIcon />}
                        onClick={() => pinPrompt(item.id)}
                      >
                        {t('Common.Pin')}{' '}
                      </MenuItem>
                    )}
                  </MenuList>
                </MenuPopover>
              </Menu>
            </TableCellActions>
          </TableCell>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: 'models',
      compare: (a, b) => {
        return a.models.value.join(',').localeCompare(b.models.value.join(','));
      },
      renderHeaderCell: () => {
        return t('Prompt.Form.ApplicableModels');
      },
      renderCell: (item) => {
        return (
          <TableCellLayout>
            <span className="latin">{item.models.value.join(', ')}</span>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Item>({
      columnId: 'updatedAt',
      compare: (a, b) => {
        return a.updatedAt.value.localeCompare(b.updatedAt.value);
      },
      renderHeaderCell: () => {
        return t('Common.LastUpdated');
      },
      renderCell: (item) => {
        return (
          <TableCellLayout>
            <span className="latin">{item.updatedAt.value}</span>
          </TableCellLayout>
        );
      },
    }),
  ];

  const renderRow: RowRenderer<Item> = ({ item, rowId }, style) => (
    <DataGridRow<Item> key={rowId} style={style}>
      {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
    </DataGridRow>
  );
  const { targetDocument } = useFluent();
  const scrollbarWidth = useScrollbarWidth({ targetDocument });

  return (
    <div className="w-full">
      <DataGrid
        items={items}
        columns={columns}
        focusMode="cell"
        sortable
        size="small"
        style={{ height: 400 }}
        className="w-full"
        getRowId={(item) => item.id}
      >
        <DataGridHeader style={{ paddingRight: scrollbarWidth }}>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<Item> itemSize={50} height={400}>
          {renderRow}
        </DataGridBody>
      </DataGrid>
      <ConfirmDialog
        open={delConfirmDialogOpen}
        setOpen={setDelConfirmDialogOpen}
        onConfirm={() => {
          deletePrompt(activePromptId as string);
          setActivePromptId(null);
          notifySuccess(t('Prompt.Notification.Deleted'));
        }}
      />
    </div>
  );
}
