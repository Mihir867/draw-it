import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ImFileExcel } from 'react-icons/im';
import { FaPaintBrush } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';


// UploadComponent for file upload functionality
const UploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
  };


  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 md:p-8 m-10">
      <h1 className="text-lg font-semibold mb-4">Upload file</h1>
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 mb-4 flex justify-center items-center cursor-pointer relative">
        {!file ? (
          <label className="w-full text-center">
            <input
              type="file"
              accept=".jpeg, .jpg, .png"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-gray-500">
              <div className="flex justify-center mb-2">
                <ImFileExcel className="text-3xl" />
              </div>
              <p>Drag and Drop file here or <span className="text-blue-500 underline">Choose file</span></p>
              <p className="text-sm mt-1">Supported formats: JPEG, JPG, PNG</p>
              <p className="text-sm">Maximum size: 25MB</p>
            </div>
          </label>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <ImFileExcel className="text-green-500 text-3xl mr-4" />
              <div>
                <p>{file.name}</p>
                <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <FaTimes className="text-red-500 cursor-pointer" onClick={handleRemoveFile} />
          </div>
        )}
      </div>
      {file && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">{file.name}</p>
            <p className="text-sm text-gray-600">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button className="boton-elegante">Cancel</button>
        <button
          className={`boton-elegante2 ${progress === 100 ? 'opacity-100' : 'opacity-50'}`}
          disabled={progress < 100}
        >
          Upload
        </button>
      </div>
    </div>
  );
};

// CardsComponent for displaying two cards
const CardsComponent: React.FC = () => {
    
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  return (
    <>
    
    <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 md:p-12">
        <h1 className="text-lg font-semibold mb-4">Upload Sketch</h1>
        <div className="border-2 border-black rounded-lg p-10 mb-4 flex justify-center items-center cursor-pointer relative">
          <FaPaintBrush className='h-10 w-10' />
        </div>

        <div className="mt-6 flex justify-between">
          <button className="boton-elegante" onClick={handleOpenModal}>Join a Whiteboard</button>
          <button className="boton-elegante">Create Whiteboard</button>
        </div>
     

      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 relative">
                <button
                  className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-gray-800"
                  onClick={handleCloseModal}
                >
                  &times;
                </button>
                <h2 className="text-xl font-semibold mb-4">Join a WaitList</h2>
                <p className="text-gray-700">Please Enter the Id foor the room here</p>
                <input
    type="text"
    placeholder="Enter Room ID"
    className="border border-gray-300 rounded-lg w-full p-3 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
                <div className="mt-6">
                  <button
                    className="bg-blue-500 text-white px-4 font-bold py-2 rounded-lg hover:bg-blue-600"
                    onClick={handleCloseModal}
                  >
                    Close Modal
                  </button>
                  <button
                    className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg ml-10 hover:bg-blue-600"
                    onClick={handleCloseModal}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

// MainPage component that uses both UploadComponent and CardsComponent
const MainPage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center  justify-center min-h-screen bg-gray-100">
      {/* Upload Component */}
      <UploadComponent />

      {/* Cards Component */}
      <CardsComponent />
    </div>
  );
};

export default MainPage;
