import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function TreeNode({ node, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState(node.data || '');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const generateChildName = (parentNode) => {
    const childCount = parentNode.children ? parentNode.children.length : 0;
    const parentName = parentNode.name || 'Root'; 

    if (parentName === 'Root') {
      return `child${childCount + 1}`;
    } else {
      return `${parentName}-child${childCount + 1}`;
    }
  };

  const addChild = () => {
    const newChildName = generateChildName(node); 
    const updatedNode = {
      ...node,
      children: node.children
        ? [...node.children, { name: newChildName, data: "Data", children: [] }]
        : [{ name: newChildName, data: "Data", children: [] }]
    };
    onUpdate(updatedNode);
    setIsExpanded(true); 
  };

  const handleDataChange = (e) => {
    const newData = e.target.value;
    setData(newData);
    onUpdate({ ...node, data: newData });
  };

  const isLeafNode = !node.children || node.children.length === 0;

  return (
    <div className="nodeContainer" style={{ border: '2px solid #0081ff94', marginBottom: '10px' }}>
      <div className="nodeHeader">
        <button className="btn btn-secondary" style={{ width: '7%' }} onClick={toggleExpand}>
          {isExpanded ? 'v' : '>'}
        </button>
        <h6 style={{ margin: '0 10px' }}>{node.name}</h6>
        <button className="btn btn-secondary" style={{ width: '7%' }} onClick={addChild}>
          Add Child
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginLeft: '20px', paddingTop: '10px' }}>
          {isLeafNode && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
              <label style={{ marginRight: '8px' }}>Data:</label>
              <input
                type="text"
                value={data}
                onChange={handleDataChange}
                placeholder="Enter data"
                style={{ padding: '5px', width: '16%' }}
              />
            </div>
          )}

          {node.children &&
            node.children.map((childNode, index) => (
              <TreeNode key={index} node={childNode} onUpdate={(updatedChild) => {
                const newChildren = node.children.map((c, i) => i === index ? updatedChild : c);
                onUpdate({ ...node, children: newChildren });
              }} />
            ))}
        </div>
      )}
    </div>
  );
}

function TreeStructure() {
  const [rootNode, setRootNode] = useState({
    name: 'Root',
    data: 'Root Data',
    children: [],
  });

  const [exportData, setExportData] = useState(null); 
  useEffect(() => {
    axios.get('http://localhost:8080/api/tree')
      .then(response => {
        setRootNode(response.data); 
      })
      .catch(error => {
        console.error('There was an error fetching the tree data!', error);
      });
  }, []);

  const updateNodeData = (updatedNode) => {
    setRootNode(updatedNode); 
  };

  const handleExport = () => {
    const formatTreeData = (node) => {
      const newNode = { name: node.name };
      if (node.data) newNode.data = node.data;
      if (node.children && node.children.length > 0) {
        newNode.children = node.children.map(formatTreeData);
      }
      return newNode;
    };

    const treeData = formatTreeData(rootNode);
    setExportData(JSON.stringify({ tree: treeData })); 
  };

  const handleSave = () => {
    axios.post('http://localhost:8080/api/tree', rootNode)
      .then(response => {
        alert('Tree data saved successfully!');
      })
      .catch(error => {
        console.error('There was an error saving the tree data!', error);
      });
  };

  return (
    <div className="mainContainer">
      <div className="rootMainBox">
        <TreeNode node={rootNode} onUpdate={updateNodeData} />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleExport}
        style={{
          position: 'fixed',
          left: '10px',
          bottom: '10px',
          padding: '10px',
          fontSize: '16px',
        }}
      >
        Export
      </button>

      <button
        className="btn btn-success"
        onClick={handleSave}
        style={{
          position: 'fixed',
          left: '110px',
          bottom: '10px',
          padding: '10px',
          fontSize: '16px',
        }}
      >
        Save Tree
      </button>

      {exportData && (
        <div style={{ marginTop: '20px', padding: '10px' }}>
          <h6>Exported Tree Structure:</h6>
          <div 
            style={{
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word', 
              width: '100%', 
              maxWidth: '100%', 
              overflowWrap: 'break-word' 
            }}
          >
            {exportData}
          </div>
        </div>
      )}
    </div>
  );
}

export default TreeStructure;
