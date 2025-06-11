'use client';

import { useState } from 'react';
import { Loader2, FileText, ListOrdered, CheckSquare, Clipboard, Check, UserPlus, X, ChevronDown, ChevronUp, Edit3, Save, XCircle } from 'lucide-react';

export default function Transcribe({ meetingId = "MEET-001" }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [tasks, setTasks] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [teamMembers, setTeamMembers] = useState(['John', 'Sarah', 'DevOps Team', 'Design Team']);
  const [newTeamMember, setNewTeamMember] = useState('');
  const [showTeamMemberInput, setShowTeamMemberInput] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingAssignees, setEditingAssignees] = useState([]);
  const [showEditDropdown, setShowEditDropdown] = useState(false);

  const handleTranscribe = async () => {
    setIsProcessing(true);
    setTranscription('');
    setSummary('');
    setTasks([]);
    setCheckedTasks({});

    // Simulate API call with timeout
    setTimeout(() => {
      // Fake results for demo
      const fakeTranscription = `
        Welcome everyone to the weekly team standup. Today we'll review sprint progress, blockers, and goals.
        John reported backend API is 80% done. Design team is finalizing UI for dashboard module.
        Blocker: deployment delay on staging environment.
      `;
      const fakeSummary = `The team reviewed sprint progress. Backend is nearly complete. Design is finalizing dashboard UI. Deployment issues on staging were flagged as a blocker.`;
      
      const fakeTasks = [
        { text: 'Complete the remaining 20% of the backend API', assignees: ['John'] },
        { text: 'Finalize UI for the dashboard module', assignees: ['Design Team', 'Sarah'] },
        { text: 'Resolve staging environment deployment issues', assignees: ['DevOps Team'] },
      ];
      
      setTranscription(fakeTranscription);
      setSummary(fakeSummary);
      setTasks(fakeTasks);
      
      // Initialize all tasks as unchecked
      const initialCheckedState = {};
      fakeTasks.forEach((_, index) => {
        initialCheckedState[index] = false;
      });
      setCheckedTasks(initialCheckedState);
      
      setIsProcessing(false);
    }, 3000);
  };

  const toggleTaskCheck = (index) => {
    setCheckedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAssigneeSelection = (member) => {
    setSelectedAssignees(prev => {
      if (prev.includes(member)) {
        return prev.filter(assignee => assignee !== member);
      } else {
        return [...prev, member];
      }
    });
  };

  const removeAssignee = (assignee) => {
    setSelectedAssignees(prev => prev.filter(a => a !== assignee));
  };

  const addNewTask = () => {
    if (newTask.trim()) {
      const taskObj = {
        text: newTask,
        assignees: selectedAssignees.length > 0 ? [...selectedAssignees] : ['Unassigned']
      };
      
      setTasks(prev => [...prev, taskObj]);
      setCheckedTasks(prev => ({
        ...prev,
        [tasks.length]: false
      }));
      setNewTask('');
      setSelectedAssignees([]);
      setShowAssigneeDropdown(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAssigneeDropdown) {
      addNewTask();
    }
  };

  const addTeamMember = () => {
    if (newTeamMember.trim() && !teamMembers.includes(newTeamMember)) {
      setTeamMembers(prev => [...prev, newTeamMember]);
      setNewTeamMember('');
      setShowTeamMemberInput(false);
    }
  };

  const removeTaskAssignee = (taskIndex, assignee) => {
    setTasks(prev => prev.map((task, index) => {
      if (index === taskIndex) {
        const newAssignees = task.assignees.filter(a => a !== assignee);
        return {
          ...task,
          assignees: newAssignees.length > 0 ? newAssignees : ['Unassigned']
        };
      }
      return task;
    }));
  };

  const startEditingTask = (taskIndex) => {
    setEditingTask(taskIndex);
    setEditingAssignees([...tasks[taskIndex].assignees.filter(a => a !== 'Unassigned')]);
    setShowEditDropdown(true);
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
    setEditingAssignees([]);
    setShowEditDropdown(false);
  };

  const saveTaskEdit = () => {
    if (editingTask !== null) {
      setTasks(prev => prev.map((task, index) => {
        if (index === editingTask) {
          return {
            ...task,
            assignees: editingAssignees.length > 0 ? [...editingAssignees] : ['Unassigned']
          };
        }
        return task;
      }));
    }
    cancelEditingTask();
  };

  const toggleEditingAssignee = (member) => {
    setEditingAssignees(prev => {
      if (prev.includes(member)) {
        return prev.filter(assignee => assignee !== member);
      } else {
        return [...prev, member];
      }
    });
  };

  const removeEditingAssignee = (assignee) => {
    setEditingAssignees(prev => prev.filter(a => a !== assignee));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Meeting ID: {meetingId}</h1>
      
      <button 
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md mb-8 hover:bg-blue-700 transition-colors w-full md:w-auto"
        onClick={handleTranscribe}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            <span>Start Transcription & Summarization</span>
          </>
        )}
      </button>

      {transcription && (
        <div className="mb-8 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center mb-3">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Transcription</h2>
          </div>
          <div className="whitespace-pre-line">
            {transcription}
          </div>
        </div>
      )}

      {summary && (
        <div className="mb-8 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center mb-3">
            <Clipboard className="mr-2 h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Summary</h2>
          </div>
          <div>
            {summary}
          </div>
        </div>
      )}

      {/* Team Members Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Team Members</h2>
          </div>
          <button 
            onClick={() => setShowTeamMemberInput(!showTeamMemberInput)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showTeamMemberInput ? 'Cancel' : 'Add Member'}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {teamMembers.map((member, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {member}
            </span>
          ))}
        </div>
        
        {showTeamMemberInput && (
          <div className="flex mt-2">
            <input
              type="text"
              value={newTeamMember}
              onChange={(e) => setNewTeamMember(e.target.value)}
              placeholder="Enter name"
              className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
            />
            <button
              onClick={addTeamMember}
              className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="flex items-center mb-3">
          <ListOrdered className="mr-2 h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Tasks from Meeting</h2>
        </div>
        
        {tasks.length > 0 && (
          <ul className="space-y-4 mb-4">
            {tasks.map((task, index) => (
              <li key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-start">
                  <div className="flex items-center h-6 mt-1">
                    <input
                      type="checkbox"
                      id={`task-${index}`}
                      checked={checkedTasks[index] || false}
                      onChange={() => toggleTaskCheck(index)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <label
                        htmlFor={`task-${index}`}
                        className={`block text-sm font-medium ${
                          checkedTasks[index] ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}
                      >
                        {task.text}
                      </label>
                      <button
                        onClick={() => startEditingTask(index)}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit assignees"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {editingTask === index ? (
                      <div className="mt-3 space-y-3">
                        {/* Edit Mode */}
                        <div className="relative">
                          <button
                            onClick={() => setShowEditDropdown(!showEditDropdown)}
                            className="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          >
                            <span className="text-gray-700">
                              {editingAssignees.length === 0 
                                ? 'Select assignees...' 
                                : `${editingAssignees.length} assignee${editingAssignees.length > 1 ? 's' : ''} selected`
                              }
                            </span>
                            {showEditDropdown ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          
                          {showEditDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {teamMembers.map((member, memberIndex) => (
                                <label
                                  key={memberIndex}
                                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editingAssignees.includes(member)}
                                    onChange={() => toggleEditingAssignee(member)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{member}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Selected assignees in edit mode */}
                        {editingAssignees.length > 0 && (
                          <div className="flex flex-wrap gap-1 p-2 bg-blue-50 rounded-md">
                            {editingAssignees.map((assignee, assigneeIndex) => (
                              <span 
                                key={assigneeIndex}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {assignee}
                                <button
                                  onClick={() => removeEditingAssignee(assignee)}
                                  className="ml-1 hover:text-blue-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Edit mode buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={saveTaskEdit}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </button>
                          <button
                            onClick={cancelEditingTask}
                            className="inline-flex items-center px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal view */
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.assignees.map((assignee, assigneeIndex) => (
                          <span 
                            key={assigneeIndex}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {assignee}
                            {assignee !== 'Unassigned' && (
                              <button
                                onClick={() => removeTaskAssignee(index, assignee)}
                                className="ml-1 hover:text-blue-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          {/* Multi-select assignee section */}
          <div className="relative">
            <button
              onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              className="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <span className="text-gray-500">
                {selectedAssignees.length === 0 
                  ? 'Select assignees...' 
                  : `${selectedAssignees.length} assignee${selectedAssignees.length > 1 ? 's' : ''} selected`
                }
              </span>
              {showAssigneeDropdown ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            {showAssigneeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {teamMembers.map((member, index) => (
                  <label
                    key={index}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(member)}
                      onChange={() => toggleAssigneeSelection(member)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{member}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected assignees display */}
          {selectedAssignees.length > 0 && (
            <div className="flex flex-wrap gap-1 p-2 bg-blue-50 rounded-md">
              {selectedAssignees.map((assignee, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {assignee}
                  <button
                    onClick={() => removeAssignee(assignee)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <button
            onClick={addNewTask}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}