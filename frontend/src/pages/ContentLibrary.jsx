import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  FolderOpen, FileText, Upload, Download, Search, Plus, MoreVertical,
  File, FileSpreadsheet, Presentation, Image, Video, Link as LinkIcon,
  Trash2, Eye, Edit, Clock, User, Tag, ChevronRight, Home
} from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_TYPES = [
  { value: 'SOP', label: 'SOP Documents', icon: FileText, color: 'blue' },
  { value: 'OnePager', label: 'One-pagers', icon: File, color: 'green' },
  { value: 'Training', label: 'Training Material', icon: Presentation, color: 'purple' },
  { value: 'Internal', label: 'Internal Docs', icon: FileText, color: 'orange' },
  { value: 'External', label: 'External Links', icon: LinkIcon, color: 'cyan' }
];

const FILE_ICONS = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  ppt: Presentation,
  pptx: Presentation,
  png: Image,
  jpg: Image,
  jpeg: Image,
  mp4: Video,
  default: File
};

export default function ContentLibrary() {
  const [contents, setContents] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    content_type: 'SOP',
    description: '',
    tags: '',
    url: '',
    file: null
  });
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    loadContent();
  }, [currentFolder]);

  const loadContent = async () => {
    try {
      const response = await axios.get(`${API}/content-library`, {
        params: { folder_id: currentFolder }
      });
      setContents(response.data.contents || []);
      setFolders(response.data.folders || []);
    } catch (error) {
      // Initialize with sample data if API not ready
      setContents([
        { id: '1', title: 'CSM Onboarding SOP', content_type: 'SOP', description: 'Standard onboarding process', tags: ['onboarding', 'sop'], created_at: new Date().toISOString(), created_by: 'Admin', file_type: 'pdf', url: '#' },
        { id: '2', title: 'Product Overview', content_type: 'OnePager', description: 'Quick product summary', tags: ['product', 'sales'], created_at: new Date().toISOString(), created_by: 'Admin', file_type: 'pptx', url: '#' },
        { id: '3', title: 'QBR Template', content_type: 'Training', description: 'Quarterly business review template', tags: ['qbr', 'template'], created_at: new Date().toISOString(), created_by: 'Admin', file_type: 'pptx', url: '#' },
        { id: '4', title: 'Internal Wiki', content_type: 'External', description: 'Link to internal wiki', tags: ['wiki', 'internal'], created_at: new Date().toISOString(), created_by: 'Admin', file_type: 'link', url: 'https://wiki.example.com' },
        { id: '5', title: 'Customer Health Playbook', content_type: 'Internal', description: 'Guidelines for managing customer health', tags: ['health', 'playbook'], created_at: new Date().toISOString(), created_by: 'Admin', file_type: 'docx', url: '#' }
      ]);
      setFolders([
        { id: 'f1', name: 'SOPs', items_count: 12 },
        { id: 'f2', name: 'Training Materials', items_count: 8 },
        { id: 'f3', name: 'Templates', items_count: 15 },
        { id: 'f4', name: 'Product Resources', items_count: 6 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...uploadForm,
        tags: uploadForm.tags.split(',').map(t => t.trim()).filter(t => t),
        folder_id: currentFolder
      };
      await axios.post(`${API}/content-library`, payload);
      toast.success('Content uploaded successfully');
      setShowUploadForm(false);
      setUploadForm({ title: '', content_type: 'SOP', description: '', tags: '', url: '', file: null });
      loadContent();
    } catch (error) {
      toast.error('Failed to upload content');
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/content-library/folders`, {
        name: folderName,
        parent_id: currentFolder
      });
      toast.success('Folder created successfully');
      setShowFolderForm(false);
      setFolderName('');
      loadContent();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const navigateToFolder = (folder) => {
    if (folder) {
      setBreadcrumb([...breadcrumb, { id: currentFolder, name: breadcrumb.length === 0 ? 'Home' : folders.find(f => f.id === currentFolder)?.name }]);
      setCurrentFolder(folder.id);
    }
  };

  const navigateBack = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index);
    setBreadcrumb(newBreadcrumb);
    setCurrentFolder(index === 0 ? null : breadcrumb[index - 1]?.id);
  };

  const getFileIcon = (fileType) => {
    const Icon = FILE_ICONS[fileType?.toLowerCase()] || FILE_ICONS.default;
    return Icon;
  };

  const filteredContents = contents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || c.content_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="spinner"></div></div>;
  }

  return (
    <div className="px-6 py-8 space-y-6" data-testid="content-library-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FolderOpen size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Content Library</h1>
            <p className="text-slate-600">Centralized knowledge repository</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFolderForm(true)}>
            <Plus size={16} className="mr-2" />
            New Folder
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowUploadForm(true)}>
            <Upload size={16} className="mr-2" />
            Upload Content
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={() => { setCurrentFolder(null); setBreadcrumb([]); }}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Home size={16} className="mr-1" />
          Home
        </button>
        {breadcrumb.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight size={16} className="text-slate-400 mx-1" />
            <button
              onClick={() => navigateBack(index + 1)}
              className="text-blue-600 hover:text-blue-700"
            >
              {item.name}
            </button>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="px-3 py-2 border border-slate-300 rounded-md"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            {CONTENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Content Type Quick Filters */}
      <div className="flex items-center space-x-3">
        {CONTENT_TYPES.map(type => {
          const Icon = type.icon;
          const count = contents.filter(c => c.content_type === type.value).length;
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(selectedType === type.value ? 'all' : type.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                selectedType === type.value
                  ? `bg-${type.color}-50 border-${type.color}-300 text-${type.color}-700`
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon size={16} />
              <span className="text-sm">{type.label}</span>
              <Badge variant="outline" className="text-xs">{count}</Badge>
            </button>
          );
        })}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-slate-700">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map(folder => (
              <Card
                key={folder.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigateToFolder(folder)}
              >
                <div className="flex items-center space-x-3">
                  <FolderOpen size={32} className="text-yellow-500" />
                  <div>
                    <p className="font-medium text-slate-800">{folder.name}</p>
                    <p className="text-xs text-slate-500">{folder.items_count} items</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-3">
        <h3 className="font-medium text-slate-700">Files ({filteredContents.length})</h3>
        {filteredContents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No content found</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredContents.map(content => {
              const FileIcon = getFileIcon(content.file_type);
              const typeConfig = CONTENT_TYPES.find(t => t.value === content.content_type);
              
              return (
                <Card key={content.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg bg-${typeConfig?.color || 'slate'}-100 flex items-center justify-center`}>
                        <FileIcon size={24} className={`text-${typeConfig?.color || 'slate'}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">{content.title}</h4>
                        <p className="text-sm text-slate-500">{content.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400">
                          <span className="flex items-center"><User size={12} className="mr-1" />{content.created_by}</span>
                          <span className="flex items-center"><Clock size={12} className="mr-1" />{new Date(content.created_at).toLocaleDateString('en-IN')}</span>
                          {content.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag size={10} className="mr-1" />{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`bg-${typeConfig?.color || 'slate'}-100 text-${typeConfig?.color || 'slate'}-700`}>
                        {content.content_type}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => setPreviewContent(content)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <Dialog open={true} onOpenChange={setShowUploadForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Content</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Content title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Content Type *</Label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={uploadForm.content_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, content_type: e.target.value })}
                >
                  {CONTENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-md min-h-[80px]"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="e.g., onboarding, sop, training"
                />
              </div>

              <div className="space-y-2">
                <Label>File or URL *</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                  <input type="file" className="hidden" id="content-file" />
                  <label htmlFor="content-file" className="cursor-pointer">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Click to upload file</p>
                  </label>
                </div>
                <div className="text-center text-sm text-slate-500 my-2">OR</div>
                <Input
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Upload
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Folder Form Modal */}
      {showFolderForm && (
        <Dialog open={true} onOpenChange={setShowFolderForm}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label>Folder Name *</Label>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowFolderForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Modal */}
      {previewContent && (
        <Dialog open={true} onOpenChange={() => setPreviewContent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewContent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">{previewContent.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                  <span>Type: {previewContent.content_type}</span>
                  <span>Created: {new Date(previewContent.created_at).toLocaleDateString('en-IN')}</span>
                  <span>By: {previewContent.created_by}</span>
                </div>
              </div>
              
              {previewContent.file_type === 'link' ? (
                <div className="text-center py-8">
                  <LinkIcon size={48} className="mx-auto mb-4 text-blue-500" />
                  <a href={previewContent.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Open External Link
                  </a>
                </div>
              ) : previewContent.url?.endsWith('.pdf') ? (
                <iframe src={previewContent.url} className="w-full h-[500px] border rounded" title="Preview" />
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 mb-4">Preview not available</p>
                  <Button>
                    <Download size={16} className="mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
