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
  Popover,
  PopoverSurface,
  PopoverTrigger,
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
import {
  BracesVariable20Filled,
  BracesVariable20Regular,
  bundleIcon,
  Circle16Filled,
  CircleHintHalfVertical16Filled,
  CircleOff16Regular,
  Info16Regular,
} from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useMCPStore, { IMCPServer } from 'stores/useMCPStore';
import * as mcpUtils from 'utils/mcp';
import ParamsDialog from './ParamsDialog';
import useToast from 'hooks/useToast';
import ToolDetailDialog from './DetailDialog';

const BracesVariableIcon = bundleIcon(
  BracesVariable20Filled,
  BracesVariable20Regular,
);

export default function Grid({ servers }: { servers: IMCPServer[] }) {
  const { t } = useTranslation();
  const { notifyError } = useToast();
  const { activateServer, deactivateServer } = useMCPStore((state) => state);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [open, setOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<IMCPServer | null>(null);
  const [params, setParams] = useState<mcpUtils.IMCPServerParameter[]>([]);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

  type Item = {
    key: string;
    description: string;
    args: string[];
    env?: Record<string, string>;
    isActive: boolean;
  };

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const activateServerWithParams = async (params: {
    [key: string]: string;
  }) => {
    const server = { ...(selectedServer as IMCPServer) };
    const args = mcpUtils.setParameters(server.args, params);
    const env = mcpUtils.setEnv(server.env, params);
    try {
      setLoading((prev) => ({ ...prev, [server.key]: true }));
      await activateServer(server.key, args, env);
    } catch (error: any) {
      notifyError(error.message || t('MCP.ServerActivationFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, [server.key]: false }));
    }
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
              <div className="flex flex-start items-center flex-grow overflow-y-hidden">
                {loading[item.key] ? (
                  <CircleHintHalfVertical16Filled className="animate-spin -mb-1" />
                ) : item.isActive ? (
                  <Circle16Filled className="text-green-500 -mb-0.5" />
                ) : (
                  <CircleOff16Regular className="text-gray-400 dark:text-gray-600 -mb-0.5" />
                )}
                <div className="ml-1.5">{item.key}</div>
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
                {item.isActive && item.args?.length > 0 && (
                  <div className="-mb-0.5 ml-1">
                    <Popover withArrow>
                      <PopoverTrigger disableButtonEnhancement>
                        <Button
                          icon={<BracesVariableIcon />}
                          size="small"
                          appearance="subtle"
                        />
                      </PopoverTrigger>
                      <PopoverSurface tabIndex={-1}>
                        <pre>
                          <div>{JSON.stringify(item.args, null, 2)}</div>
                        </pre>
                      </PopoverSurface>
                    </Popover>
                    <ToolDetailDialog tool={item.key} />
                  </div>
                )}
              </div>
            </TableCellLayout>
            <TableCellActions>
              <Switch
                disabled={loading[item.key]}
                checked={item.isActive}
                aria-label={t('Common.State')}
                onChange={async (ev: any, data: any) => {
                  if (data.checked) {
                    const args = mcpUtils.getParameters(item.args);
                    const env = mcpUtils.getParameters(
                      Object.values(item.env || {}),
                    );
                    const params = [...args, ...env];
                    setParams(params);
                    if (params.length > 0) {
                      setSelectedServer(item as IMCPServer);
                      setOpen(true);
                    } else {
                      try {
                        setLoading((prev) => ({ ...prev, [item.key]: true }));
                        await activateServer(item.key);
                      } catch (error: any) {
                        notifyError(
                          error.message || t('MCP.ServerActivationFailed'),
                        );
                      } finally {
                        setLoading((prev) => ({ ...prev, [item.key]: false }));
                      }
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
        <DataGridBody<Item> itemSize={50} height={innerHeight - 240}>
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
