import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/users');
      setUsers(res.data);
      console.log(res.data)
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 rounded ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Projects</button>
        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Tasks</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Users</button>
      </div>

      {activeTab === 'projects' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Projects</h2>
          
          <table>
          <tr>
          <th>ID</th>
          <th>Project Name</th>
          </tr>
            {projects.map((project) => (
            <tr>
            <td>{project.id}</td>
              <td key={project.id} onClick={() => fetchTasks(project.id)} className="cursor-pointer hover:text-blue-600">
                {project.name}
              </td>
            </tr>
            ))}
            </table>
          
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Tasks</h2>
          <ul className="list-disc pl-5">
            {tasks.map((task) => (
              <li key={task.id}>
                {task.name} - {task.status} (Assigned to: {task.assigned_users?.join(', ') || 'None'})
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Users</h2>
          <ul className="list-disc pl-5">
            {users.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
