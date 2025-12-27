import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Search, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { formatDate } from '../../utils/utils';
import { toast } from 'sonner';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, search, action]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * limit,
        limit: limit,
      };
      if (search) params.search = search;
      if (action) params.action = action;

      const response = await api.get('/admin/audit-logs', { params });
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (action) params.action = action;

      const response = await api.get('/admin/audit-logs/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const getActionBadge = (actionType) => {
    const colorMap = {
      'user': 'bg-blue-100 text-blue-800',
      'payment': 'bg-green-100 text-green-800',
      'job': 'bg-purple-100 text-purple-800',
      'security': 'bg-red-100 text-red-800',
      'prompt': 'bg-yellow-100 text-yellow-800',
    };
    
    const prefix = actionType.split('.')[0];
    return colorMap[prefix] || 'bg-gray-100 text-gray-800';
  };

  const actionTypes = [
    'user.credits.adjust',
    'user.role.update',
    'user.suspend',
    'user.unsuspend',
    'user.api_key.reset',
    'payment.refund',
    'job.retry',
    'job.cancel',
    'job.refund',
    'security.ip.block',
    'security.ip.unblock',
    'prompt.create',
    'prompt.update',
    'prompt.rollback',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">Track all administrative actions and changes</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by admin email, action, or target..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading audit logs...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{formatDate(log.created_at)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{log.admin_email}</TableCell>
                      <TableCell className="text-xs">
                        {log.target_type && log.target_id && (
                          <div>
                            <span className="font-medium">{log.target_type}</span>
                            <br />
                            <span className="text-muted-foreground font-mono">{log.target_id.slice(0, 8)}...</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate">
                        {log.details && typeof log.details === 'object' ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:underline">View details</summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          log.details
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">No audit logs found</div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} logs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={(page + 1) * limit >= total}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
