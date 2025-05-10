"use client"; 
import React, { useEffect, useState } from 'react'; 
import { ClimbingBoxLoader } from 'react-spinners'; 

const Home = () => {   
  const [interviews, setInterviews] = useState([]);   
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState(null);    

  useEffect(() => {     
    const fetchInterviews = async () => {       
      try {         
        const response = await fetch('/api/imap');          
        if (!response.ok) {           
          throw new Error('Failed to fetch interviews');         
        }         
        const data = await response.json();         
        setInterviews(data.interviews);       
      } catch (error) {         
        setError(error.message);       
      } finally {         
        setLoading(false);       
      }     
    };      

    fetchInterviews();   
  }, []);    

  if (loading) {     
    return (       
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-teal-400">          
        <ClimbingBoxLoader color="#fff" />       
      </div>     
    );   
  }    

  if (error) {     
    return <div className="text-center text-red-600 font-semibold">{`Error: ${error}`}</div>;   
  }    

  return (     
    <div className="min-h-screen bg-gradient-to-r from-green-200 via-teal-200 to-blue-200 py-10">       
      <div className="max-w-6xl mx-auto px-6">       
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-12">Upcoming Interviews</h1>       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">         
          {interviews.map((interview, index) => (           
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl duration-300 ease-in-out">             
              <h2 className="text-2xl font-semibold text-gray-800">{interview.subject}</h2>             
              <p className="text-gray-700 mt-2"><strong className="font-medium">Interviewer:</strong> {interview.interviewer}</p>             
              <p className="text-gray-700 mt-2"><strong className="font-medium">Interviewee:</strong> {interview.interviewee}</p>             
              <p className="text-gray-700 mt-2"><strong className="font-medium">Time:</strong> {interview.time}</p>             
              <p className="text-gray-700 mt-2"><strong className="font-medium">Link:</strong> 
                <a href={interview.link} className="text-blue-500 hover:text-blue-700 font-semibold" target="_blank" rel="noopener noreferrer">
                  {interview.link}
                </a>
              </p>             
              <p className="text-gray-700 mt-2"><strong className="font-medium">Participants:</strong> {interview.participants.join(', ')}</p>           
            </div>         
          ))}       
        </div>     
      </div>   
    </div>   
  ); 
};  

export default Home;
