import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Search, RefreshCw, X, DollarSign, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/utils';
import { toast } from 'sonner';

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchJobs();
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [page, search, status]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * limit,
        limit: limit,
      };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await api.get('/admin/jobs', { params });
      setJobs(response.data.jobs);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to retry this job?')) return;

    try {
      await api.post(`/admin/jobs/${jobId}/retry`);
      toast.success('Job retry initiated');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to retry job');
    }
  };

  const handleCancelJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to cancel this job?')) return;

    try {
      await api.post(`/admin/jobs/${jobId}/cancel`);
      toast.success('Job cancelled');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel job');
    }
  };

  const handleRefundJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to refund credits for this job?')) return;

    try {
      await api.post(`/admin/jobs/${jobId}/refund`);
      toast.success('Credits refunded successfully');
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to refund job');
    }
  };

  const handleViewJob = async (jobId) => {
    try {
      const response = await api.get(`/admin/jobs/${jobId}`);
      setSelectedJob(response.data);
      setViewDialog(true);
    } catch (error) {
      toast.error('Failed to load job details');
    }
  };

  const getStatusBadge = (jobStatus) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[jobStatus] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Try-On Jobs</h2>
        <p className="text-muted-foreground">Monitor and manage virtual try-on generation jobs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {jobs.filter(j => j.status === 'processing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {jobs.filter(j => j.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by job ID or user email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={fetchJobs} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading jobs...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">{job.id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-xs">{job.user_email || job.user_id}</TableCell>
                      <TableCell className="capitalize">{job.mode}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell>{job.credits_used || 1}</TableCell>
                      <TableCell>{formatDate(job.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewJob(job.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {job.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetryJob(job.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {(job.status === 'processing' || job.status === 'queued') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelJob(job.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {(job.status === 'failed' || job.status === 'cancelled') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRefundJob(job.id)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">No jobs found</div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} jobs
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

      {/* Job Detail Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Job ID</p>
                  <p className="font-mono text-xs">{selectedJob.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="text-sm">{selectedJob.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mode</p>
                  <p className="text-sm capitalize">{selectedJob.mode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(selectedJob.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Used</p>
                  <p className="text-sm">{selectedJob.credits_used || 1}</p>
                </div>
              </div>

              {selectedJob.error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{selectedJob.error}</p>
                </div>
              )}

              {selectedJob.result_image && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Result Image</p>
                  <img 
                    src={selectedJob.result_image} 
                    alt="Result" 
                    className="w-full max-h-96 object-contain rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
