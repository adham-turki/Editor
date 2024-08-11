import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { connectSocket, updateDocument, setContent } from './editorSlice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import './App.css';

function Editor() {
  const { documentId } = useParams();
  const dispatch = useDispatch();
  const content = useSelector((state) => state.editor.content);
  const socketRef = useRef(null); 

  useEffect(() => {
    // Fetch the document content when the component mounts
    const fetchDocument = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/documents/${documentId}`);
        const data = await response.json();
        console.log(data.data.attributes);
        dispatch(setContent(data.data.attributes?.content));
      } catch (error) {
        console.error('Failed to fetch document:', error);
      }
    };

    fetchDocument();

    socketRef.current = io('http://localhost:1337'); // Initialize socket connection

    socketRef.current.emit('join_room', documentId); // Join room for the document

    socketRef.current.on('document_update', (data) => {
      if (data.documentId === documentId) {
        dispatch(setContent(data.content)); // Update content in the Redux store
      }
    });

    dispatch(connectSocket()); // Dispatch connectSocket action

    return () => {
      socketRef.current.disconnect(); // Clean up on unmount
    };
  }, [documentId, dispatch]);

  const handleContentChange = (newContent) => {
    dispatch(updateDocument({ documentId, content: newContent })); // Update the document
    socketRef.current.emit('document_update', { documentId, content: newContent }); // Emit update
  };

  return (
    <div className="App">
      <div className="quill-editor">
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          placeholder="Start editing..."
          className="ql-container w-fit -mt-16"
        />
      </div>
    </div>
  );
}

export default Editor;
