import React, { useRef, useState } from 'react';
import { GroupData } from '../types';
import {
  SavedProjectMeta,
  getRecentProjects,
  loadProjectById,
  deleteProject,
  exportGroupToJson,
  validateAndParseImportedJson,
} from '../utils/storage';
import { formatCurrency } from '../utils/currencies';
import {
  X,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Clock,
  Users,
  Receipt,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGroup: GroupData | null;
  onSelectProject: (group: GroupData) => void;
  onImportSuccess: (group: GroupData) => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  activeGroup,
  onSelectProject,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentProjects, setRecentProjects] = useState<SavedProjectMeta[]>(() =>
    getRecentProjects()
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    setRecentProjects(getRecentProjects());
  };

  const handleOpenProject = (id: string) => {
    const loaded = loadProjectById(id);
    if (loaded) {
      onSelectProject(loaded);
      onClose();
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProject(id);
    refreshList();
  };

  const handleExportActive = () => {
    if (activeGroup) {
      exportGroupToJson(activeGroup);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateAndParseImportedJson(content);
      if (res.success && res.data) {
        setImportError(null);
        setImportSuccessMsg(`Successfully imported "${res.data.name}"!`);
        onImportSuccess(res.data);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setImportError(res.error || 'Failed to parse project JSON file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read selected file.');
    };
    reader.readAsText(file);

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFriendlyTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Saved Projects</h2>
              <p className="text-xs text-neutral-500">Stored privately on this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Import / Export action bar */}
          <div className="grid grid-cols-2 gap-3">
            {/* Export active */}
            <button
              onClick={handleExportActive}
              disabled={!activeGroup}
              className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:border-emerald-500 text-left transition-all disabled:opacity-50 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  JSON Export
                </span>
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">Export Current Group</div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {activeGroup ? activeGroup.name : 'No active group'}
                </div>
              </div>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:border-purple-500 text-left transition-all flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  JSON Import
                </span>
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">Import Project File</div>
                <div className="text-[11px] text-neutral-500">.kekake.json</div>
              </div>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {importError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {/* Recent projects list */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Recent Projects on this Device ({recentProjects.length})
            </span>

            {recentProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                No saved projects found on this device yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {recentProjects.map((project) => {
                  const isActive = activeGroup?.id === project.id;
                  return (
                    <div
                      key={project.id}
                      onClick={() => handleOpenProject(project.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                            {project.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatFriendlyTime(project.updatedAt)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.peopleCount}
                          </span>
                          <span>•</span>
                          <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                            {formatCurrency(project.totalSpent, project.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete from device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
