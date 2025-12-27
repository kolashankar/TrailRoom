import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Shield, Ban, AlertTriangle, Activity, X } from 'lucide-react';
import { formatDate } from '../../utils/utils';
import { toast } from 'sonner';

export const Security = () => {
  const [alerts, setAlerts] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockIPDialog, setBlockIPDialog] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSecurityData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [alertsRes, ipsRes, activityRes] = await Promise.all([
        api.get('/admin/security/alerts'),
        api.get('/admin/security/blocked-ips'),
        api.get('/admin/security/suspicious-activity')
      ]);
      setAlerts(alertsRes.data.alerts || []);
      setBlockedIPs(ipsRes.data.blocked_ips || []);
      setSuspiciousActivity(activityRes.data.activity || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async () => {
    if (!ipAddress || !blockReason) {
      toast.error('Please fill in all fields');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/admin/security/block-ip', {
        ip_address: ipAddress,
        reason: blockReason
      });
      toast.success('IP address blocked successfully');
      setBlockIPDialog(false);
      setIpAddress('');
      setBlockReason('');
      fetchSecurityData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to block IP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockIP = async (ipId) => {
    if (!window.confirm('Are you sure you want to unblock this IP address?')) return;

    try {
      await api.post(`/admin/security/unblock-ip/${ipId}`);
      toast.success('IP address unblocked');
      fetchSecurityData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to unblock IP');
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await api.post(`/admin/security/alerts/${alertId}/dismiss`);
      toast.success('Alert dismissed');
      fetchSecurityData();
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return styles[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security</h2>
          <p className="text-muted-foreground">Monitor and manage security threats</p>
        </div>
        <Dialog open={blockIPDialog} onOpenChange={setBlockIPDialog}>
          <DialogTrigger asChild>
            <Button>
              <Ban className="h-4 w-4 mr-2" />
              Block IP Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block IP Address</DialogTitle>
              <DialogDescription>
                Block an IP address from accessing the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>IP Address</Label>
                <Input
                  placeholder="e.g., 192.168.1.1"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  placeholder="Reason for blocking"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBlockIPDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleBlockIP} disabled={actionLoading}>
                {actionLoading ? 'Blocking...' : 'Block IP'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Ban className="h-4 w-4 mr-2 text-gray-600" />
              Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedIPs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-yellow-600" />
              Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{suspiciousActivity.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="blocked-ips">Blocked IPs</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Active security threats and anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No active security alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{alert.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(alert.created_at)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked-ips">
          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>List of blocked IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono">{ip.ip_address}</TableCell>
                      <TableCell>{ip.reason}</TableCell>
                      <TableCell>{ip.blocked_by}</TableCell>
                      <TableCell>{formatDate(ip.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnblockIP(ip.id)}
                        >
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {blockedIPs.length === 0 && (
                <div className="text-center py-8 text-gray-500">No blocked IP addresses</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activity</CardTitle>
              <CardDescription>Potential security threats detected by the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User/IP</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="capitalize">{activity.type}</TableCell>
                      <TableCell className="font-mono text-xs">{activity.identifier}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(activity.severity)}`}>
                          {activity.severity}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(activity.detected_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {suspiciousActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500">No suspicious activity detected</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
