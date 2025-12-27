import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Minus, Ban, CheckCircle, Key, AlertTriangle } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/utils';
import { toast } from 'sonner';

export const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creditHistory, setCreditHistory] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [creditDialog, setCreditDialog] = useState(false);
  const [credits, setCredits] = useState(0);
  const [reason, setReason] = useState('');
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setUser(response.data.user);
      setCreditHistory(response.data.credit_history || []);
      setJobHistory(response.data.job_history || []);
      setPaymentHistory(response.data.payment_history || []);
      setApiKeys(response.data.api_keys || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!credits || !reason) {
      toast.error('Please enter credits and reason');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/users/${userId}/credits`, null, {
        params: { credits, reason }
      });
      toast.success(`Credits ${credits > 0 ? 'added' : 'deducted'} successfully`);
      setCreditDialog(false);
      setCredits(0);
      setReason('');
      fetchUserDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to adjust credits');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason) {
      toast.error('Please enter a reason');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.post(`/admin/users/${userId}/suspend`, null, {
        params: { reason: suspendReason }
      });
      toast.success(response.data.message);
      setSuspendDialog(false);
      setSuspendReason('');
      fetchUserDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetApiKey = async () => {
    if (!window.confirm('Are you sure you want to reset this user\'s API keys? They will need to generate new ones.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/users/${userId}/api-key/reset`);
      toast.success('API keys reset successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset API keys');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{user.email}</h2>
          <p className="text-muted-foreground">User ID: {user.id}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={creditDialog} onOpenChange={setCreditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adjust Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Credits</DialogTitle>
                <DialogDescription>
                  Add (positive) or deduct (negative) credits from this user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount (e.g., 100 or -50)"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input
                    placeholder="Reason for adjustment"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreditDialog(false)}>Cancel</Button>
                <Button onClick={handleAdjustCredits} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
            <DialogTrigger asChild>
              <Button variant={user.is_suspended ? "default" : "destructive"}>
                {user.is_suspended ? (
                  <><CheckCircle className="h-4 w-4 mr-2" /> Unsuspend</>
                ) : (
                  <><Ban className="h-4 w-4 mr-2" /> Suspend</>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{user.is_suspended ? 'Unsuspend' : 'Suspend'} User</DialogTitle>
                <DialogDescription>
                  {user.is_suspended 
                    ? 'This will restore user access to their account.'
                    : 'This will prevent the user from accessing their account.'}
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label>Reason</Label>
                <Input
                  placeholder="Reason for this action"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSuspendDialog(false)}>Cancel</Button>
                <Button 
                  variant={user.is_suspended ? "default" : "destructive"}
                  onClick={handleSuspendUser} 
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.role}</div>
            {user.admin_type && <p className="text-xs text-muted-foreground mt-1">{user.admin_type}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.credits || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${user.is_suspended ? 'text-red-600' : 'text-green-600'}`}>
              {user.is_suspended ? 'Suspended' : 'Active'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Joined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{formatDate(user.created_at)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="credits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credits">Credit History</TabsTrigger>
          <TabsTrigger value="jobs">Try-On Jobs</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credit History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditHistory.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell className={transaction.credits > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {creditHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">No credit transactions</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Try-On Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credits Used</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobHistory.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">{job.id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{job.mode}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell>{job.credits_used || 1}</TableCell>
                      <TableCell>{formatDate(job.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {jobHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">No jobs found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">{payment.order_id?.slice(0, 12)}...</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.credits}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paymentHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">No payments found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage user's API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{key.name || 'API Key'}</p>
                        <p className="text-xs text-muted-foreground">Created: {formatDate(key.created_at)}</p>
                        {key.last_used && <p className="text-xs text-muted-foreground">Last used: {formatDate(key.last_used)}</p>}
                      </div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No API keys generated</div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResetApiKey}
                  disabled={actionLoading}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Reset All API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
