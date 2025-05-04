import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [usercurrentPage, setusercurrentPage] = useState(1);
  const [UserLastPage, setUserLastPage] = useState(1);
  const [projectcurrentPage, setprojectcurrentPage] = useState(1);
  const [projectLastPage, setprojectLastPage] = useState(1);
  const [taskcurrentPage, settaskcurrentPage] = useState(1);
  const [taskLastPage, settaskLastPage] = useState(1);
  const [error, seterror] = useState("");

  const [projectshowModal, setProjectShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");

  const [sucessshowModal, setSucessShowModal] = useState(false);

  const [failureshowModal, setFailureShowModal] = useState(false);

  const [taskshowModal, setTaskShowModal] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [status, setStatus] = useState([]);
  const [taskupdate, setTaskUpdate] = useState(false);
  const [taskid, settaskid] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Triggers the hidden input
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/tasks/import",
        formData
      );
      alert(
        `Imported: ${res.data.success_count}, Failed: ${res.data.failed_count}`
      );
      console.log("Failures:", res.data.failed_details);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Import failed!");
    }
  };

  const exportTasksToExcel = (Alltasks) => {
    const formattedTasks = Alltasks.map((task) => ({
      ID: task.id,
      Name: task.name,
      Status: task.status,
      Project: task.project,
      Assigned_Users: task.users?.join(", ") || "None", // Convert array to string
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedTasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "tasks.xlsx");
  };

  const TaskCall = () =>{
    setTaskUpdate(false);
    setTaskShowModal(true)
  }
  useEffect(() => {
    fetchUsers();
  }, [usercurrentPage]);

  useEffect(() => {
    fetchProjects();
  }, [projectcurrentPage]);

  useEffect(() => {
    fetchTasks();
  }, [taskcurrentPage]);
  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/projects?page=${projectcurrentPage}`
      );
      setProjects(res.data.details);
      setprojectLastPage(res.data.lastpage);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const ProjectSave = async () => {
    try {
      const response = await axios.post("http://localhost:5000/projects", {
        name: projectName,
      });
      fetchProjects();
      console.log("Project created:", response.data);
      setProjectShowModal(false);
      setSucessShowModal(true);
      setProjectName("");
    } catch (error) {
      console.error("Error creating project:", error);
      seterror(error.message);
      setProjectShowModal(false);
      setFailureShowModal(true);
    }
  };
  const UpdateTask = (task_values) => {
    settaskid(task_values.id);
    setTaskName(task_values.name);
    setSelectedProjectId(task_values.project_id);
    setSelectedUsers(task_values.user_ids);
    setStatus(task_values.status);
    setTaskUpdate(true);
    setTaskShowModal(true);
  };
  const UpdateSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/tasks/${taskid}`,
        {
          name: taskName,
          status: status,
          project_id: selectedProjectId,
          user_ids: selectedUsers,
        }
      );
      fetchTasks();
      setTaskShowModal(false);
      setSucessShowModal(true);
      settaskid(null); // Close modal
    } catch (err) {
      seterror(error.message);
      setTaskShowModal(false);
      setFailureShowModal(true);
    }
  };
  const TaskSave = async () => {
    try {
      const response = await axios.post("http://localhost:5000/tasks", {
        name: taskName,
        status: status,
        project_id: selectedProjectId,
        user_ids: selectedUsers,
      });
      fetchTasks();
      setTaskShowModal(false);
      setSucessShowModal(true);
      setTaskName("");
    } catch (error) {
      seterror(error.message);
      setTaskShowModal(false);
      setFailureShowModal(true);
    }
  };
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/tasks?page=${taskcurrentPage}`
      );
      setTasks(res.data.details);
      settaskLastPage(res.data.lastpage);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/tasks`);
      exportTasksToExcel(res.data.details);
      setSucessShowModal(true);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      seterror(error.message);
      setFailureShowModal(true);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/users?page=${usercurrentPage}`
      );
      setUsers(res.data.details);
      setUserLastPage(res.data.lastpage);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };
  const modalStyle = {
    position: "fixed",
    top: "30%",
    left: "40%",
    padding: "20px",
    backgroundColor: "white",
    border: "2px solid black",
    zIndex: 1000,
  };
  const active_tab ={
    backgroundColor:"#4CAF50",
    color:"white",
    padding:"10px 20px",
    fontSize:'16px',
    borderRadius:'6px',
    cursor:'pointer'
  }
  const inactive_tab ={
    backgroundColor:"#e0e0e0",
    color:"#666",
    padding:"10px 20px",
    fontSize:'16px',
    borderRadius:'6px',
    cursor:'pointer'
  }
  const normal_btn ={
    backgroundColor:"#e0e0e0",
    color:"#666",
    padding:"5px 10px",
    fontSize:'12px',
    borderRadius:'6px',
    cursor:'pointer'
  }
  return (
    <div style={{margin:'40px 50px'}}>
      <div style={{display:'flex',flexDirection:'row',gap:'20px'}}>
        <button
          onClick={() => setActiveTab("projects")}
          style={activeTab === "projects" ? active_tab : inactive_tab}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          style={activeTab === "tasks" ? active_tab : inactive_tab}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={activeTab === "users" ? active_tab : inactive_tab}
        >
          Users
        </button>
      </div>

      {activeTab === "projects" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Projects</h2>
          <div>
            <div style={{marginLeft:'200px'}}>
            <button onClick={() => setProjectShowModal(true)} style={normal_btn}>
              
              Add Project
            </button>
            </div>
            {projectshowModal && (
              <div style={{...modalStyle, align:'center',display:'flex',flexDirection:'column',gap:'20px'}}>
                <h3 style={{margin:0,textAlign:'center'}}>Add Project</h3>
                <input
                 style={{height:'25px'}}
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                
                <button style={{...normal_btn, backgroundColor:'green', color:"white"}} onClick={ProjectSave}>Save</button>
                <button style={{...normal_btn, backgroundColor:'red', color:"white"}} onClick={() => setProjectShowModal(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              fontWeight: "bold",
            }}
          >
            <div style={{ width: "50px" }}>ID</div>
            <div style={{ width: "200px" }}>Project Name</div>
          </div>
          {projects.map((project) => (
            <div style={{ display: "flex", flexDirection: "row", gap: "20px",fontSize:'14px',marginTop:"10px" }}>
              <div style={{ width: "50px" }}>{project.id}</div>
              <div style={{ width: "200px" }}>{project.name}</div>
            </div>
          ))}
          <div style={{ marginTop: 30 }}>
            <button style={normal_btn}
              onClick={() => setprojectcurrentPage(projectcurrentPage - 1)}
              disabled={projectcurrentPage === 1}
            >
              Previous
            </button>
            <span style={{ margin:'20px'}}>Page: {projectcurrentPage}</span>
            <button style={normal_btn}
              onClick={() => setprojectcurrentPage(projectcurrentPage + 1)}
              disabled={projectcurrentPage === projectLastPage}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Tasks</h2>

          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "30px",
                justifyContent: "flex-end",
                marginRight: "20%",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => TaskCall()}
                style={normal_btn}
              >
               
                Add Task
              </button>
              <button onClick={fetchAllTasks} style={normal_btn}>
                Export to Excel
              </button>

              <button onClick={handleButtonClick} style={normal_btn}>
                Import Excel
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
            {taskshowModal && (
              <div
                style={{
                  ...modalStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  width: "30%",
                  margin: "-10%",
                  
                }}
              >
                
                {taskupdate !== true && (<h3 style={{margin:0,textAlign:'center'}}>Add Task </h3>)}
                {taskupdate === true && (<h3 style={{margin:0,textAlign:'center'}}>Update Task </h3>)}
                  
                <input
                  style={{height:"25px"}}
                  type="text"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
                <select
                   style={{height:"25px"}}
                  value={selectedProjectId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedProjectId(id);
                  }}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <select
                  multiple
                  value={selectedUsers}
                  style={{height:"100px"}}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions);
                    const values = options.map((option) => option.value);
                    setSelectedUsers(values);
                  }}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  style={{height:"25px"}}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                >
                  <option key="Not Started" value="Not Started">
                   
                    Not Started
                  </option>
                  <option key="In Progress" value="In Progress">
                   
                    In Progress
                  </option>
                  <option key="Complete" value="Complete">
                    
                    Complete
                  </option>
                </select>
                {taskupdate !== true && (
                  <button style={{...normal_btn, backgroundColor:'green',color:'white'}} onClick={TaskSave}>Save</button>
                )}

                {taskupdate === true && (
                  <button style={{...normal_btn, backgroundColor:'orange',color:'white'}} onClick={UpdateSave}>Update</button>
                )}
                <button  style={{...normal_btn, backgroundColor:'red',color:'white'}} onClick={() => setTaskShowModal(false)}>Cancel</button>
              </div>
            )}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* Header Row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                fontWeight: "bold",
              }}
            >
              <div style={{ width: "50px" }}>ID</div>
              <div style={{ width: "200px" }}>Task Name</div>
              <div style={{ width: "100px" }}>Status</div>
              <div style={{ width: "200px" }}>Project Name</div>
              <div style={{ width: "200px" }}>Assigned To</div>
              <div style={{ width: "100px" }}>Action</div>
            </div>

            {/* Task Rows */}
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{ display: "flex", flexDirection: "row", gap: "20px",marginTop:'10px',fontSize:'14px' }}
              >
                <div style={{ width: "50px" }}>{task.id}</div>
                <div style={{ width: "200px" }}>{task.name}</div>
                <div style={{ width: "100px" }}>{task.status}</div>
                <div style={{ width: "200px" }}>{task.project}</div>
                <div style={{ width: "200px" }}>
                  {task.users?.join(", ") || "None"}
                </div>
                <div style={{ width: "100px" }}>
                  <button onClick={() => UpdateTask(task)}>Update</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 30 }}>
              <button style={normal_btn}
                onClick={() => settaskcurrentPage(taskcurrentPage - 1)}
                disabled={taskcurrentPage === 1}
              >
                Previous
              </button>
              <span style={{margin:"20px"}}>Page: {taskcurrentPage}</span>
              <button style={normal_btn}
                onClick={() => settaskcurrentPage(taskcurrentPage + 1)}
                disabled={taskcurrentPage === taskLastPage}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Users</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              fontWeight: "bold",
            }}
          >
            <div style={{ width: "50px" }}>ID</div>
            <div style={{ width: "200px" }}>User Name</div>
          </div>
          {users.map((user) => (
            <div style={{ display: "flex", flexDirection: "row", gap: "20px",marginTop:'10px',fontSize:'14px' }}>
              <div style={{ width: "50px" }}>{user.id}</div>
              <div style={{ width: "200px" }}>{user.name}</div>
            </div>
          ))}
          <div style={{ marginTop: 30 }}>
            <button style={normal_btn}
              onClick={() => setusercurrentPage(usercurrentPage - 1)}
              disabled={usercurrentPage === 1}
            >
              Previous
            </button>
            <span style={{margin:'20px'}}>Page: {usercurrentPage}</span>
            <button style={normal_btn}
              onClick={() => setusercurrentPage(usercurrentPage + 1)}
              disabled={usercurrentPage === UserLastPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {sucessshowModal && (
        <div style={modalStyle}>
          <h3>Process Sucessfull</h3>

          <button onClick={() => setSucessShowModal(false)}>Close</button>
        </div>
      )}
      {failureshowModal && (
        <div style={modalStyle}>
          <h3>Process Failed</h3>
          <h4>{error}</h4>
          <button onClick={() => setFailureShowModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
