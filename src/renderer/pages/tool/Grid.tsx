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
  Switch,
  TableCell,
  TableCellActions,
  TableCellLayout,
  TableColumnDefinition,
  Tooltip,
  createTableColumn,
  useFluent,
  useScrollbarWidth,
} from '@fluentui/react-components';
import { CheckmarkCircle20Filled, Info16Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useMCPStore, { IMCPServer } from 'stores/useMCPStore';
import * as mcpUtils from 'utils/mcp';
import ParamsDialog from './ParamsDialog';

export default function Grid({ servers }: { servers: IMCPServer[] }) {
  const { t } = useTranslation();
  const { activateServer, deactivateServer } = useMCPStore((state) => state);
  const [open, setOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<IMCPServer | null>(null);
  const [params, setParams] = useState<string[]>([]);

  type Item = {
    key: string;
    description: string;
    args: string[];
    isActive: boolean;
  };

  const activateServerWithParams = async (params: {
    [key: string]: string;
  }) => {
    const server = { ...(selectedServer as IMCPServer) };
    const args = mcpUtils.setParameters(server.args, params);
    await activateServer(server.key, args);
    setOpen(false);
  };

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: 'name',
      compare: (a: Item, b: Item) => {
        return a.key.localeCompare(b.key);
      },
      renderHeaderCell: () => {
        return t('Common.Name');
      },
      renderCell: (item) => {
        return (
          <TableCell>
            <TableCellLayout truncate>
              <div className="flex flex-start items-center flex-grow">
                <div>{item.key}</div>
                {item.description && (
                  <div className="-mb-0.5">
                    <Tooltip
                      content={item.description}
                      relationship="label"
                      withArrow
                      appearance="inverted"
                    >
                      <Button
                        icon={<Info16Regular />}
                        size="small"
                        appearance="subtle"
                      />
                    </Tooltip>
                  </div>
                )}
                {item.isActive && (
                  <CheckmarkCircle20Filled className="text-green-500 -mb-0.5" />
                )}
              </div>
            </TableCellLayout>
            <TableCellActions>
              <Switch
                checked={item.isActive}
                aria-label={t('Common.State')}
                onChange={async (ev: any, data: any) => {
                  if (data.checked) {
                    const params = mcpUtils.getParameters(item.args);
                    setParams(params);
                    if (params.length > 0) {
                      setSelectedServer(item as IMCPServer);
                      setOpen(true);
                      console.log(params);
                    } else {
                      activateServer(item.key);
                    }
                  } else {
                    deactivateServer(item.key);
                  }
                }}
              />
            </TableCellActions>
          </TableCell>
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
    <div className="w-full pr-4">
      <DataGrid
        items={servers}
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
      <ParamsDialog
        title={selectedServer?.key || ''}
        open={open}
        setOpen={setOpen}
        params={params}
        onSubmit={activateServerWithParams}
      />
    </div>
  );
}
