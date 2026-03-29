import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Clock, GripVertical, Loader2, Calendar as CalendarIcon, User as UserIcon, Trash2 } from 'lucide-react';
import { message, Modal, Form, Input as AntInput, Select, DatePicker, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { cn } from '../../lib/utils';
import groupDetailApi from '../../api/groupDetailApi';

export default function TasksPage({ isDarkMode, groupId, groupData }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // 1. Fetch data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await groupDetailApi.tasks.getAll(groupId);
      // Map backend numeric status to string for UI
      const statusMap = { 0: 'Pending', 1: 'InProgress', 2: 'Done' };
      setTasks(res.data.map(t => ({ ...t, status: statusMap[t.status] || 'Pending' })));
    } catch (err) {
      message.error('無法載入任務');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchTasks();
  }, [groupId]);

  // 2. Handle Create
  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description,
        assignedToUserId: values.assignedToUserId,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null
      };
      await groupDetailApi.tasks.create(groupId, payload);
      message.success('任務已建立');
      setIsModalOpen(false);
      form.resetFields();
      fetchTasks();
    } catch (err) {
      message.error('建立任務失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handle Drag & Drop
  const onDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('taskId', id);
  };

  const onDragOver = (e, status) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('taskId'));
    const statusMap = { 'Pending': 0, 'InProgress': 1, 'Done': 2 };
    
    // Optimistic Update
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
    
    try {
      await groupDetailApi.tasks.updateStatus(groupId, id, statusMap[newStatus]);
      message.success('進度已更新');
    } catch (err) {
      message.error('更新失敗，請稍後再試');
      fetchTasks();
    }
    
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleDelete = async (id) => {
    try {
      await groupDetailApi.tasks.delete(groupId, id);
      message.success('任務已刪除');
      fetchTasks();
    } catch (err) {
      message.error('刪除失敗');
    }
  };

  const columns = [
    { title: '待處理', status: 'Pending', color: 'bg-slate-400' },
    { title: '執行中', status: 'InProgress', color: 'bg-blue-500' },
    { title: '已完成', status: 'Done', color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>群組家務任務</h2>
          <p className="text-sm text-slate-500 font-medium">所有成員的任務進度與分工</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 flex items-center gap-2 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          新增事項
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full min-h-[600px]">
        {loading ? (
          <div className="col-span-3 flex flex-col items-center justify-center h-[400px] opacity-40">
             <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
             <p className="font-bold tracking-widest text-xs uppercase">任務清單同步中...</p>
          </div>
        ) : columns.map(col => {
          const isOver = dragOverCol === col.status;
          return (
            <div 
              key={col.status}
              onDragOver={(e) => onDragOver(e, col.status)}
              onDrop={(e) => onDrop(e, col.status)}
              onDragLeave={() => setDragOverCol(null)}
              className={cn(
                "p-5 rounded-[32px] border-2 transition-all duration-300 flex flex-col",
                {
                  "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[1.02]": isOver,
                  "bg-slate-900/50 border-slate-800": !isOver && isDarkMode,
                  "bg-slate-50/50 border-slate-100": !isOver && !isDarkMode
                }
              )}
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={cn("w-3 h-3 rounded-full shadow-sm", col.color)}></div>
                <h3 className={cn("font-black tracking-tight", { "text-slate-200": isDarkMode, "text-slate-700": !isDarkMode })}>{col.title}</h3>
                <span className={cn(
                  "ml-auto text-[10px] font-black px-2 py-1 rounded-lg",
                  { "bg-slate-800 text-slate-400": isDarkMode, "bg-white text-slate-400 shadow-sm": !isDarkMode }
                )}>
                  {tasks.filter(t => t.status === col.status).length}
                </span>
              </div>

              <div className="space-y-4 flex-1">
                {tasks.filter(t => t.status === col.status).map(t => (
                  <TaskCard 
                    key={t.id} 
                    task={t} 
                    isDarkMode={isDarkMode} 
                    onDragStart={(e) => onDragStart(e, t.id)}
                    isDragging={draggedId === t.id}
                    onDelete={() => handleDelete(t.id)}
                    opacity={col.status === 'Done' ? 'opacity-60 grayscale-[0.5]' : ''}
                  />
                ))}
                
                {isOver && (
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-3xl h-24 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 新增任務彈窗 */}
      <Modal
        title={<span className="text-xl font-black">建立新任務</span>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-6">
          <Form.Item
            name="title"
            label={<span className="font-bold">任務名稱</span>}
            rules={[{ required: true, message: '請輸入任務名稱' }]}
          >
            <AntInput placeholder="例如：洗衣服、繳電費" className="h-12 rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label={<span className="font-bold">備註說明</span>}>
            <AntInput.TextArea placeholder="詳細說明..." className="rounded-xl" rows={3} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="assignedToUserId" label={<span className="font-bold text-xs uppercase tracking-widest text-slate-400">指派給</span>}>
              <Select placeholder="選擇成員" className="w-full h-12">
                {groupData?.members?.map(m => (
                  <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="dueDate" label={<span className="font-bold text-xs uppercase tracking-widest text-slate-400">截止日期</span>}>
              <DatePicker className="w-full h-12 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-8">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckSquare size={20} />}
              立即指派事項
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function TaskCard({ task, isDarkMode, onDragStart, isDragging, onDelete, opacity = '' }) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      className={cn(
        "group p-5 rounded-3xl border shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-blue-400/50",
        {
          "opacity-20 scale-95": isDragging,
          "opacity-100": !isDragging,
          "bg-slate-800 border-slate-700": isDarkMode,
          "bg-white border-slate-100": !isDarkMode
        },
        opacity
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className={cn("font-bold text-sm leading-snug", { "text-white": isDarkMode, "text-slate-800": !isDarkMode })}>{task.title}</h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Popconfirm title="刪除此任務？" onConfirm={onDelete} okText="刪" cancelText="否">
             <button className="p-1 hover:text-red-500 text-slate-400 transition-colors"><Trash2 size={14} /></button>
           </Popconfirm>
           <GripVertical size={16} className="text-slate-300 dark:text-slate-600" />
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-sm",
                { "bg-slate-700 text-slate-300": isDarkMode, "bg-blue-500 text-white": !isDarkMode }
              )}>
                {task.assignedTo[0]}
              </div>
              <span className={cn("text-[11px] font-bold", { "text-slate-400": isDarkMode, "text-slate-500": !isDarkMode })}>{task.assignedTo}</span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 italic">未指派</span>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black",
          { "bg-slate-700/50 text-slate-500": isDarkMode, "bg-slate-100 text-slate-400": !isDarkMode }
        )}>
          <Clock size={12} strokeWidth={3} />
          {task.dueDate ? dayjs(task.dueDate).format('MM/DD') : '無期限'}
        </div>
      </div>
    </div>
  );
}
