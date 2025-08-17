import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const categories = ['skill_development', 'education', 'networking', 'job_search', 'portfolio', 'certification'];
const statuses = ['not_started', 'in_progress', 'completed', 'skipped'];

const toISO = (d) => (d ? new Date(d).toISOString() : null);
const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const RoadmapManager = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'skill_development',
    priority: 1,
    estimated_time_hours: '',
    due_date: '',
    resources: '' // newline separated
  });

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const data = await api.get('/api/roadmap/');
      // Sort by order_index to maintain order
      const sortedData = Array.isArray(data) ? data.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : [];
      setItems(sortedData);
    } catch (e) {
      const msg = e?.message || 'Failed to load roadmap';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addItem = async () => {
    if (!form.title || !form.description) return;
    setSaving(true); setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: Number(form.priority) || 1,
        estimated_time_hours: form.estimated_time_hours ? Number(form.estimated_time_hours) : null,
        due_date: form.due_date ? toISO(form.due_date) : null,
        resources: form.resources ? form.resources.split('\n').map((s) => s.trim()).filter(Boolean) : []
      };
      await api.post('/api/roadmap/', payload);
      showToast('Roadmap item added', 'success');
      setForm({ title: '', description: '', category: 'skill_development', priority: 1, estimated_time_hours: '', due_date: '', resources: '' });
      await load();
    } catch (e) {
      const msg = e?.message || 'Failed to add item';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (id, changes) => {
    try {
      await api.put(`/api/roadmap/${id}`, changes);
      showToast('Roadmap item updated', 'success');
      await load();
    } catch (e) {
      const msg = e?.message || 'Failed to update item';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const markComplete = async (id) => {
    try {
      await api.post(`/api/roadmap/${id}/complete`);
      showToast('Marked as complete', 'success');
      await load();
    } catch (e) {
      const msg = e?.message || 'Failed to complete item';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.del(`/api/roadmap/${id}`);
      showToast('Roadmap item deleted', 'success');
      await load();
    } catch (e) {
      const msg = e?.message || 'Failed to delete item';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const reorderItems = async (newOrder) => {
    try {
      const reorderData = newOrder.map((item, index) => ({
        item_id: item.id,
        order_index: index
      }));
      
      await api.post('/api/roadmap/reorder', reorderData);
      showToast('Roadmap reordered successfully', 'success');
      setItems(newOrder);
    } catch (e) {
      const msg = e?.message || 'Failed to reorder items';
      setError(msg);
      showToast(msg, 'error');
      // Reload to restore original order on error
      await load();
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;
    
    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    
    // Remove the dragged item
    newItems.splice(dragIndex, 1);
    
    // Insert it at the new position
    newItems.splice(dropIndex, 0, draggedItem);
    
    // Update the order
    reorderItems(newItems);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Roadmap (Dev)</h2>
            <p className="text-blue-100">Manage your roadmap items. Generate from assessment will be added later.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">{error}</div>}

          {/* Add form */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Priority (1-5)</label>
              <input type="number" min={1} max={5} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Estimated hours</label>
              <input type="number" value={form.estimated_time_hours} onChange={(e) => setForm({ ...form, estimated_time_hours: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Due date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-gray-600 mb-1 block">Resources (one per line)</label>
              <textarea value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" rows={2} />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={addItem} disabled={saving || !form.title || !form.description}>{saving ? 'Adding…' : 'Add Item'}</button>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-3">
              {items.length === 0 && <div className="text-gray-500">No roadmap items yet.</div>}
              {items.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                    Drag items to reorder your roadmap
                  </p>
                </div>
              )}
              {items.map((it, index) => (
                <RoadmapRow 
                  key={it.id} 
                  item={it} 
                  index={index}
                  onUpdate={updateItem} 
                  onComplete={markComplete} 
                  onDelete={deleteItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RoadmapRow = ({ item, index, onUpdate, onComplete, onDelete, onDragStart, onDragEnd, onDragOver, onDrop }) => {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    status: item.status,
    notes: item.notes || ''
  });

  const save = async () => {
    await onUpdate(item.id, form);
    setEdit(false);
  };

  return (
    <div 
      className="border border-gray-200 rounded-xl p-4 cursor-move hover:shadow-md transition-all duration-200"
      draggable={!edit}
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      {!edit ? (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex flex-col items-center text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                </svg>
                <span className="text-xs">{index + 1}</span>
              </div>
              <div>
                <div className="font-medium text-dark-blue">{item.title} <span className="text-xs px-2 py-1 rounded-full bg-soft-green/10 text-soft-green align-middle">{item.category}</span></div>
                <div className="text-sm text-gray-600">Priority {item.priority} • {item.estimated_time_hours ? `${item.estimated_time_hours}h` : '—'} • Status: {item.status}</div>
              </div>
            </div>
            {item.due_date && <div className="text-xs text-gray-500 ml-7">Due {toInput(item.due_date)}</div>}
            {item.resources && item.resources.length > 0 && (
              <div className="text-xs text-gray-600 ml-7">Resources: {item.resources.join(', ')}</div>
            )}
            {item.notes && <div className="text-sm text-gray-700 ml-7">Notes: {item.notes}</div>}
          </div>
          <div className="flex gap-3 ml-4">
            {item.status !== 'completed' && (
              <button className="text-green-600 hover:underline" onClick={() => onComplete(item.id)}>Mark Complete</button>
            )}
            <button className="text-blue-600 hover:underline" onClick={() => setEdit(true)}>Edit</button>
            <button className="text-red-600 hover:underline" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200">
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
          </div>
          <div className="flex gap-3 justify-end md:col-span-3">
            <button className="btn-secondary" onClick={() => setEdit(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapManager;