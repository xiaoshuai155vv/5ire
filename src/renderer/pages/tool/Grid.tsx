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
import {
  Edit20Regular,
  Edit20Filled,
  bundleIcon,
  Circle16Filled,
  CircleHintHalfVertical16Filled,
  CircleOff16Regular,
  Info16Regular,
} from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useMCPStore from 'stores/useMCPStore';
import * as mcpUtils from 'utils/mcp';
import useToast from 'hooks/useToast';
import ToolDetailDialog from './DetailDialog';
import { IMCPServer } from 'types/mcp';

const EditIcon = bundleIcon(Edit20Filled, Edit20Regular);

export default function Grid({
  servers,
  edit,
}: {
  servers: IMCPServer[];
  edit: (server: IMCPServer) => void;
}) {
  const { t } = useTranslation();
  const { notifyError } = useToast();
  const { activateServer, deactivateServer } = useMCPStore((state) => state);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [open, setOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<IMCPServer | null>(null);
  const [params, setParams] = useState<mcpUtils.IMCPServerParameter[]>([]);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

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
      await activateServer(server.key, undefined, args, env);
    } catch (error: any) {
      notifyError(error.message || t('MCP.ServerActivationFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, [server.key]: false }));
    }
    setOpen(false);
  };

  const columns: TableColumnDefinition<IMCPServer>[] = [
    createTableColumn<IMCPServer>({
      columnId: 'name',
      compare: (a: IMCPServer, b: IMCPServer) => {
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
                <div className='ml-4'>
                  <Button
                    icon={<EditIcon />}
                    size="small"
                    onClick={() => edit(item)}
                    appearance="subtle"
                  />
                  {item.isActive && item.args?.length > 0 && (
                    <ToolDetailDialog tool={item.key} />
                  )}
                </div>
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

  const renderRow: RowRenderer<IMCPServer> = ({ item, rowId }, style) => (
    <DataGridRow<IMCPServer> key={rowId} style={style}>
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
        <DataGridBody<IMCPServer> itemSize={50} height={innerHeight - 180}>
          {renderRow}
        </DataGridBody>
      </DataGrid>
    </div>
  );
}
