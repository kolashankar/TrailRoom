import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Search, ChevronLeft, ChevronRight, Eye, Ban, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/utils';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [suspended, setSuspended] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, suspended]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * limit,
        limit: limit,
      };
      if (search) params.search = search;
      if (role) params.role = role;
      if (suspended !== '') params.is_suspended = suspended === 'true';

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(0);
  };

  const getRoleBadge = (userRole) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800',
      paid: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return styles[userRole] || styles.free;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">Manage and monitor user accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={suspended}
              onChange={(e) => { setSuspended(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Suspended</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{user.credits || 0}</TableCell>
                      <TableCell>
                        {user.is_suspended ? (
                          <span className="flex items-center text-red-600">
                            <Ban className="h-4 w-4 mr-1" /> Suspended
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" /> Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">No users found</div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} users
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
