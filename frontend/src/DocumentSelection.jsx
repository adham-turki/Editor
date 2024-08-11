import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDocuments, createDocument } from './documentsSlice';
import dayjs from 'dayjs';

function SelectDocument() {
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.documents);

  useEffect(() => {

    const fetchUserIdAndDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const userResponse = await fetch('http://localhost:1337/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (userResponse.status === 401) {
          localStorage.removeItem('token');
          navigate('/'); // Redirect to login if token is expired
          return;
        }

        const userData = await userResponse.json();
        console.log(userData);
        dispatch(fetchDocuments(userData.id));
      } catch (err) {
        console.error(err.message);
        navigate('/'); // Redirect to login on error
      }
    };

    fetchUserIdAndDocuments();
  }, [dispatch, navigate]);

  const handleSelectDocument = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/'); // Redirect to login page
  };

  const handleCreateDocument = () => {
    const token = localStorage.getItem('token');
    dispatch(createDocument({ userId: token, title: newDocumentTitle }));
    setNewDocumentTitle('');
  };

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r">
      <nav className="bg-blue-800 p-4 rounded-md mb-8 flex justify-between">
        <h1 className="text-white text-4xl font-sans">My Documents</h1>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </nav>
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="Document Title"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={handleCreateDocument}
          className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-purple-800"
        >
          Create Document
        </button>
      </div>
      <div className="bg-white p-8 rounded-lg h-screen shadow-xl">
        <h2 className="text-3xl font-semibold mb-6">Select Document</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleSelectDocument(doc.id)}
              className="bg-blue-800 w-64 p-6 rounded-lg text-white cursor-pointer shadow-lg transform hover:scale-105 transition-transform"
            >
              <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
              <p className="text-sm">Created: {dayjs(doc.createdAt).format('DD MMM YYYY')}</p>
              <p className="text-sm">Updated: {dayjs(doc.updatedAt).format('DD MMM YYYY')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectDocument;
