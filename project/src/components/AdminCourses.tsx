import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { coursesApi, uploadsApi } from '../services/apiService';
import { Plus, Trash2, Save, Upload, Eye, CheckCircle, XCircle, FileText, Award } from 'lucide-react';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const AdminCourses: React.FC = () => {
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: 0,
    thumbnail: '',
    tags: '',
    isPublished: false,
    instructorName: '',
    videos: [] as Array<{ title: string; url: string; duration: number; thumbnail: string; }>,
    assessmentMode: 'handmade' as 'handmade' | 'auto',
    assessments: [] as Array<{
      title: string;
      description: string;
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
      passingScore: number;
    }>,

  });

  const token = useMemo(() => localStorage.getItem('authToken') || '', []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await coursesApi.list();
        setCourses(list || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">Access denied. Admin or Instructor required.</div>
      </div>
    );
  }

  // Basic handler for Edit button
  function handleEditCourse(course: any) {
    setEditingCourse(course);
    setEditForm({ ...course });
  }

  function handleEditFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setEditForm((prev: any) => ({ ...prev, [name]: val }));
  }

  async function handleEditFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    try {
      const updated = await coursesApi.update(editingCourse._id, editForm, token);
      setCourses(courses.map((c) => c._id === updated._id ? updated : c));
      setEditingCourse(null);
      alert('Course updated');
    } catch (err) {
      alert('Failed to update course');
    } finally {
      setEditLoading(false);
    }
  }

  function handleEditModalClose() {
    setEditingCourse(null);
  }

  // Basic handler for Delete button
  async function handleDeleteCourse(courseId: string) {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      setLoading(true);
      await coursesApi.delete(courseId, token);
      setCourses(courses.filter(c => c._id !== courseId));
      alert('Course deleted');
    } catch (err) {
      alert('Failed to delete course');
    } finally {
      setLoading(false);
    }
  }

  const addVideo = () => {
    setForm({
      ...form,
      videos: [...form.videos, { title: '', url: '', duration: 0, thumbnail: '' }]
    });
  };

  const removeVideo = (idx: number) => {
    setForm({ ...form, videos: form.videos.filter((_: any, i: number) => i !== idx) });
  };

  const moveVideo = (idx: number, dir: -1 | 1) => {
    const arr = [...form.videos];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[idx]; arr[idx] = arr[j]; arr[j] = tmp;
    setForm({ ...form, videos: arr });
  };

  // Assessment management functions
  const addAssessment = () => {
    setForm({
      ...form,
      assessments: [...form.assessments, {
        title: '',
        description: '',
        questions: [],
        passingScore: 70
      }]
    });
  };

  const removeAssessment = (idx: number) => {
    setForm({ ...form, assessments: form.assessments.filter((_: any, i: number) => i !== idx) });
  };

  const addQuestion = (assessmentIdx: number) => {
    const newAssessments = [...form.assessments];
    newAssessments[assessmentIdx].questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setForm({ ...form, assessments: newAssessments });
  };

  const removeQuestion = (assessmentIdx: number, questionIdx: number) => {
    const newAssessments = [...form.assessments];
    newAssessments[assessmentIdx].questions.splice(questionIdx, 1);
    setForm({ ...form, assessments: newAssessments });
  };

  const updateQuestion = (assessmentIdx: number, questionIdx: number, field: string, value: any) => {
    const newAssessments = [...form.assessments];
    newAssessments[assessmentIdx].questions[questionIdx][field] = value;
    setForm({ ...form, assessments: newAssessments });
  };

  const updateAssessment = (idx: number, field: string, value: any) => {
    const newAssessments = [...form.assessments];
    newAssessments[idx][field] = value;
    setForm({ ...form, assessments: newAssessments });
  };

  const createCourse = async () => {
    if (!form.title || !form.description || !form.category) {
      alert('Please fill in title, description, and category');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level.toLowerCase(),
        price: form.price || 0,
        duration: Math.max(1, form.videos.reduce((s: number, v: any) => s + (Number(v.duration) || 0), 0)),
        thumbnail: form.thumbnail,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        isPublished: !!form.isPublished,
        instructorName: form.instructorName,
        videos: form.videos.map((v: any, i: number) => ({
          title: v.title,
          description: v.title,
          url: v.url,
          duration: Number(v.duration) || 0,
          thumbnail: v.thumbnail,
          order: i + 1
        })),
        assessmentMode: form.assessmentMode,

        assessments: form.assessmentMode === 'handmade' ? form.assessments.map((assessment: any) => ({
          title: assessment.title,
          description: assessment.description,
          questions: assessment.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          })),
          passingScore: assessment.passingScore
        })) : []
      };
      
      console.log('Creating course with payload:', payload);
      const created = await coursesApi.create(payload, token);
      setCourses([created, ...courses]);
      setForm({ 
        title: '', 
        description: '', 
        category: '', 
        level: 'Beginner', 
        price: 0,
        thumbnail: '', 
        tags: '', 
        isPublished: false, 
        instructorName: '', 
        videos: [],
        assessmentMode: 'handmade',
        assessments: [],

      });
      alert('Course created successfully!');
    } catch (e) {
      console.error('Course creation error:', e);
      let errorMessage = 'Failed to create course';
      
      if (e.message) {
        errorMessage = e.message;
      } else if (e.errors && Array.isArray(e.errors)) {
        errorMessage = e.errors.join(', ');
      }
      
      alert(`Error: ${errorMessage}`);
    } finally { setLoading(false); }
  };

  const togglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      const updated = await coursesApi.publish(courseId, !isPublished, token);
      setCourses(courses.map(c => c._id === courseId ? updated : c));
    } catch (e) { alert('Failed to update publish state'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin: Manage Courses</h1>

      {/* Create Course */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Enter course title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Enter category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select className="w-full border rounded px-3 py-2" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
              {levels.map(l=> <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input 
              type="number" 
              className="w-full border rounded px-3 py-2" 
              placeholder="Enter price (0 for free)" 
              value={form.price} 
              min="0"
              onChange={e=>setForm({...form,price:Number(e.target.value)})} 
            />
            <p className="text-xs text-gray-500 mt-1">Enter 0 to make the course free</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Enter thumbnail URL" value={form.thumbnail} onChange={e=>setForm({...form,thumbnail:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Enter instructor name" value={form.instructorName} onChange={e=>setForm({...form,instructorName:e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Enter tags (comma separated)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
          </div>



          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Enter course description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          </div>
        </div>

        {/* Videos */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Videos</h3>
            <button onClick={addVideo} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2"><Plus className="w-4 h-4"/>Add Video</button>
          </div>
          {form.videos.length === 0 && <div className="text-sm text-gray-500">No videos yet.</div>}
          <div className="space-y-3">
            {form.videos.map((v: any, idx: number) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 border rounded p-3">
                <input className="md:col-span-3 border rounded px-2 py-1" placeholder="Title" value={v.title} onChange={e=>{const arr=[...form.videos];arr[idx].title=e.target.value;setForm({...form,videos:arr});}} />
                <input className="md:col-span-5 border rounded px-2 py-1" placeholder="Video URL (MP4)" value={v.url} onChange={e=>{const arr=[...form.videos];arr[idx].url=e.target.value;setForm({...form,videos:arr});}} />
                <input type="number" className="md:col-span-2 border rounded px-2 py-1" placeholder="Duration (sec)" value={v.duration} onChange={e=>{const arr=[...form.videos];arr[idx].duration=Number(e.target.value);setForm({...form,videos:arr});}} />
                <input className="md:col-span-2 border rounded px-2 py-1" placeholder="Thumb URL" value={v.thumbnail} onChange={e=>{const arr=[...form.videos];arr[idx].thumbnail=e.target.value;setForm({...form,videos:arr});}} />
                <div className="md:col-span-12 flex gap-2 justify-between items-center">
                  <input type="file" accept="video/*" onChange={async (e)=>{
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await uploadsApi.uploadVideo(file, token);
                      const arr = [...form.videos];
                      arr[idx].url = res.url;
                      setForm({ ...form, videos: arr });
                      alert('Uploaded. URL set on this video.');
                    } catch {
                      alert('Upload failed');
                    }
                  }} />
                  <button onClick={()=>moveVideo(idx,-1)} className="px-2 py-1 border rounded">↑</button>
                  <button onClick={()=>moveVideo(idx,1)} className="px-2 py-1 border rounded">↓</button>
                  <button onClick={()=>removeVideo(idx)} className="px-2 py-1 border rounded text-red-600"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Assessments
            </h3>
            <button onClick={addAssessment} className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2">
              <Plus className="w-4 h-4"/>
              Add Assessment
            </button>
          </div>
          <div className="mb-4">
            <label className="mr-4 text-sm font-medium">Assessment Mode</label>
            <label className="mr-3 text-sm"><input type="radio" checked={form.assessmentMode==='handmade'} onChange={()=>setForm({...form, assessmentMode:'handmade'})}/> Handmade</label>
            <label className="text-sm"><input type="radio" checked={form.assessmentMode==='auto'} onChange={()=>setForm({...form, assessmentMode:'auto'})}/> Auto-generate</label>
            {form.assessmentMode==='auto' && (
              <div className="text-xs text-gray-600 mt-2">Questions will be generated automatically from course title, description, videos and tags.</div>
            )}
          </div>
          {form.assessmentMode==='handmade' && form.assessments.length === 0 && <div className="text-sm text-gray-500">No assessments yet.</div>}
          {form.assessmentMode==='handmade' && (
          <div className="space-y-4">
            {form.assessments.map((assessment: any, assessmentIdx: number) => (
              <div key={assessmentIdx} className="border rounded p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Assessment {assessmentIdx + 1}</h4>
                  <button onClick={() => removeAssessment(assessmentIdx)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <input 
                    className="border rounded px-3 py-2" 
                    placeholder="Assessment Title" 
                    value={assessment.title} 
                    onChange={(e) => updateAssessment(assessmentIdx, 'title', e.target.value)} 
                  />
                  <input 
                    type="number" 
                    className="border rounded px-3 py-2" 
                    placeholder="Passing Score (%)" 
                    value={assessment.passingScore} 
                    onChange={(e) => updateAssessment(assessmentIdx, 'passingScore', Number(e.target.value))} 
                  />
                  <textarea 
                    className="md:col-span-2 border rounded px-3 py-2" 
                    placeholder="Assessment Description" 
                    value={assessment.description} 
                    onChange={(e) => updateAssessment(assessmentIdx, 'description', e.target.value)} 
                  />
                </div>

                {/* Questions */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">Questions</h5>
                    <button 
                      onClick={() => addQuestion(assessmentIdx)} 
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Add Question
                    </button>
                  </div>
                  
                  {assessment.questions.map((question: any, questionIdx: number) => (
                    <div key={questionIdx} className="border rounded p-3 mb-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Question {questionIdx + 1}</span>
                        <button 
                          onClick={() => removeQuestion(assessmentIdx, questionIdx)} 
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <textarea 
                        className="w-full border rounded px-3 py-2 mb-3" 
                        placeholder="Question text" 
                        value={question.question} 
                        onChange={(e) => updateQuestion(assessmentIdx, questionIdx, 'question', e.target.value)} 
                      />
                      
                      <div className="space-y-2 mb-3">
                        {question.options.map((option: string, optionIdx: number) => (
                          <div key={optionIdx} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name={`correct-${assessmentIdx}-${questionIdx}`}
                              checked={question.correctAnswer === optionIdx}
                              onChange={() => updateQuestion(assessmentIdx, questionIdx, 'correctAnswer', optionIdx)}
                            />
                            <input 
                              className="flex-1 border rounded px-2 py-1" 
                              placeholder={`Option ${optionIdx + 1}`} 
                              value={option} 
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIdx] = e.target.value;
                                updateQuestion(assessmentIdx, questionIdx, 'options', newOptions);
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                      
                      <textarea 
                        className="w-full border rounded px-3 py-2" 
                        placeholder="Explanation for correct answer (optional)" 
                        value={question.explanation} 
                        onChange={(e) => updateQuestion(assessmentIdx, questionIdx, 'explanation', e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})} /> Publish immediately</label>
          <button disabled={loading} onClick={createCourse} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4"/>Create Course</button>
        </div>
      </div>

      {/* Existing courses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Courses</h2>
        {loading && <div className="text-sm text-gray-500">Loading…</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c:any)=> (
            <div key={c._id} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{c.title}</div>
                <div className="flex gap-2">
                  <button onClick={()=>togglePublish(c._id, c.isPublished)} className={`px-3 py-1 rounded text-white ${c.isPublished?'bg-red-600':'bg-blue-600'}`}>
                    {c.isPublished? 'Unpublish':'Publish'}
                  </button>
                  <button onClick={()=>handleEditCourse(c)} className="px-3 py-1 rounded text-white bg-yellow-500 hover:bg-yellow-600">Edit</button>
                  <button onClick={()=>handleDeleteCourse(c._id)} className="px-3 py-1 rounded text-white bg-red-700 hover:bg-red-800">Delete</button>
                </div>
              </div>
              <div className="text-sm text-gray-600">{c.category} • {c.level}</div>
              <div className="text-sm mt-2 flex items-center gap-4">
                <span>Videos: {c.videos?.length||0}</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Assessments: {c.assessments?.length||0}
                </span>
                <span className="font-semibold text-green-600">
                  {c.price === 0 ? 'Free' : `₹${c.price}`}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {c.isPublished ? (<span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/>Published</span>):(<span className="text-gray-600 flex items-center gap-1"><XCircle className="w-4 h-4"/>Draft</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Course Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-4xl relative overflow-y-auto max-h-[90vh]">
              <button onClick={handleEditModalClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
              <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
              <form onSubmit={handleEditFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input name="title" value={editForm.title || ''} onChange={handleEditFormChange} className="w-full border rounded px-2 py-1" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea name="description" value={editForm.description || ''} onChange={handleEditFormChange} className="w-full border rounded px-2 py-1" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input name="category" value={editForm.category || ''} onChange={handleEditFormChange} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Level</label>
                  <select name="level" value={editForm.level || ''} onChange={handleEditFormChange} className="w-full border rounded px-2 py-1">
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Price (₹0 for free)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={editForm.price || 0} 
                    onChange={handleEditFormChange} 
                    className="w-full border rounded px-2 py-1" 
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Thumbnail URL</label>
                  <input name="thumbnail" value={editForm.thumbnail || ''} onChange={handleEditFormChange} className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tags (comma separated)</label>
                  <input name="tags" value={editForm.tags || ''} onChange={handleEditFormChange} className="w-full border rounded px-2 py-1" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isPublished" checked={!!editForm.isPublished} onChange={e => setEditForm((prev: any) => ({ ...prev, isPublished: e.target.checked }))} />
                  <label className="text-sm">Published</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Videos</label>
                  {(editForm.videos || []).map((v: any, idx: number) => (
                    <div key={idx} className="border rounded p-2 mb-2 flex flex-col gap-2">
                      <input name={`video-title-${idx}`} value={v.title || ''} onChange={e => {
                        const arr = [...editForm.videos];
                        arr[idx].title = e.target.value;
                        setEditForm((prev: any) => ({ ...prev, videos: arr }));
                      }} className="border rounded px-2 py-1 mb-1" placeholder="Video Title" />
                      <input name={`video-url-${idx}`} value={v.url || ''} onChange={e => {
                        const arr = [...editForm.videos];
                        arr[idx].url = e.target.value;
                        setEditForm((prev: any) => ({ ...prev, videos: arr }));
                      }} className="border rounded px-2 py-1 mb-1" placeholder="Video URL" />
                      <input name={`video-duration-${idx}`} type="number" value={v.duration || 0} onChange={e => {
                        const arr = [...editForm.videos];
                        arr[idx].duration = Number(e.target.value);
                        setEditForm((prev: any) => ({ ...prev, videos: arr }));
                      }} className="border rounded px-2 py-1 mb-1" placeholder="Duration (seconds)" />
                      <input name={`video-thumbnail-${idx}`} value={v.thumbnail || ''} onChange={e => {
                        const arr = [...editForm.videos];
                        arr[idx].thumbnail = e.target.value;
                        setEditForm((prev: any) => ({ ...prev, videos: arr }));
                      }} className="border rounded px-2 py-1 mb-1" placeholder="Thumbnail URL" />
                      <button type="button" onClick={() => {
                        setEditForm((prev: any) => ({ ...prev, videos: prev.videos.filter((_: any, i: number) => i !== idx) }));
                      }} className="text-xs text-red-600 hover:underline self-end">Remove Video</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditForm((prev: any) => ({ ...prev, videos: [...(prev.videos || []), { title: '', url: '', duration: 0, thumbnail: '' }] }))} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Add Video</button>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={handleEditModalClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  <button type="submit" disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{editLoading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;


