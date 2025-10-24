import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function Tasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [expandedTask, setExpandedTask] = useState(null);
  const [newSubTopic, setNewSubTopic] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [subtopicNotes, setSubtopicNotes] = useState({});
  const [editingSubTopic, setEditingSubTopic] = useState(null);
  const [editingSubTopicTitle, setEditingSubTopicTitle] = useState(null);
  const [subtopicTitleEdit, setSubtopicTitleEdit] = useState("");
  const backend = "http://localhost:5194/api";

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    console.log("User ID:", userId, "Type:", typeof userId);
    if (!userId) {
      console.log("No userId found, redirecting to login");
      router.push("/login");
      return;
    }
    console.log("Calling fetchTasks with userId:", userId);
    
    const loadData = async () => {
      await fetchTasks();
      // Add a small delay between API calls
      setTimeout(() => {
        fetchTimeline();
      }, 500);
    };
    
    loadData();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log("Fetching tasks for userId:", userId);
      if (!userId || userId === 'null' || userId === 'undefined') {
        console.error("Invalid userId:", userId);
        setError("Please login again");
        router.push("/login");
        return;
      }
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        console.error("userId is not a number:", userId);
        setError("Invalid user ID");
        return;
      }
      const res = await axios.get(`${backend}/tasks/${userIdInt}`);
      
      // Ensure subtopics and learningSessions are arrays
      const tasksWithArrays = res.data.map(task => ({
        ...task,
        subTopics: task.subTopics || [],
        learningSessions: task.learningSessions || []
      }));
      
      setTasks(tasksWithArrays);
      setError("");
    } catch (error) {
      console.error("Error fetching tasks:", error);
      console.error("Error details:", error.response?.data);
      setError(`Failed to load tasks: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      if (!userId || userId === 'null' || userId === 'undefined') return;
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) return;
      
      console.log("Fetching timeline for userId:", userIdInt);
      const res = await axios.get(`${backend}/tasks/${userIdInt}/timeline`);
      console.log("Timeline response:", res.data);
      setTimeline(res.data);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      console.error("Error details:", error.response?.data);
      setError(`Failed to load timeline: ${error.response?.data || error.message}`);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${backend}/tasks`, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority,
        isCompleted: false,
        userId: parseInt(userId),
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority(1);
      fetchTasks();
    } catch (error) {
      setError("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${backend}/tasks/${task.id}`, {
        ...task,
        isCompleted: !task.isCompleted,
      });
      fetchTasks();
    } catch (error) {
      setError("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${backend}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      setError("Failed to delete task. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  // SubTopic functions
  const addSubTopic = async (taskId) => {
    if (!newSubTopic.trim()) {
      setError("Please enter what you want to study in this subtopic.");
      return;
    }
    try {
      const subtopicData = {
        title: newSubTopic.trim(),
        description: newSubTopic.trim(),
        isCompleted: false,
        order: tasks.find(t => t.id === taskId)?.subTopics?.length || 0
      };
      
      const response = await axios.post(`${backend}/tasks/${taskId}/subtopics`, subtopicData);
      setNewSubTopic("");
      setError("");
      
      // Add a small delay to ensure backend has processed the data
      setTimeout(() => {
        fetchTasks();
      }, 1000);
    } catch (error) {
      console.error("Error creating subtopic:", error);
      setError("Failed to add subtopic. Please try again.");
    }
  };

  const toggleSubTopicComplete = async (subtopic) => {
    try {
      console.log("Toggling completion for subtopic:", subtopic.id);
      console.log("Current subtopic data:", subtopic);
      
      await axios.put(`${backend}/tasks/subtopics/${subtopic.id}`, {
        title: subtopic.title || "", // Preserve title
        description: subtopic.description || "", // Preserve description
        notes: subtopic.notes || "", // Preserve notes
        isCompleted: !subtopic.isCompleted, // Toggle completion
        order: subtopic.order || 0 // Preserve order
      });
      
      console.log("Completion status updated successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error toggling completion:", error);
      setError("Failed to update subtopic. Please try again.");
    }
  };

  const deleteSubTopic = async (id) => {
    if (!confirm("Are you sure you want to delete this subtopic?")) return;
    try {
      await axios.delete(`${backend}/tasks/subtopics/${id}`);
      fetchTasks();
    } catch (error) {
      setError("Failed to delete subtopic. Please try again.");
    }
  };

  const updateSubTopicNotes = async (subtopicId, notes) => {
    try {
      // Find the current subtopic to preserve its title
      const currentSubTopic = tasks
        .flatMap(task => task.subTopics || [])
        .find(subtopic => subtopic.id === subtopicId);
      
      await axios.put(`${backend}/tasks/subtopics/${subtopicId}`, {
        title: currentSubTopic?.title || "",
        description: notes,
        notes: "",
        isCompleted: currentSubTopic?.isCompleted || false,
        order: currentSubTopic?.order || 0
      });
      
      setTimeout(() => {
        fetchTasks();
      }, 1000);
      setEditingSubTopic(null);
      // Don't reset title editing state when saving notes
    } catch (error) {
      console.error("Error updating notes:", error);
      setError("Failed to update subtopic notes. Please try again.");
    }
  };

  const updateSubTopicTitle = async (subtopicId, title) => {
    try {
      // Find the current subtopic to preserve other fields
      const currentSubTopic = tasks
        .flatMap(task => task.subTopics || [])
        .find(subtopic => subtopic.id === subtopicId);
      
      console.log("Updating title for subtopic:", subtopicId);
      console.log("Current subtopic data:", currentSubTopic);
      console.log("New title:", title);
      
      await axios.put(`${backend}/tasks/subtopics/${subtopicId}`, {
        title: title,
        description: currentSubTopic?.description || "", // Preserve existing description
        notes: currentSubTopic?.notes || "", // Preserve existing notes
        isCompleted: currentSubTopic?.isCompleted || false, // Preserve completion status
        order: currentSubTopic?.order || 0 // Preserve order
      });
      
      console.log("Title updated successfully");
      fetchTasks();
      setEditingSubTopicTitle(null);
      setSubtopicTitleEdit("");
    } catch (error) {
      console.error("Error updating title:", error);
      setError("Failed to update subtopic content. Please try again.");
    }
  };

  // Learning Session functions
  const startLearningSession = async (taskId) => {
    try {
      const res = await axios.post(`${backend}/tasks/${taskId}/sessions`, {
        notes: "",
        subTopicsStudied: ""
      });
      setCurrentSession(res.data);
      setSessionNotes("");
      setSelectedSubTopics([]);
    } catch (error) {
      setError("Failed to start learning session. Please try again.");
    }
  };

  const endLearningSession = async () => {
    if (!currentSession) return;
    try {
      await axios.put(`${backend}/tasks/sessions/${currentSession.id}/end`, {
        notes: sessionNotes,
        subTopicsStudied: JSON.stringify(selectedSubTopics)
      });
      setCurrentSession(null);
      setSessionNotes("");
      setSelectedSubTopics([]);
      fetchTasks();
      fetchTimeline();
    } catch (error) {
      setError("Failed to end learning session. Please try again.");
    }
  };

  const startTask = async (taskId) => {
    try {
      await axios.post(`${backend}/tasks/${taskId}/start`);
      fetchTasks();
    } catch (error) {
      setError("Failed to start task. Please try again.");
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.post(`${backend}/tasks/${taskId}/complete`);
      fetchTasks();
    } catch (error) {
      setError("Failed to complete task. Please try again.");
    }
  };

  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
       <Head>
         <title>Learning Hub - Professional Learning Tracker</title>
         <meta name="description" content="Master new skills with organized learning paths and detailed progress tracking" />
         <style jsx>{`
           @keyframes spin {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
           @keyframes fadeIn {
             from { opacity: 0; transform: translateY(20px); }
             to { opacity: 1; transform: translateY(0); }
           }
           @keyframes slideIn {
             from { transform: translateX(-20px); opacity: 0; }
             to { transform: translateX(0); opacity: 1; }
           }
           .fade-in {
             animation: fadeIn 0.5s ease-out;
           }
           .slide-in {
             animation: slideIn 0.3s ease-out;
           }
         `}</style>
       </Head>
      
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link href="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo.svg" alt="Learning Tracker" style={{ width: '32px', height: '32px' }} />
              Learning Tracker
            </Link>
            <div className="navbar-nav">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Welcome back!
              </span>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

       <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px' }}>
         {/* Header */}
         <div style={{ 
           marginBottom: '3rem',
           textAlign: 'center',
           background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
           padding: '3rem 2rem',
           borderRadius: '20px',
           color: 'white',
           position: 'relative',
           overflow: 'hidden'
         }}>
           <div style={{
             position: 'absolute',
             top: '-50%',
             right: '-20%',
             width: '200px',
             height: '200px',
             background: 'rgba(255, 255, 255, 0.1)',
             borderRadius: '50%',
             zIndex: 1
           }}></div>
           <div style={{
             position: 'absolute',
             bottom: '-30%',
             left: '-10%',
             width: '150px',
             height: '150px',
             background: 'rgba(255, 255, 255, 0.05)',
             borderRadius: '50%',
             zIndex: 1
           }}></div>
           <div style={{ position: 'relative', zIndex: 2 }}>
             <h1 style={{ 
               fontSize: '3rem', 
               fontWeight: '800', 
               marginBottom: '1rem', 
               textShadow: '0 2px 4px rgba(0,0,0,0.1)',
               background: 'linear-gradient(45deg, #fff, #f0f9ff)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent'
             }}>
               🎓 Learning Hub
             </h1>
             <p style={{ 
               fontSize: '1.25rem', 
               opacity: 0.9,
               fontWeight: '500',
               maxWidth: '600px',
               margin: '0 auto'
             }}>
               Master new skills with organized learning paths and detailed progress tracking
             </p>
           </div>
         </div>


         {/* Progress Dashboard */}
         <div className="fade-in" style={{ 
           display: 'grid', 
           gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
           gap: '1.5rem', 
           marginBottom: '3rem' 
         }}>
           {/* Progress Card */}
           <div style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             borderRadius: '16px',
             padding: '2rem',
             color: 'white',
             position: 'relative',
             overflow: 'hidden'
           }}>
             <div style={{
               position: 'absolute',
               top: '-20px',
               right: '-20px',
               width: '80px',
               height: '80px',
               background: 'rgba(255, 255, 255, 0.1)',
               borderRadius: '50%'
             }}></div>
             <div style={{ position: 'relative', zIndex: 2 }}>
               <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', opacity: 0.9 }}>
                 📊 Learning Progress
               </h3>
               <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                 {progressPercentage}%
               </div>
               <div style={{ 
                 background: 'rgba(255, 255, 255, 0.2)', 
                 height: '8px', 
                 borderRadius: '4px', 
                 overflow: 'hidden',
                 marginBottom: '0.5rem'
               }}>
                 <div style={{ 
                   background: 'rgba(255, 255, 255, 0.8)', 
                   height: '100%', 
                   width: `${progressPercentage}%`,
                   transition: 'width 0.3s ease'
                 }}></div>
               </div>
               <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                 {completedTasks} of {totalTasks} tasks completed
               </p>
             </div>
           </div>

           {/* Stats Cards */}
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             border: '1px solid var(--border-color)',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
           }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
               📚 Active Learning
             </h3>
             <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
               {totalTasks - completedTasks}
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
               Tasks in progress
             </p>
           </div>

           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             border: '1px solid var(--border-color)',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
           }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
               ✅ Completed
             </h3>
             <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
               {completedTasks}
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
               Tasks finished
             </p>
           </div>
         </div>

         {/* Current Learning Session */}
         {currentSession && (
           <div style={{ 
             marginBottom: '2rem', 
             background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
             borderRadius: '16px',
             padding: '2rem',
             color: 'white',
             position: 'relative',
             overflow: 'hidden'
           }}>
             <div style={{
               position: 'absolute',
               top: '-30px',
               right: '-30px',
               width: '100px',
               height: '100px',
               background: 'rgba(255, 255, 255, 0.1)',
               borderRadius: '50%'
             }}></div>
             <div style={{ position: 'relative', zIndex: 2 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <div>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                     🎯 Active Learning Session
                   </h3>
                   <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                     Keep track of your learning progress
                   </p>
                 </div>
                 <button 
                   onClick={endLearningSession}
                   style={{
                     background: 'rgba(255, 255, 255, 0.2)',
                     border: '1px solid rgba(255, 255, 255, 0.3)',
                     color: 'white',
                     padding: '0.75rem 1.5rem',
                     borderRadius: '8px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease'
                   }}
                   onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                   onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                 >
                   End Session
                 </button>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                 <div>
                   <label style={{ 
                     color: 'white', 
                     fontSize: '0.875rem',
                     fontWeight: '600',
                     display: 'block',
                     marginBottom: '0.5rem'
                   }}>
                     📝 Session Notes
                   </label>
                   <textarea
                     style={{
                       width: '100%',
                       padding: '0.75rem',
                       borderRadius: '8px',
                       border: '1px solid rgba(255, 255, 255, 0.3)',
                       background: 'rgba(255, 255, 255, 0.1)',
                       color: 'white',
                       fontSize: '0.875rem',
                       resize: 'vertical'
                     }}
                     placeholder="What did you learn in this session?"
                     value={sessionNotes}
                     onChange={(e) => setSessionNotes(e.target.value)}
                     rows={3}
                   />
                 </div>
                 <div>
                   <label style={{ 
                     color: 'white', 
                     fontSize: '0.875rem',
                     fontWeight: '600',
                     display: 'block',
                     marginBottom: '0.5rem'
                   }}>
                     📚 Topics Studied
                   </label>
                   <input
                     type="text"
                     style={{
                       width: '100%',
                       padding: '0.75rem',
                       borderRadius: '8px',
                       border: '1px solid rgba(255, 255, 255, 0.3)',
                       background: 'rgba(255, 255, 255, 0.1)',
                       color: 'white',
                       fontSize: '0.875rem'
                     }}
                     placeholder="Comma-separated topic IDs"
                     value={selectedSubTopics.join(',')}
                     onChange={(e) => setSelectedSubTopics(e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                   />
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Error Message */}
         {error && (
           <div style={{ 
             background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
             color: 'white', 
             padding: '1rem 1.5rem', 
             borderRadius: '12px', 
             marginBottom: '2rem',
             display: 'flex',
             alignItems: 'center',
             gap: '0.75rem',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
             border: '1px solid rgba(255, 255, 255, 0.2)'
           }}>
             <span style={{ fontSize: '1.25rem' }}>⚠️</span>
             <span style={{ fontWeight: '500' }}>{error}</span>
           </div>
         )}

         {/* Main Content */}
         <>
            {/* Add Task Form */}
            <div className="fade-in" style={{ 
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              marginBottom: '3rem',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                borderRadius: '50%',
                opacity: 0.1
              }}></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem', 
                  color: 'var(--text-primary)',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  🚀 Create New Learning Task
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '1rem', 
                  marginBottom: '2rem',
                  fontWeight: '500'
                }}>
                  Start your learning journey with a new skill or topic
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.5rem' 
                    }}>
                      📝 Task Title
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: 'var(--background-primary)'
                      }}
                      placeholder="What do you want to learn?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={loading}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.5rem' 
                    }}>
                      🏷️ Category
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: 'var(--background-primary)'
                      }}
                      placeholder="e.g., Programming, Design, Language"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={loading}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.5rem' 
                    }}>
                      📋 Description
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: 'var(--background-primary)',
                        resize: 'vertical',
                        minHeight: '80px'
                      }}
                      placeholder="Describe what you want to achieve..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      disabled={loading}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.5rem' 
                    }}>
                      ⚡ Priority
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        background: 'var(--background-primary)',
                        cursor: 'pointer'
                      }}
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value))}
                      disabled={loading}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    >
                      <option value={1}>🟢 Low Priority</option>
                      <option value={2}>🟡 Medium Priority</option>
                      <option value={3}>🔴 High Priority</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={addTask} 
                  style={{
                    background: loading || !title.trim() 
                      ? 'var(--border-color)' 
                      : 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: loading || !title.trim() 
                      ? 'none' 
                      : '0 4px 15px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    minWidth: '160px'
                  }}
                  disabled={loading || !title.trim()}
                  onMouseOver={(e) => {
                    if (!loading && title.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading && title.trim()) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span className="loading"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      ✨ Create Learning Task
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="fade-in" style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '2rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  📚 Your Learning Tasks
                  <span style={{
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {totalTasks}
                  </span>
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '1rem',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Manage your learning journey and track progress
                </p>
              </div>
              <div style={{ padding: '2rem' }}>
                {loading && tasks.length === 0 ? (
                  <div style={{ 
                    padding: '4rem 2rem', 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '16px',
                    border: '2px dashed var(--border-color)'
                  }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      border: '4px solid var(--primary-color)',
                      borderTop: '4px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1.5rem'
                    }}></div>
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--text-secondary)', 
                      fontSize: '1.125rem',
                      fontWeight: '500'
                    }}>
                      Loading your learning tasks...
                    </p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={{ 
                    padding: '4rem 2rem', 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '16px',
                    border: '2px dashed var(--border-color)'
                  }}>
                    <div style={{ 
                      fontSize: '4rem', 
                      marginBottom: '1.5rem',
                      opacity: 0.6
                    }}>🚀</div>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      marginBottom: '0.75rem', 
                      color: 'var(--text-primary)',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Ready to Start Learning?
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '1.125rem',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      Create your first learning task above to begin your journey!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {tasks.map((task) => (
                      <div key={task.id} style={{
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        overflow: 'hidden'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                      }}>
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                <label style={{ 
                                  position: 'relative',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={task.isCompleted}
                                    onChange={() => toggleComplete(task)}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      cursor: 'pointer',
                                      accentColor: 'var(--primary-color)'
                                    }}
                                  />
                                </label>
                                <h4 style={{ 
                                  fontSize: '1.25rem', 
                                  fontWeight: '700', 
                                  color: 'var(--text-primary)',
                                  textDecoration: task.isCompleted ? 'line-through' : 'none',
                                  opacity: task.isCompleted ? 0.7 : 1,
                                  margin: 0,
                                  flex: 1
                                }}>
                                  {task.title}
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span style={{ 
                                    padding: '0.375rem 0.75rem', 
                                    borderRadius: '20px', 
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: task.priority === 3 
                                      ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' 
                                      : task.priority === 2 
                                        ? 'linear-gradient(135deg, #ffa726, #ff9800)' 
                                        : 'linear-gradient(135deg, #66bb6a, #4caf50)',
                                    color: 'white',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                  }}>
                                    {task.priority === 3 ? '🔴 High' : task.priority === 2 ? '🟡 Medium' : '🟢 Low'}
                                  </span>
                                  {task.category && (
                                    <span style={{ 
                                      padding: '0.375rem 0.75rem', 
                                      borderRadius: '20px', 
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                                      color: 'white',
                                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                    }}>
                                      🏷️ {task.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {task.description && (
                                <p style={{ 
                                  color: 'var(--text-secondary)', 
                                  fontSize: '0.875rem', 
                                  marginBottom: '0.75rem',
                                  lineHeight: '1.5',
                                  fontStyle: 'italic'
                                }}>
                                  {task.description}
                                </p>
                              )}
                              <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                fontSize: '0.75rem', 
                                color: 'var(--text-secondary)',
                                fontWeight: '500'
                              }}>
                                <span>📅 Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                {task.startedAt && <span>🚀 Started: {new Date(task.startedAt).toLocaleDateString()}</span>}
                                {task.completedAt && <span>✅ Completed: {new Date(task.completedAt).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {!task.startedAt && (
                                <button 
                                  onClick={() => startTask(task.id)}
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                  }}
                                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                  🚀 Start
                                </button>
                              )}
                              {!currentSession && task.startedAt && !task.isCompleted && (
                                <button 
                                  onClick={() => startLearningSession(task.id)}
                                  style={{
                                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                  }}
                                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                  📚 Study Now
                                </button>
                              )}
                              {!task.isCompleted && (
                                <button 
                                  onClick={() => completeTask(task.id)}
                                  style={{
                                    background: 'linear-gradient(135deg, #66bb6a, #4caf50)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                  }}
                                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                  ✅ Complete
                                </button>
                              )}
                              <button 
                                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                style={{
                                  background: 'white',
                                  color: 'var(--text-primary)',
                                  border: '2px solid var(--border-color)',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.borderColor = 'var(--primary-color)';
                                  e.target.style.color = 'var(--primary-color)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.borderColor = 'var(--border-color)';
                                  e.target.style.color = 'var(--text-primary)';
                                }}
                              >
                                {expandedTask === task.id ? '📖 Collapse' : '📖 Details'}
                              </button>
                              <button 
                                onClick={() => deleteTask(task.id)}
                                style={{
                                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          {/* Expanded Task Details */}
                          {expandedTask === task.id && (
                            <div style={{ 
                              borderTop: '2px solid var(--border-color)', 
                              paddingTop: '1.5rem',
                              marginTop: '1.5rem',
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              margin: '1.5rem -1.5rem -1.5rem -1.5rem'
                            }}>
                               {/* Combined SubTopics and Study Details Section */}
                               <div style={{ marginBottom: '1rem' }}>
                                 <h5 style={{ 
                                   fontSize: '1.25rem', 
                                   fontWeight: '700', 
                                   marginBottom: '0.75rem', 
                                   color: 'var(--text-primary)',
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: '0.5rem'
                                 }}>
                                   📚 Learning Topics & Notes
                                   <span style={{
                                     background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                                     color: 'white',
                                     padding: '0.25rem 0.5rem',
                                     borderRadius: '12px',
                                     fontSize: '0.75rem',
                                     fontWeight: '600'
                                   }}>
                                     {task.subTopics?.length || 0}
                                   </span>
                                 </h5>
                                 
                                 {/* Add SubTopic Form - Only show if task is not completed */}
                                 {!task.isCompleted && (
                                   <div style={{ marginBottom: '1rem' }}>
                                     <label style={{ 
                                       fontSize: '0.875rem', 
                                       fontWeight: '600', 
                                       color: 'var(--text-primary)',
                                       display: 'block',
                                       marginBottom: '0.5rem'
                                     }}>
                                       Add New Learning Topic:
                                     </label>
                                     <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                       <input
                                         type="text"
                                         className="form-input"
                                         placeholder="What do you want to study in this topic?"
                                         value={newSubTopic}
                                         onChange={(e) => setNewSubTopic(e.target.value)}
                                         onKeyPress={(e) => e.key === 'Enter' && newSubTopic.trim() && addSubTopic(task.id)}
                                         style={{ flex: 1 }}
                                       />
                                       <button 
                                         onClick={() => addSubTopic(task.id)}
                                         className="btn btn-primary btn-sm"
                                         disabled={!newSubTopic.trim()}
                                       >
                                         Add Topic
                                       </button>
                                       <button 
                                         onClick={() => fetchTasks()}
                                         className="btn btn-secondary btn-sm"
                                         title="Refresh data"
                                       >
                                         🔄
                                       </button>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {/* Completed Task Message */}
                                 {task.isCompleted && (
                                   <div style={{ 
                                     padding: '0.75rem', 
                                     background: 'var(--accent-color)', 
                                     color: 'white', 
                                     borderRadius: 'var(--radius)', 
                                     marginBottom: '1rem',
                                     fontSize: '0.875rem',
                                     textAlign: 'center'
                                   }}>
                                     ✅ Task completed - No more topics can be added
                                   </div>
                                 )}
                                 
                                 {/* Topics List */}
                                 {task.subTopics && task.subTopics.length > 0 ? (
                                   <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                     {task.subTopics.map((subtopic) => (
                                       <div key={subtopic.id} style={{ 
                                         background: 'var(--background-secondary)',
                                         borderRadius: 'var(--radius)',
                                         padding: '1rem',
                                         marginBottom: '1rem',
                                         border: '1px solid var(--border-color)'
                                       }}>
                                         {/* Topic Header */}
                                         <div style={{ 
                                           display: 'flex', 
                                           alignItems: 'center', 
                                           gap: '0.75rem', 
                                           marginBottom: '0.75rem'
                                         }}>
                                           <input
                                             type="checkbox"
                                             checked={subtopic.isCompleted || false}
                                             onChange={() => toggleSubTopicComplete(subtopic)}
                                             disabled={task.isCompleted}
                                             style={{ transform: 'scale(1.2)' }}
                                           />
                                           <div style={{ flex: 1 }}>
                                             {editingSubTopicTitle === subtopic.id ? (
                                               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                 <input
                                                   type="text"
                                                   className="form-input"
                                                   value={subtopicTitleEdit}
                                                   onChange={(e) => setSubtopicTitleEdit(e.target.value)}
                                                   onKeyPress={(e) => e.key === 'Enter' && updateSubTopicTitle(subtopic.id, subtopicTitleEdit)}
                                                   style={{ flex: 1, fontSize: '0.875rem' }}
                                                   placeholder="What do you want to study?"
                                                   autoFocus
                                                 />
                                                 <button 
                                                   onClick={() => updateSubTopicTitle(subtopic.id, subtopicTitleEdit)}
                                                   className="btn btn-primary btn-xs"
                                                   disabled={!subtopicTitleEdit.trim()}
                                                 >
                                                   ✓
                                                 </button>
                                                 <button 
                                                   onClick={() => {
                                                     setEditingSubTopicTitle(null);
                                                     setSubtopicTitleEdit("");
                                                   }}
                                                   className="btn btn-secondary btn-xs"
                                                 >
                                                   ✕
                                                 </button>
                                               </div>
                                             ) : (
                                               <div 
                                                 style={{ 
                                                   textDecoration: subtopic.isCompleted ? 'line-through' : 'none',
                                                   opacity: subtopic.isCompleted ? 0.7 : 1,
                                                   fontWeight: '600',
                                                   fontSize: '1rem',
                                                   color: subtopic.title ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                   fontStyle: !subtopic.title ? 'italic' : 'normal',
                                                   cursor: !task.isCompleted ? 'pointer' : 'default',
                                                   padding: '0.5rem',
                                                   borderRadius: 'var(--radius)',
                                                   background: 'var(--background-primary)',
                                                   border: '1px solid var(--border-color)',
                                                   minHeight: '2.5rem',
                                                   display: 'flex',
                                                   alignItems: 'center'
                                                 }}
                                                 onClick={() => {
                                                   if (!task.isCompleted) {
                                                     if (editingSubTopic === subtopic.id) {
                                                       setEditingSubTopic(null);
                                                     }
                                                     setEditingSubTopicTitle(subtopic.id);
                                                     setSubtopicTitleEdit(subtopic.title || subtopic.description || '');
                                                   }
                                                 }}
                                               >
                                                 {subtopic.title || subtopic.description || 'Click to add topic title...'}
                                               </div>
                                             )}
                                             {subtopic.completedAt && (
                                               <div style={{ 
                                                 fontSize: '0.75rem', 
                                                 color: 'var(--text-secondary)',
                                                 marginTop: '0.25rem'
                                               }}>
                                                 Completed: {new Date(subtopic.completedAt).toLocaleDateString()}
                                               </div>
                                             )}
                                           </div>
                                           {!task.isCompleted && (
                                             <div style={{ display: 'flex', gap: '0.5rem' }}>
                                               <button 
                                                 onClick={() => {
                                                   if (editingSubTopicTitle === subtopic.id) {
                                                     setEditingSubTopicTitle(null);
                                                     setSubtopicTitleEdit("");
                                                   }
                                                   setEditingSubTopic(editingSubTopic === subtopic.id ? null : subtopic.id);
                                                 }}
                                                 className="btn btn-outline btn-sm"
                                                 style={{ fontSize: '0.75rem' }}
                                               >
                                                 📝 Notes
                                               </button>
                                               <button 
                                                 onClick={() => deleteSubTopic(subtopic.id)}
                                                 className="btn btn-danger btn-sm"
                                                 style={{ fontSize: '0.75rem' }}
                                               >
                                                 🗑️
                                               </button>
                                             </div>
                                           )}
                                         </div>
                                         
                                         {/* Notes Section */}
                                         {editingSubTopic === subtopic.id && editingSubTopicTitle !== subtopic.id && (
                                           <div style={{ 
                                             borderTop: '1px solid var(--border-color)', 
                                             paddingTop: '0.75rem',
                                             marginTop: '0.75rem'
                                           }}>
                                             <label style={{ 
                                               fontSize: '0.875rem', 
                                               fontWeight: '600', 
                                               color: 'var(--text-primary)',
                                               display: 'block',
                                               marginBottom: '0.5rem'
                                             }}>
                                               📝 Study Notes:
                                             </label>
                                             <textarea
                                               className="form-input"
                                               placeholder="Add your notes about this topic..."
                                               value={subtopicNotes[subtopic.id] || subtopic.description || ''}
                                               onChange={(e) => setSubtopicNotes({
                                                 ...subtopicNotes,
                                                 [subtopic.id]: e.target.value
                                               })}
                                               rows={4}
                                               style={{ fontSize: '0.875rem', width: '100%' }}
                                             />
                                             <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                               <button 
                                                 onClick={() => {
                                                   const notesToSave = subtopicNotes[subtopic.id] || subtopic.description || '';
                                                   updateSubTopicNotes(subtopic.id, notesToSave);
                                                 }}
                                                 className="btn btn-primary btn-sm"
                                               >
                                                 Save Notes
                                               </button>
                                               <button 
                                                 onClick={() => {
                                                   setEditingSubTopic(null);
                                                   setSubtopicNotes({
                                                     ...subtopicNotes,
                                                     [subtopic.id]: subtopic.description || ''
                                                   });
                                                 }}
                                                 className="btn btn-secondary btn-sm"
                                               >
                                                 Cancel
                                               </button>
                                             </div>
                                           </div>
                                         )}
                                         
                                         {/* Display existing notes */}
                                         {subtopic.description && !editingSubTopic && editingSubTopicTitle !== subtopic.id && (
                                           <div style={{ 
                                             borderTop: '1px solid var(--border-color)', 
                                             paddingTop: '0.75rem',
                                             marginTop: '0.75rem'
                                           }}>
                                             <div style={{ 
                                               fontSize: '0.875rem', 
                                               fontWeight: '600', 
                                               color: 'var(--text-primary)',
                                               marginBottom: '0.5rem'
                                             }}>
                                               📝 Study Notes:
                                             </div>
                                             <div style={{ 
                                               fontSize: '0.875rem', 
                                               color: 'var(--text-secondary)',
                                               background: 'var(--background-primary)',
                                               padding: '0.75rem',
                                               borderRadius: 'var(--radius)',
                                               whiteSpace: 'pre-wrap',
                                               wordWrap: 'break-word',
                                               fontStyle: 'italic',
                                               border: '1px solid var(--border-color)',
                                               minHeight: '60px',
                                               maxHeight: '200px',
                                               overflowY: 'auto'
                                             }}>
                                               {subtopic.description}
                                             </div>
                                           </div>
                                         )}
                                       </div>
                                     ))}
                                   </div>
                                 ) : (
                                   <div style={{ 
                                     padding: '2rem', 
                                     background: 'var(--background-secondary)', 
                                     borderRadius: 'var(--radius)',
                                     textAlign: 'center',
                                     border: '1px dashed var(--border-color)'
                                   }}>
                                     <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                     <h6 style={{ 
                                       fontSize: '1rem', 
                                       fontWeight: '600', 
                                       color: 'var(--text-primary)',
                                       marginBottom: '0.5rem'
                                     }}>
                                       No Learning Topics Yet
                                     </h6>
                                     <p style={{ 
                                       color: 'var(--text-secondary)', 
                                       fontSize: '0.875rem', 
                                       margin: 0,
                                       marginBottom: '1rem'
                                     }}>
                                       Create your first learning topic to start organizing your study!
                                     </p>
                                     {!task.isCompleted && (
                                       <button 
                                         onClick={() => {
                                           const newSubTopicTitle = prompt("Enter topic title:");
                                           if (newSubTopicTitle && newSubTopicTitle.trim()) {
                                             setNewSubTopic(newSubTopicTitle.trim());
                                             addSubTopic(task.id);
                                           }
                                         }}
                                         className="btn btn-primary"
                                       >
                                         + Create First Topic
                                       </button>
                                     )}
                                   </div>
                                 )}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
      </div>
    </>
  );
}
