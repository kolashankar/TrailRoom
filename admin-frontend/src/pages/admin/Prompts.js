import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Save, Plus, History, RotateCcw } from 'lucide-react';
import { formatDate } from '../../utils/utils';
import { toast } from 'sonner';

export const Prompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptText, setPromptText] = useState('');
  const [promptName, setPromptName] = useState('');
  const [promptType, setPromptType] = useState('top_only');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/prompts');
      setPrompts(response.data.prompts || []);
      if (response.data.prompts && response.data.prompts.length > 0) {
        setSelectedPrompt(response.data.prompts[0]);
        setPromptText(response.data.prompts[0].prompt_text);
        setPromptType(response.data.prompts[0].prompt_type);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!selectedPrompt) return;

    setSaving(true);
    try {
      await api.put(`/admin/prompts/${selectedPrompt.id}`, {
        prompt_text: promptText,
        prompt_type: promptType
      });
      toast.success('Prompt saved successfully');
      fetchPrompts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePrompt = async () => {
    if (!promptName || !promptText) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await api.post('/admin/prompts', {
        name: promptName,
        prompt_text: promptText,
        prompt_type: promptType
      });
      toast.success('Prompt created successfully');
      setCreateDialog(false);
      setPromptName('');
      setPromptText('');
      fetchPrompts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (versionId) => {
    if (!window.confirm('Are you sure you want to rollback to this version?')) return;

    try {
      await api.post(`/admin/prompts/${selectedPrompt.id}/rollback`, {
        version_id: versionId
      });
      toast.success('Rolled back to previous version');
      fetchPrompts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to rollback');
    }
  };

  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptText(prompt.prompt_text);
    setPromptType(prompt.prompt_type);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Prompts</h2>
          <p className="text-muted-foreground">Manage AI prompts for virtual try-on generation</p>
        </div>
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
              <DialogDescription>
                Create a new AI prompt for virtual try-on generation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Prompt Name</Label>
                <Input
                  placeholder="e.g., Top Only Prompt v2"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                />
              </div>
              <div>
                <Label>Prompt Type</Label>
                <select
                  value={promptType}
                  onChange={(e) => setPromptType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="top_only">Top Only</option>
                  <option value="full_outfit">Full Outfit</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <Label>Prompt Text</Label>
                <textarea
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the AI prompt..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreatePrompt} disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-500">Loading prompts...</div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Prompt List Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => selectPrompt(prompt)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedPrompt?.id === prompt.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{prompt.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{prompt.prompt_type}</div>
                    </button>
                  ))}
                  {prompts.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No prompts found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prompt Editor */}
          <div className="col-span-9">
            {selectedPrompt ? (
              <Tabs defaultValue="editor" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="history">Version History</TabsTrigger>
                </TabsList>

                <TabsContent value="editor">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedPrompt.name}</CardTitle>
                      <CardDescription>
                        Last updated: {formatDate(selectedPrompt.updated_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Prompt Type</Label>
                        <select
                          value={promptType}
                          onChange={(e) => setPromptType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="top_only">Top Only</option>
                          <option value="full_outfit">Full Outfit</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      <div>
                        <Label>Prompt Text</Label>
                        <textarea
                          className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSavePrompt} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Version History</CardTitle>
                      <CardDescription>
                        View and rollback to previous versions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead>Modified By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPrompt.versions?.map((version, index) => (
                            <TableRow key={version.id}>
                              <TableCell>v{selectedPrompt.versions.length - index}</TableCell>
                              <TableCell>{version.modified_by}</TableCell>
                              <TableCell>{formatDate(version.created_at)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRollback(version.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No version history available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <p>Select a prompt to edit</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
